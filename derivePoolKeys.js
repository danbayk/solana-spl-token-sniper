const web3 = require('@solana/web3.js');
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const spl = require('@solana/spl-token');
const {Market} = require('@openbook-dex/openbook');
const config = require('./swap/config.js');

const connection = config.connection;

const wsolAddress = 'So11111111111111111111111111111111111111112';
const openbookProgramId = new web3.PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');

const rayProgram = new web3.PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
const myAccount = new web3.PublicKey(config.ownerAddress);

async function derivePoolKeys(id){
    console.log(id);
    const marketId = new web3.PublicKey(id);

    const marketInfo = await getMarketInfo(marketId);
    const marketDeco = await getDecodedData(marketInfo);

    const baseMint = marketDeco.baseMint;
    const baseMintData = await getMintData(baseMint);
    const baseDecimals = await getDecimals(baseMintData);
    const ownerBaseAta = await getOwnerAta(baseMint, myAccount);
    
    const quoteMint = marketDeco.quoteMint;
    const quoteMintData = await getMintData(quoteMint);
    const quoteDecimals = await getDecimals(quoteMintData);
    const ownerQuoteAta = await getOwnerAta(quoteMint, myAccount);

    const authority = (raydium_sdk_1.findProgramAddress([Buffer.from([97, 109, 109, 32, 97, 117, 116, 104, 111, 114, 105, 116, 121])], rayProgram))['publicKey'];
    // const marketAuthority = getVaultSigner(marketId, marketDeco);

    const poolKeys = {
        id: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('amm_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        baseMint: baseMint,
        quoteMint, quoteMint,
        lpMint: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('lp_mint_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        baseDecimals: baseDecimals,
        quoteDecimals: quoteDecimals,
        lpDecimals: baseDecimals,
        version: 4,
        programId: rayProgram,
        authority: authority,
        openOrders: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('open_order_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        targetOrders: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('target_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        baseVault: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('coin_vault_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        quoteVault: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('pc_vault_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        // withdrawQueue: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('withdraw_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        // lpVault: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('temp_lp_token_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        withdrawQueue: new web3.PublicKey('11111111111111111111111111111111'),
        lpVault: new web3.PublicKey('11111111111111111111111111111111'),
        marketVersion: 3,
        marketProgramId: openbookProgramId,
        // marketProgramId: new web3.PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
        marketId: marketId,
        marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({ programId: new web3.PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'), marketId: marketId }).publicKey,
        marketBaseVault: marketDeco.baseVault,
        marketQuoteVault: marketDeco.quoteVault,
        marketBids: marketDeco.bids,
        marketAsks: marketDeco.asks,
        marketEventQueue: marketDeco.eventQueue,
        // ownerBaseAta: ownerBaseAta,
        // ownerQuoteAta: ownerQuoteAta,
        // marketAuthority: marketAuthority,
        // coinVault: raydium_sdk_1.findProgramAddress([rayProgram.toBuffer(), marketId.toBuffer(), Buffer.from('pc_vault_associated_seed', 'utf-8')], rayProgram)['publicKey'],
        lookupTableAccount: web3.PublicKey.default
    };
    return poolKeys;
}
exports.derivePoolKeys = derivePoolKeys;

async function getMarketInfo(marketId){
    const marketInfo = await connection.getAccountInfo(marketId);
    return marketInfo;
}

async function getDecodedData(marketInfo){
    return await Market.getLayout(openbookProgramId).decode(marketInfo.data);
}

async function getMintData(mint){
    return await connection.getAccountInfo(mint);
}

async function getDecimals(mintData){
    return raydium_sdk_1.SPL_MINT_LAYOUT.decode(mintData.data).decimals;
}

async function getOwnerAta(mint, publicKey){
    const foundAta = web3.PublicKey.findProgramAddressSync([publicKey.toBuffer(), spl.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], spl.ASSOCIATED_TOKEN_PROGRAM_ID)[0];
    return foundAta;
}

function getVaultSigner(marketId, marketDeco){
    const seeds = [marketId.toBuffer()];
    const seedsWithNonce = seeds.concat(Buffer.from([Number(marketDeco.vaultSignerNonce.toString())]), Buffer.alloc(7));
    return web3.PublicKey.createProgramAddressSync(seedsWithNonce, openbookProgramId);
}