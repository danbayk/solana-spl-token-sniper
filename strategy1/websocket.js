const web3 = require('@solana/web3.js')
const WebSocket = require('ws')
const swap = require('../swap/swap.js')
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const config = require('../utils/config.js');

const connection = config.connection;
const ws = new WebSocket(config.websocketConnection)
    ws.onopen = () => {
        ws.send(
            JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'blockSubscribe',
                params: [{"mentionsAccountOrProgram": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"}, {"commitment": "confirmed", "maxSupportedTransactionVersion": 0, "encoding": "jsonParsed"}]
            })
        )
    }

ws.on('message', (evt) => {
    try {
        const buffer = evt.toString('utf8');
        parseBlock(JSON.parse(buffer));
        return;
    } catch (e) {
        console.log(e)
    }
})

function isStatusError(status){
    if(status.hasOwnProperty('Err')){
        return true;
    }
    else if(status.hasOwnProperty('Ok')){
        return false;
    }
}

async function getTx(tx){
    return await connection.getTransaction(tx, {
        "commitment": "confirmed",
        "maxSupportedTransactionVersion": 0,
        "encoded": "jsonParsed"
    })
}

let swapped = false;
function parseBlock(transaction){
    try{
        const tx = transaction.params.result.value.block.transactions;
        for(let i = 0; i < tx.length; i++){
            if(tx[i].meta.innerInstructions !== undefined && tx[i].meta.innerInstructions.length !== 0){
                if(tx[i].meta.innerInstructions[0].instructions.length === 32 && !isStatusError(tx[i].meta.status)){
                    const signature = tx[i].transaction.signatures[0];
                    console.log(tx[i].transaction.signatures);
                    if(swapped === false){
                        swapped = true;
                        let now = new Date();
                        let utcString = now.toUTCString();
                        console.log(utcString);
                        ws.close();
                    }
                }
            }
    }
    } catch(error){
        console.log("searching...")
    }
}

async function getJsonPoolInfo(tx){
    // market account
    const marketAccount = await connection.getAccountInfo(new web3.PublicKey(tx.transaction.message.accountKeys[19].pubkey));
    const marketInfo = raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
    // get decimals
    const getTokenAccount = await connection.getParsedAccountInfo(new web3.PublicKey(tx.transaction.message.accountKeys[17].pubkey));
    const decimals = getTokenAccount.value.data.parsed.info.decimals;
    // create poolKeys object
    const keys = {
        id: tx.transaction.message.accountKeys[2].pubkey,
        baseMint: tx.transaction.message.accountKeys[17].pubkey,
        quoteMint: 'So11111111111111111111111111111111111111112',
        lpMint: tx.transaction.message.accountKeys[4].pubkey,
        baseDecimals: decimals,
        quoteDecimals: 9,
        lpDecimals: decimals,
        version: 4,
        programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        authority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        openOrders: tx.transaction.message.accountKeys[3].pubkey,
        targetOrders: tx.transaction.message.accountKeys[7].pubkey,
        baseVault: tx.transaction.message.accountKeys[5].pubkey,
        quoteVault: tx.transaction.message.accountKeys[6].pubkey,
        withdrawQueue: '11111111111111111111111111111111',
        lpVault: '11111111111111111111111111111111',
        marketVersion: 3,
        marketProgramId: tx.transaction.message.accountKeys[22].pubkey,
        marketId: tx.transaction.message.accountKeys[19].pubkey,
        marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({ programId: new web3.PublicKey(tx.transaction.message.accountKeys[22].pubkey), marketId: new web3.PublicKey(tx.transaction.message.accountKeys[19].pubkey) }).publicKey.toString(),
        marketBaseVault: marketInfo.baseVault.toString(),
        marketQuoteVault: marketInfo.quoteVault.toString(),
        marketBids: marketInfo.bids.toString(),
        marketAsks: marketInfo.asks.toString(),
        marketEventQueue: marketInfo.eventQueue.toString(),
        lookupTableAccount: '11111111111111111111111111111111'
    }
    // convert poolKeys object to JSON
    const jsonPoolKeys = raydium_sdk_1.jsonInfo2PoolKeys(keys);
    swap.swap(jsonPoolKeys, tx.transaction.message.accountKeys[17].pubkey);
}