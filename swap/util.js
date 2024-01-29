"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepTime = exports.getATAAddress = exports.buildAndSendTx = exports.getWalletTokenAccount = exports.sendTx = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("./config");
function sendTx(connection, payer, txs, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const txids = [];
        for (const iTx of txs) {
            if (iTx instanceof web3_js_1.VersionedTransaction) {
                iTx.sign([payer]);
                txids.push(yield connection.sendTransaction(iTx, options));
            }
            else {
                txids.push(yield connection.sendTransaction(iTx, [payer], options));
            }
        }
        return txids;
    });
}
exports.sendTx = sendTx;
function getWalletTokenAccount(connection, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletTokenAccount = yield connection.getTokenAccountsByOwner(wallet, {
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
        });
        return walletTokenAccount.value.map((i) => ({
            pubkey: i.pubkey,
            programId: i.account.owner,
            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data),
        }));
    });
}
exports.getWalletTokenAccount = getWalletTokenAccount;
function buildAndSendTx(innerSimpleV0Transaction, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const willSendTx = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection: config_1.connection,
            makeTxVersion: config_1.makeTxVersion,
            payer: config_1.wallet.publicKey,
            innerTransactions: innerSimpleV0Transaction,
            addLookupTableInfo: config_1.addLookupTableInfo,
        });
        return yield sendTx(config_1.connection, config_1.wallet, willSendTx, options);
    });
}
exports.buildAndSendTx = buildAndSendTx;
function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = (0, raydium_sdk_1.findProgramAddress)([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"));
    return { publicKey, nonce };
}
exports.getATAAddress = getATAAddress;
function sleepTime(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log((new Date()).toLocaleString(), 'sleepTime', ms);
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
exports.sleepTime = sleepTime;
//# sourceMappingURL=util.js.map