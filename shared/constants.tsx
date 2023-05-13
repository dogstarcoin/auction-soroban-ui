// Injected from the `token-admin` account managed by soroban-cli. This is just
// for local development, so we can mint test tokens from the web UI. For a
// real application, you would *not* want to embed the secret into your web
// app!
const TokenAdmin = process.env.TOKEN_ADMIN_ADDRESS ?? ''

// Contract IDs, set up by ./initialize.sh
const RoundId = process.env.ROUND_ID ?? ''
const TokenId = process.env.TOKEN_ID ?? ''

const Constants = {
  RoundId,
  TokenAdmin,
  TokenId,
}

export { Constants }
