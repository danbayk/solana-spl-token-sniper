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
exports.formatAmmKeysById = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("../utils/config");
function formatAmmKeysById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const account = yield config_1.connection.getAccountInfo(new web3_js_1.PublicKey(id));
        if (account === null)
            throw Error(' get id info error ');
        const info = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);
        const marketId = info.marketId;
        const marketAccount = yield config_1.connection.getAccountInfo(marketId);
        if (marketAccount === null)
            throw Error(' get market info error');
        const marketInfo = raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
        const lpMint = info.lpMint;
        const lpMintAccount = yield config_1.connection.getAccountInfo(lpMint);
        if (lpMintAccount === null)
            throw Error(' get lp mint info error');
        const lpMintInfo = raydium_sdk_1.SPL_MINT_LAYOUT.decode(lpMintAccount.data);
        return {
            id,
            baseMint: info.baseMint.toString(),
            quoteMint: info.quoteMint.toString(),
            lpMint: info.lpMint.toString(),
            baseDecimals: info.baseDecimal.toNumber(),
            quoteDecimals: info.quoteDecimal.toNumber(),
            // lpDecimals: lpMintInfo.decimals,
            lpDecimals: info.baseDecimal.toNumber(),
            version: 4,
            programId: account.owner.toString(),
            authority: raydium_sdk_1.Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
            openOrders: info.openOrders.toString(),
            targetOrders: info.targetOrders.toString(),
            baseVault: info.baseVault.toString(),
            quoteVault: info.quoteVault.toString(),
            withdrawQueue: info.withdrawQueue.toString(),
            lpVault: info.lpVault.toString(),
            marketVersion: 3,
            marketProgramId: info.marketProgramId.toString(),
            marketId: info.marketId.toString(),
            marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
            marketBaseVault: marketInfo.baseVault.toString(),
            marketQuoteVault: marketInfo.quoteVault.toString(),
            marketBids: marketInfo.bids.toString(),
            marketAsks: marketInfo.asks.toString(),
            marketEventQueue: marketInfo.eventQueue.toString(),
            lookupTableAccount: web3_js_1.PublicKey.default.toString()
        };
    });
}
exports.formatAmmKeysById = formatAmmKeysById;