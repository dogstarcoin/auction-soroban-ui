#![no_std]
mod errors;

use crate::errors::ContractError;
use soroban_sdk::{
    contractimpl, contracttype, map, panic_with_error, unwrap::UnwrapOptimized, vec, Address,
    BytesN, Env, Map, Vec,
};

mod token {
    soroban_sdk::contractimport!(file = "../token/soroban_token_spec.wasm");
}

mod test;
mod testutils;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Bidders,
    Admin,
    Deadline,
    BannerId,
    Banner(u32),
    Token,
    Fee,
    Reward,
    Balance,
    Players,
    Total,
    Fund,
}

#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum State {
    Running = 0,
    Expired = 1,
}

fn get_ledger_timestamp(e: &Env) -> u64 {
    e.ledger().timestamp()
}

fn get_deadline(e: &Env) -> u64 {
    e.storage()
        .get(&DataKey::Deadline)
        .expect("not initialized")
        .unwrap()
}

fn get_token(e: &Env) -> BytesN<32> {
    e.storage()
        .get(&DataKey::Token)
        .expect("not initialized")
        .unwrap()
}

fn get_fee(e: &Env) -> u32 {
    e.storage()
        .get(&DataKey::Fee)
        .expect("not initialized")
        .unwrap()
}

fn get_reward(e: &Env) -> u32 {
    e.storage()
        .get(&DataKey::Reward)
        .expect("not initialized")
        .unwrap()
}

fn get_total(e: &Env) -> i128 {
    e.storage()
        .get(&DataKey::Total)
        .unwrap_or(Ok(0i128))
        .unwrap_optimized()
}

fn set_admin(e: &Env, id: Address) {
    let key = DataKey::Admin;
    e.storage().set(&key, &id);
}

fn get_admin(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().get_unchecked(&key).unwrap()
}

fn auth_admin(e: &Env, admin: Address) -> Result<(), ContractError> {
    if get_admin(e) != admin {
        return Err(ContractError::InvalidAdminAuth);
    }
    admin.require_auth();
    Ok(())
}

fn get_and_inc_banner_id(env: &Env) -> u32 {
    let prev = env
        .storage()
        .get(&DataKey::BannerId)
        .unwrap_or(Ok(0u32))
        .unwrap_optimized();

    env.storage().set(&DataKey::BannerId, &(prev + 1));
    prev + 1
}

fn get_state(env: &Env) -> State {
    let deadline = get_deadline(env);
    let current_timestamp = get_ledger_timestamp(env);

    if current_timestamp < deadline {
        return State::Running;
    };

    State::Expired
}

fn is_bidder_authorized(e: &Env, user: &Address) -> bool {
    let bidders: Vec<Address> = get_bidders(&e);

    if bidders.contains(user) {
        return true;
    }

    false
}

fn get_bidders(e: &Env) -> Vec<Address> {
    e.storage()
        .get(&DataKey::Bidders)
        .unwrap_or(Ok(vec![&e]))
        .unwrap()
}

fn get_prev_bid(banner: &Banner, user: Address) -> i128 {
    let bid: i128 = banner.bids.get(user).unwrap_or(Ok(0)).unwrap_optimized();
    bid
}

fn get_banner(e: &Env, banner_id: u32) -> Banner {
    let banner: Banner = e
        .storage()
        .get(&DataKey::Banner(banner_id))
        .unwrap_or_else(|| panic_with_error!(e, ContractError::InvalidBannerId))
        .unwrap_optimized();
    banner
}

// Transfer tokens from the contract to the bidder
fn transfer(e: &Env, to: &Address, amount: &i128) {
    let token_contract_id = &get_token(e);
    let client = token::Client::new(e, token_contract_id);
    client.xfer(&e.current_contract_address(), to, amount);
}

fn get_balance(e: &Env) -> i128 {
    let contract_id = &get_token(e);
    let client = token::Client::new(e, contract_id);
    client.balance(&e.current_contract_address())
}

fn get_players(e: &Env) -> Map<Address, bool> {
    e.storage()
        .get(&DataKey::Players)
        .unwrap_or(Ok(map![&e]))
        .unwrap()
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Banner {
    pub minimum_bid: i128,
    pub best_bid: i128,
    pub close_price: i128,
    pub bids: Map<Address, i128>,
}

/*
TO DO: Storage time user's last bid 
pub struct Bid {
    pub last_bid: u64,
    pub bids: i128,
}
*/
struct Round;

/*
How to use this contract to run a Round
Call initialize( deadline_unix_epoch, bidders, token,admin).
*/
#[contractimpl]
#[allow(clippy::needless_pass_by_value)]
impl Round {
    pub fn initialize(
        e: Env,
        deadline: u64,
        bidders: Vec<Address>,
        token: BytesN<32>,
        admin: Address,
        fee: u32,
        reward: u32,
    ) {
        e.storage().set(&DataKey::Deadline, &deadline);
        e.storage().set(&DataKey::Token, &token);
        e.storage().set(&DataKey::Bidders, &bidders);
        e.storage().set(&DataKey::Admin, &admin);
        e.storage().set(&DataKey::Fee, &fee);
        e.storage().set(&DataKey::Reward, &reward);
    }

    pub fn balance(e: Env) -> i128 {
        get_balance(&e)
    }

    pub fn get_minimum_bid(e: Env, banner_id: u32) -> i128 {
        get_banner(&e, banner_id).minimum_bid
    }

    pub fn get_close_price(e: Env, banner_id: u32) -> i128 {
        get_banner(&e, banner_id).close_price
    }

    pub fn get_banner(e: Env, banner_id: u32) -> Banner {
        let banner = get_banner(&e, banner_id);
        banner
    }

    pub fn get_banner_winner(e: Env, banner_id: u32) -> i128 {
        let banner: Banner = get_banner(&e, banner_id);

        banner.best_bid
    }

    pub fn deadline(e: Env) -> u64 {
        get_deadline(&e)
    }

    pub fn fee(e: Env) -> u32 {
        get_fee(&e)
    }

    pub fn reward(e: Env) -> u32 {
        get_reward(&e)
    }

    pub fn total(e: Env) -> i128 {
        get_total(&e)
    }

    pub fn state(e: Env) -> u32 {
        get_state(&e) as u32
    }

    pub fn add_bidder(e: Env, bidder: Address) -> Result<(), ContractError> {
        //only admin is allowed to include bidder
        auth_admin(&e, get_admin(&e))?;

        let mut bidders: Vec<Address> = get_bidders(&e);

        if !bidders.contains(&bidder) {
            bidders.push_back(bidder);
        }

        e.storage().set(&DataKey::Bidders, &bidders);

        Ok(())
    }
    pub fn add_admin(e: Env, user: Address, admin: Address) -> Result<u32, ContractError> {
        auth_admin(&e, admin)?;
        set_admin(&e, user);
        Ok(0)
    }

    pub fn add_banner(e: Env, banner: Banner, user: Address) -> Result<u32, ContractError> {
        auth_admin(&e, user)?;

        let banner_id = get_and_inc_banner_id(&e);
        e.storage().set(&DataKey::Banner(banner_id), &banner);

        Ok(banner_id)
    }

    pub fn add_banner_props(
        e: Env,
        minimun_bid: i128,
        close_price: i128,
        user: Address,
    ) -> Result<u32, ContractError> {
        auth_admin(&e, user.clone())?;

        let banner = Banner {
            minimum_bid: minimun_bid,
            best_bid: 0,
            close_price: close_price,
            bids: map![&e, (user.clone(), 0)],
        };

        let banner_id = get_and_inc_banner_id(&e);
        e.storage().set(&DataKey::Banner(banner_id), &banner);

        Ok(banner_id)
    }

    pub fn add_player(e: Env, admin: Address, user: Address) -> Result<u32, ContractError> {
        auth_admin(&e, admin.clone())?;

        let mut players: Map<Address, bool> = get_players(&e);

        if !players.contains_key(user.clone()) {
            players.set(user.clone(), false);
            e.storage().set(&DataKey::Players, &players);
        }

        Ok(0)
    }

    pub fn claim_player_funds(e: Env, admin: Address, user: Address) -> Result<u32, ContractError> {
        auth_admin(&e, admin.clone())?;

        if get_state(&e) == State::Running {
            panic_with_error!(e, ContractError::BidOutOfTime);
        }

        let mut players: Map<Address, bool> = get_players(&e);

        if players.contains_key(user.clone()) {
            let funded: bool = players
                .get(user.clone())
                .unwrap_or(Ok(false))
                .unwrap_optimized();

            if funded == false {
                let total_players: i128 = players.len() as i128;
                let funds: i128 = (get_total(&e)
                    * (100 - get_fee(&e) as i128 - get_reward(&e) as i128))
                    / 100
                    / total_players;

                e.storage().set(&DataKey::Fund, &funds);

                players.set(user.clone(), true);
                e.storage().set(&DataKey::Players, &players);
                transfer(&e, &user, &funds);
            }
        }

        Ok(0)
    }

    pub fn claim_admin_funds(e: Env, admin: Address, user: Address) -> Result<u32, ContractError> {
        auth_admin(&e, admin)?;

        let funds: i128 =
            (get_total(&e) as i128 * (get_fee(&e) as i128 + get_reward(&e) as i128)) / 100;
        transfer(&e, &user, &funds);

        Ok(0)
    }

    pub fn bid(e: Env, banner_id: u32, amount: i128, user: Address) {
        user.require_auth();
        assert!(amount > 0, "amount must be positive");

        if get_state(&e) != State::Running {
            panic_with_error!(e, ContractError::BidOutOfTime);
        }

        if !is_bidder_authorized(&e, &user) {
            panic_with_error!(e, ContractError::BidderNotAuthorized);
        }

        let mut banner: Banner = get_banner(&e, banner_id);

        if banner.best_bid >= banner.close_price {
            panic_with_error!(e, ContractError::AuctionFinished);
        }

        let prev_bid = get_prev_bid(&banner, user.clone());
        let mut total: i128 = get_total(&e);

        if prev_bid == 0 {
            if amount > banner.minimum_bid && amount > banner.best_bid {
                let _ = &banner.bids.set(user.clone(), amount);
                total -= banner.best_bid;
                banner.best_bid = amount;
            } else {
                panic_with_error!(e, ContractError::UnderBid)
            }
        } else {
            //sc allow rebid to increase user previous bid
            if prev_bid + amount < banner.best_bid {
                panic_with_error!(e, ContractError::UnderBid)
            } else {
                let _ = &banner.bids.set(user.clone(), &prev_bid + amount);
                total -= banner.best_bid;
                banner.best_bid = &prev_bid + amount;
            }
        }

        total += banner.best_bid;
        e.storage().set(&DataKey::Total, &total);
        e.storage().set(&DataKey::Banner(banner_id), &banner);

        let client = token::Client::new(&e, &get_token(&e));
        client.xfer(&user, &e.current_contract_address(), &amount);
    }

    pub fn claim_advertiser_funds(e: Env, banner_id: u32, user: Address) {
        user.require_auth();

        if !is_bidder_authorized(&e, &user) {
            panic_with_error!(e, ContractError::BidderNotAuthorized);
        }

        let banner: Banner = get_banner(&e, banner_id);

        let user_bid = get_prev_bid(&banner, user.clone());

        if &user_bid != &banner.best_bid {
            transfer(&e, &user, &user_bid);
        }
    }
}
