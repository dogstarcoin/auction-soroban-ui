#![cfg(test)]

extern crate std;

use super::testutils::{register_test_contract as register_round, Round};
use super::token::Client as Token;
use crate::Banner;
use soroban_sdk::{
    map,
    testutils::{Address as AddressTestTrait, Ledger},
    vec, Address, BytesN, Env, Vec,
};

fn create_round_contract(
    e: &Env,
    deadline: &u64,
    bidders: &Vec<Address>,
    token: &BytesN<32>,
    admin: Address,
    fee: u32,
    reward: u32,
) -> (BytesN<32>, Round) {
    let id = register_round(e);
    let round = Round::new(e, &id.clone().into());
    round
        .client()
        .initialize(&deadline, &bidders, &token, &admin, &fee, &reward);
    (id, round)
}

fn advance_ledger(e: &Env, delta: u64) {
    e.ledger().with_mut(|l| {
        l.timestamp += delta;
    });
}

struct Setup {
    env: Env,
    admin2: Address,
    user1: Address,
    user2: Address,
    user3: Address,
    banner_id: u32,
    round: Round,
    token: Token,
}

impl Setup {
    fn new() -> Self {
        let e: Env = soroban_sdk::Env::default();
        let admin = Address::random(&e);
        let admin2 = Address::random(&e);
        let user1 = Address::random(&e);
        let user2 = Address::random(&e);
        let user3 = Address::random(&e);

        // the deadline is 10 seconds from now
        let deadline = e.ledger().timestamp() + 10;

        // Create the token contract
        let token_admin = Address::random(&e);
        let contract_token = e.register_stellar_asset_contract(token_admin.clone());
        let token = Token::new(&e, &contract_token);

        //mint tokens for user 2
        token.mint(&token_admin, &user2, &300);
        token.mint(&token_admin, &user1, &300);

        // Create the round contract
        let (_, round) = create_round_contract(
            &e,
            &deadline,
            &vec![&e, user1.clone()],
            &token.contract_id,
            admin.clone(),
            2,
            2,
        );

        round.client().add_admin(&admin2, &admin);

        let banner = Banner {
            minimum_bid: 10,
            best_bid: 0,
            close_price: 250,
            bids: map![&e, (admin2.clone(), 0)],
        };

        let banner_id = round.client().add_banner(&banner, &admin2.clone());

        Self {
            env: e,
            admin2,
            user1,
            user2,
            user3,
            banner_id,
            round,
            token,
        }
    }
}

#[test]
fn test_success() {
    let setup = Setup::new();

    assert_eq!(setup.round.client().get_banner_winner(&setup.banner_id), 0);

    setup.round.client().add_bidder(&setup.user2.clone());

    setup
        .round
        .client()
        .bid(&setup.banner_id, &150, &setup.user2.clone());

    assert_eq!(&setup.token.balance(&setup.user2), &150);

    //check best bid after first bid
    assert_eq!(
        setup.round.client().get_banner_winner(&setup.banner_id),
        150
    );

    //check loser bid can claim funds
    setup
        .round
        .client()
        .bid(&setup.banner_id, &200, &setup.user1.clone());

    setup
        .round
        .client()
        .claim_advertiser_funds(&setup.banner_id, &setup.user2.clone());

    assert_eq!(&setup.token.balance(&setup.user2), &300);
}

#[test]
fn test_success_players() {
    let setup = Setup::new();

    setup.round.client().add_bidder(&setup.user2.clone());

    // check total funds are correct
    let banner2 = Banner {
        minimum_bid: 20,
        best_bid: 0,
        close_price: 60000,
        bids: map![&setup.env, (setup.admin2.clone(), 0)],
    };

    setup
        .round
        .client()
        .add_banner(&banner2, &setup.admin2.clone());

    setup
        .round
        .client()
        .bid(&setup.banner_id, &200, &setup.user1.clone());

    setup.round.client().bid(&2, &100, &setup.user2.clone());

    assert_eq!(setup.round.client().total(), 300);

    // add a player and claim funds after auction expire
    setup
        .round
        .client()
        .add_player(&setup.admin2.clone(), &setup.user2.clone());

    advance_ledger(&setup.env, 11);

    setup
        .round
        .client()
        .claim_player_funds(&setup.admin2.clone(), &setup.user2.clone());

    assert_eq!(&setup.token.balance(&setup.user2), &488);
}

#[test]
#[should_panic(expected = "Status(ContractError(0))")]
fn auction_expired() {
    let setup = Setup::new();
    advance_ledger(&setup.env, 11);

    setup
        .round
        .client()
        .bid(&setup.banner_id, &150, &setup.user2.clone());
}

#[test]
#[should_panic(expected = "Status(ContractError(1))")]
fn bidder_not_authorized() {
    let setup = Setup::new();

    setup
        .round
        .client()
        .bid(&setup.banner_id, &150, &setup.user3.clone());
}

#[test]
#[should_panic(expected = "Status(ContractError(3))")]
fn bid_under_minimum() {
    let setup = Setup::new();

    setup
        .round
        .client()
        .bid(&setup.banner_id, &5, &setup.user1.clone());
}

#[test]
#[should_panic(expected = "Status(ContractError(2))")]
fn bid_invalid_banner() {
    let setup = Setup::new();

    setup.round.client().bid(&10, &150, &setup.user1.clone());
}

#[test]
#[should_panic(expected = "Status(ContractError(4))")]
fn user_not_admin() {
    let setup = Setup::new();

    let banner = Banner {
        minimum_bid: 10,
        best_bid: 0,
        close_price: 500000,
        bids: map![&setup.env, (setup.admin2.clone(), 0)],
    };

    setup
        .round
        .client()
        .add_banner(&banner, &setup.user1.clone());
}

#[test]
#[should_panic(expected = "Status(ContractError(5))")]
fn auction_finished() {
    let setup = Setup::new();

    setup.round.client().add_bidder(&setup.user2.clone());

    setup
        .round
        .client()
        .bid(&setup.banner_id, &250, &setup.user2.clone());

    setup
        .round
        .client()
        .bid(&setup.banner_id, &50, &setup.user2.clone());
}
