# Solana SPL-Token Sniper
## Overview
This project is Solana SPL-Token sniper which aims to swap (purchase) new Raydium liquidity pairs within the first price candle by scanning Solana blockchain transactions.
## How the program works
* Scans the Solana blockchain for an "initialize market" transaction which is decoded for all necessary liquidity pool keys and related information.
* Begins sending/retrying the "swap" transaction until the liquidity pool is live, minimizing the time between the transaction and the creation of the LP.
* Upon sending a valid transaction, begins to track the users position with current price/percent gain by scanning and decoding on-chain liquidity pool information in order to get the most accurate data.
## Setup
Use the following instructions to install and run the program (assume node is installed):
1. Create a Solana wallet and obtain public and private keys (Phantom wallet recommended).
2. Obtain a Solana RPC/websocket connection, can use `https://api.mainnet-beta.solana.com` and `wss://api.mainnet-beta.solana.com` for testing purposes.
3. Run `npm install`.
4. Inside the `utils/config.js` file, enter public key, private key, and both RPC connections. Also include amount of SOL to use per swap.
## Running the scripts
This project contains two different strategies for sniping new liquidity pairs:\
### **Strategy #1:**
* The first strategy obtains necessary liquidity pool keys from the transaction which creates the LP. To run this script with `node strategy1/start1.js`. The transaction may fail multiple times before succeeding as Solana transactions can be dropped with certain RPC nodes.
* **NOTE:** this script is slower as it must wait for the "add liquidity" transaction to reach "confirmed" status before obtaining pool data. This results in ~30 seconds between the pool creation and swap transaction.
### **Strategy #2:**
* The second strategy obtains necessary liquidity pool keys from the "initialize market" transaction which typically occurs ~2 minutes before the LP is live on Raydium. This allows for all pool keys to be precomputed. This script also retries the swap transaction multiple times per second which allows for the swap to be sent during the "processed" state of the "add liquidity" transaction instead of "confirmed", greatly reducing the time between the creation of the LP and the swap transaction. This script can be run with `node strategy2/start2.js`.
*Both scripts utilize the same swapping/position management system found in `./swap/swap1.js` and `/swap/swap2.js`.*
### **Additional Notes:**
* Once the program is started, an output will only be displayed once a new market id/pool is found.
* "the amm account owner is not match with this program + error 0x1b": This error occurs when the program sends a swap tx to a pool that doesn't have liquidity yet. The tx spam is part of the sniping strategy and the error will occur until the swap to the pool goes through (moment liquidity is added).
## Future improvements
1. **Automatic position exit strategy:** Implementing an automatic exit strategy based on user-specified parameters. Currently have to manually swap the tokens back to SOL.
2. **Rugpull prevention:** SPL-Token are often rugpulled after launch, prevent the purchase of tokens with low-liquidity and no social media pages.
3. **Reducing tx time:** Reduce time between LP creation and swap tx by utilizing a faster RPC connection and minimizing RPC calls before sending swap tx.
