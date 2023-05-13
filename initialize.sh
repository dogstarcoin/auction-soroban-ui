#!/bin/bash

set -e

NETWORK="$1"


if [[ "$IS_USING_DOCKER" == "true" ]]; then
  SOROBAN_RPC_HOST="http://stellar:8000"
else
  SOROBAN_RPC_HOST="http://localhost:8000"
fi

SOROBAN_RPC_URL="$SOROBAN_RPC_HOST/soroban/rpc"

case "$1" in
standalone)
  echo "Using standalone network"
  SOROBAN_NETWORK_PASSPHRASE="Standalone Network ; February 2017"
  FRIENDBOT_URL="$SOROBAN_RPC_HOST/friendbot"
  ;;
futurenet)
  echo "Using Futurenet network"
  SOROBAN_NETWORK_PASSPHRASE="Test SDF Future Network ; October 2022"
  FRIENDBOT_URL="https://friendbot-futurenet.stellar.org/"
  ;;
*)
  echo "Usage: $0 standalone|futurenet"
  exit 1
  ;;
esac

#if !(soroban config network ls | grep "$NETWORK" 2>&1 >/dev/null); then
# Always set a net configuration 
  echo Add the $NETWORK network to cli client
  soroban config network add "$NETWORK" \
    --rpc-url "$SOROBAN_RPC_URL" \
    --network-passphrase "$SOROBAN_NETWORK_PASSPHRASE"
#fi

if !(soroban config identity ls | grep token-admin 2>&1 >/dev/null); then
  echo Create the token-admin identity
  soroban config identity generate token-admin
fi
TOKEN_ADMIN_SECRET="$(soroban config identity show token-admin)"
TOKEN_ADMIN_ADDRESS="$(soroban config identity address token-admin)"

echo "$TOKEN_ADMIN_SECRET" > .soroban/token_admin_secret
echo "$TOKEN_ADMIN_ADDRESS" > .soroban/token_admin_address

# This will fail if the account already exists, but it'll still be fine.
echo Fund token-admin account from friendbot
curl --silent -X POST "$FRIENDBOT_URL?addr=$TOKEN_ADMIN_ADDRESS" >/dev/null


ARGS="--network $NETWORK --source token-admin"

echo Wrap the Stellar asset
mkdir -p .soroban
TOKEN_ID=$(soroban lab token wrap $ARGS --asset "DLTK:$TOKEN_ADMIN_ADDRESS")
echo "Token wrapped succesfully with TOKEN_ID: $TOKEN_ID"

echo -n "$TOKEN_ID" > .soroban/token_id

echo Build the round contract
make build

echo Deploy the round contract
round_ID="$(
  soroban contract deploy $ARGS \
    --wasm target/wasm32-unknown-unknown/release/soroban_round_contract.wasm
)"
echo "$round_ID" > .soroban/round_id

echo "Contract deployed succesfully with ID: $round_ID"

echo $ARGS
echo "Initialize the round contract"
deadline="$(($(date +"%s") + 86400))"
soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_round_contract.wasm \
  --id "$round_ID" \
  -- \
  initialize \
  --deadline "$deadline" \
  --bidders '["ADDRESS_BIDDER"]' \
  --token "$TOKEN_ID" \
  --admin "$TOKEN_ADMIN_ADDRESS" \
  --fee 2 \
  --reward 2


soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_round_contract.wasm \
  --id "$round_ID" \
  -- \
  add_banner_props \
  --minimun_bid  80 \
  --close_price 8000 \
  --user  "$TOKEN_ADMIN_ADDRESS"

  soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_round_contract.wasm \
  --id "$round_ID" \
  -- \
  add_banner_props \
  --minimun_bid  70 \
  --close_price 7000 \
  --user  "$TOKEN_ADMIN_ADDRESS"



  soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_round_contract.wasm \
  --id "$round_ID" \
  -- \
  add_banner_props \
  --minimun_bid  50 \
  --close_price 5000 \
  --user  "$TOKEN_ADMIN_ADDRESS"  


echo "Done"
