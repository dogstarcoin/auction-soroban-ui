Dogstar League Soroban Auction Dapp  
===================================

This repository contains the  Soroban Dapp to manage the ad banners's auction for sponsoring  a round of the Dogstar League.

The dapp is composed by a nextjs web ui and the smart contracts. 

Auction smart contract provide the following features:

- Start a round by deploying smart contract and invoke initialize function. This function requires:
    -   Deadline, epox timestamp when auction expires 
    -   Bidders address list. Advertisers address approved to bid in the auction
    -   Token to bond to the round. The bids will be made with this token 
    -   Admin, user allowed to add new  banners, bidders and admin users
    -   Fee, percentage set up as a fee 
    -   Reward, percentage set up to award round winners

- Add admin user, role with presmission to add banners, bidders and new admin user
- Add auction's banners and set up: 
    - Minimum bid amount 
    - Close price 
- Add approved round bidders
- Bid for a banner. The bid function provide:
    - Send a bid for a banner 
    - Allow bidders to rebid (increase previous bid only if the sum of the new bid plus the user's previous becomes the best bid) 
    - The bids will be store in the banner the best bid and a list with the best bids of each bidder  
    - The total funds available to be claimed as player participation, fees and reward. This total exclude the loser bids. 
    - The total funds collected in the smart contract including loser bids. 

- Register the player that can claim the funds collected in the auction 
- Claim function that allows players collect funds to particpate in the Dogstar League  
- Claim function that that allows advertisers recover non winner bids 

TO DO: 

- Register last bid time  
- Customer Area for advertisers
- Refactor to reuse smart contract reading calls 
- Display list of last bids 
- Update to Nextjs 13 
- UI improvements 


**Note:** User address is required so bid can take place if the address hold  tokens and has been approved by the admin 

User Workflows
==============

The contract dev should be able to:

- Clone the example repo (this one)
- Choose their deadline, approved bidders, token, admin user, fee and reward
- Deploy their contract to futurenet
- Add Banners. Admin user can add any banner before auction expires  
- Add  appoved bidders (Only for Admin user)
- Add new admin users (Only for Admin user)
- Deploy a soroban rpc server somewhere (TBD)
- Run test 

        cargo test 


Then via the web UI, users should be able to:

- Connect their wallet (freighter for now)
- See the banners available to bid in the auction 
- Se the reaminng time to bid 
- See the best bid, minimum bid and close price 
- See allowed assets
- Bid an allowed asset
- Bid for the close price 




Getting Started
===============

Install Dependencies
--------------------

1. `soroban-cli v0.7.1`. See https://soroban.stellar.org/docs/getting-started/setup#install-the-soroban-cli
2. `docker` (both Standalone and Futurenet backends require it).
3. `Node.js v17`
4. `Freighter wallet v4.0.1`. Download it from https://github.com/stellar/freighter/releases/tag/4.0.1 and Enable "Experimental Mode" in the settings (gear icon).

5. Build the `soroban-preview` docker image:

       make build-docker

   Building the docker image lets you avoid installing the specific version of soroban-cli in step (1), if desired.

Run Backend
-----------

You have two options: 1. run in [localnet/standalone](https://soroban.stellar.org/docs/getting-started/deploy-to-a-local-network) mode, or 2. run on [Futurenet](https://soroban.stellar.org/docs/getting-started/deploy-to-futurenet)

### Option 1: Localnet/Standalone

0. If you didn't yet, build the `soroban-preview` docker image, as described above:

       make build-docker

1. In one terminal, run the backend docker containers and wait for them to start:

       ./quickstart.sh standalone

   You know that it fully started if it goes into a loop publishing & syncing checkpoints.

   You can stop this process with <kbd>ctrl</kbd><kbd>c</kbd>

2. Keep that running, then deploy the contracts and initialize them:

   You can use your own local soroban-cli:

       ./initialize.sh standalone
    
    To run this script you should provide an address as approved bidder 

   Or run it inside the soroban-preview docker container:

       docker exec soroban-preview ./initialize.sh standalone

   **Note:** this state will be lost if the quickstart docker container is removed, which will happen if you stop the `quickstart.sh` process. You will need to re-run `./initialize.sh` every time you restart the container.

3. Add the Standalone custom network in Freighter

   |   |   |
   |---|---|
   | Name | Standalone |
   | URL | http://localhost:8000/soroban/rpc |
   | Passphrase | Standalone Network ; February 2017 |
   | Allow HTTP connection | Enabled |
   | Switch to this network | Enabled |

4. Add some Standalone network lumens to your Freighter wallet.

   1. Copy the address for your freighter wallet.
   2. Visit `http://localhost:8000/friendbot?addr=<your address>`

### Option 2: Futurenet

1. Run the backend docker container with `./quickstart.sh futurenet`, and wait for it to start.

   **Note:** This can take up to 5 minutes to start syncing. You can tell it is
   working by visiting http://localhost:8000/, and look at the
   `ingest_latest_ledger`, field. If it is `0`, the quickstart image is not
   ready yet.

2. Load the contracts and initialize them

   Use your own local soroban-cli:

       ./initialize.sh futurenet

    To run this script you should provide an address as approved bidder 

   Or run it inside the soroban-preview docker container:

       docker exec soroban-preview ./initialize.sh futurenet

3. Add the Futurenet custom network in Freighter (Note, the out-of-the-box
   "Future Net" network in Freighter will not work with a local quickstart
   container, so we need to add our own):

   |   |   |
   |---|---|
   | Name | Futurenet Local RPC|
   | URL | http://localhost:8000/soroban/rpc |
   | Passphrase | Test SDF Future Network ; October 2022 |
   | Allow HTTP connection | Enabled |
   | Switch to this network | Enabled |

4. Add some Futurenet network lumens to your Freighter wallet.

   Visit https://laboratory.stellar.org/#create-account, and follow the instructions to create your freighter account on Futurenet.


Frontend
--------

Now that you're running the backend, you can run the development server:

    npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Note:** Before you can "Bid", you'll need to have some DLTK (example
token) in your freighter wallet.