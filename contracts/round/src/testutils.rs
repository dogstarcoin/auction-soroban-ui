#![cfg(test)]

use crate::RoundClient;

use soroban_sdk::{BytesN, Env};

pub fn register_test_contract(e: &Env) -> BytesN<32> {
    e.register_contract(None, crate::Round {})
}

pub struct Round {
    env: Env,
    contract_id: BytesN<32>,
}

impl Round {
    #[must_use]
    pub fn client(&self) -> RoundClient {
        RoundClient::new(&self.env, &self.contract_id)
    }

    #[must_use]
    pub fn new(env: &Env, contract_id: &[u8; 32]) -> Self {
        Self {
            env: env.clone(),
            contract_id: BytesN::from_array(env, contract_id),
        }
    }
}
