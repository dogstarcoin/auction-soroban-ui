use soroban_sdk::contracttype;

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
