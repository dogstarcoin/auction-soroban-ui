use crate::data_keys::DataKey;
use crate::errors::ContractError;
use soroban_sdk::{contracttype, panic_with_error, unwrap::UnwrapOptimized, Address, Env, Map};

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

pub fn get_and_inc_banner_id(env: &Env) -> u32 {
    let prev = env
        .storage()
        .get(&DataKey::BannerId)
        .unwrap_or(Ok(0u32))
        .unwrap_optimized();

    env.storage().set(&DataKey::BannerId, &(prev + 1));
    prev + 1
}

pub fn get_banner(e: &Env, banner_id: u32) -> Banner {
    let banner: Banner = e
        .storage()
        .get(&DataKey::Banner(banner_id))
        .unwrap_or_else(|| panic_with_error!(e, ContractError::InvalidBannerId))
        .unwrap_optimized();
    banner
}
