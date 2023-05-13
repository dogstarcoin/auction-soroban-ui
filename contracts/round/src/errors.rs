use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    BidOutOfTime = 0,
    BidderNotAuthorized = 1,
    InvalidBannerId = 2,
    UnderBid = 3,
    InvalidAdminAuth = 4,
    AuctionFinished = 5,
}
