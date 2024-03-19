const web3 = require('@solana/web3.js');
const WebSocket = require('ws');
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const bs64 = require('bs64');
const config = require('./config');

const connection = config.connection;

const feeAddress = '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
const rayProgram = new web3.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');

const ws = new WebSocket(config.websocketConnection)
    ws.onopen = () => {
        ws.send(
            JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'logsSubscribe',
                params: [{"mentions": [feeAddress]}, {"commitment": "processed"}]
            })
        )
    }

ws.on('message', (evt) => {
    try {
        const buffer = evt.toString('utf8');
        parseLogs(JSON.parse(buffer));
        return;
    } catch (e) {
        console.log(e)
    }
})

function parseLogs(buffer){
    if(buffer.params === undefined){
        return;
    }
    let now = new Date();
    let utcString = now.toUTCString();
    console.log(utcString);
    const allLogs = buffer.params.result.value.logs;
    for(const log of allLogs){
        if(log.includes("ray_log")){
            const rayLogSplit = log.split(" ");
            const rayLog = rayLogSplit[3];
            const logData = Buffer.from(rayLog, "base64");
            const market = new web3.PublicKey(logData.subarray(75 - 32), 75);
            console.log(market)
            const pool = raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), market.toBuffer(), Buffer.from('amm_associated_seed', 'utf-8')], rayProgram)['publicKey'];
            console.log(pool);
        }
    }
}