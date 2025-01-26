import { AddressArg, ChainIds } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';
import { GeneralAddresses, TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';
import { BigNumber } from '@ethersproject/bignumber';

import type { SimulationRoles } from './types';

export const PRECISION = BigNumber.from(10).pow(18);

export enum SimulationMode {
  ANVIL = 'anvil',
  FORGE = 'forge',
  QUOTER = 'quoter',
  TENDERLY = 'tenderly',
}

export enum ShortcutOutputFormat {
  ROYCO = 'royco',
  FULL = 'full',
}

export enum ShortcutExecutionMode {
  WEIROLL_WALLET__EXECUTE_WEIROLL = 'weirollWallet__executeWeiroll',
  MULTICALL__AGGREGATE = 'multiCall__aggregate',
}

// Forge test
export enum ForgeTestLogFormat {
  DEFAULT = '',
  JSON = '--json',
}

export enum TraceItemPhase {
  DEPLOYMENT = 'Deployment',
  EXECUTION = 'Execution',
  SETUP = 'Setup',
}

export const FUNCTION_ID_ERC20_APPROVE = '0x095ea7b3';

export const DEFAULT_SETTER_MIN_AMOUNT_OUT = BigNumber.from('1');
export const MAX_BPS = BigNumber.from('10000'); // NB: 100%
export const MIN_BPS = BigNumber.from('0');
export const DEFAULT_MIN_AMOUNT_OUT_MIN_SLIPPAGE = MIN_BPS; // NB: 0%

export const CONTRCT_SIMULATION_FORK_TEST_EVENTS_ABI = [
  {
    type: 'event',
    name: 'SimulationReportDust',
    inputs: [
      { name: 'tokensDust', type: 'address[]', indexed: false, internalType: 'address[]' },
      { name: 'amountsDust', type: 'uint256[]', indexed: false, internalType: 'uint256[]' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SimulationReportGasUsed',
    inputs: [{ name: 'gasUsed', type: 'uint256', indexed: false, internalType: 'uint256' }],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SimulationReportQuote',
    inputs: [
      { name: 'tokensOut', type: 'address[]', indexed: false, internalType: 'address[]' },
      { name: 'amountsOut', type: 'uint256[]', indexed: false, internalType: 'uint256[]' },
    ],
    anonymous: false,
  },
];

export const chainIdToSimulationRoles: Map<ChainIds, SimulationRoles> = new Map([
  [
    ChainIds.Cartio,
    {
      caller: {
        address: '0x93621DCA56fE26Cdee86e4F6B18E116e9758Ff11',
        label: 'Caller',
      },
      defaultWeirollWallet: {
        address: '0xBa8F5f80C41BF5e169d9149Cd4977B1990Fc2736',
        label: 'WeirollWallet',
      },
      recipeMarketHub: {
        address: '0x65a605E074f9Efc26d9Cf28CCdbC532B94772056',
        label: 'RecipeMarketHub',
      },
      multiCall: {
        address: '0x58142bd85E67C40a7c0CCf2e1EEF6eB543617d2A',
        label: 'MultiCall',
      },
      roycoWalletHelpers: {
        address: '0x07899ac8BE7462151d6515FCd4773DD9267c9911',
        label: 'RoycoWalletHelpers',
      },
      setter: {
        address: '0x67D0B6e109b82B51706dC4D71B42Bf19CdFC8d1e',
        label: 'CCDMSetter',
      },
      nativeToken: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        label: 'NativeToken',
      },
      depositExecutor: {
        address: '0x17621de23Ff8Ad9AdDd82077B0C13c3472367382',
        label: 'DepositExecutor',
      },
    },
  ],
  [
    ChainIds.Berachain,
    {
      caller: {
        address: '0x93621DCA56fE26Cdee86e4F6B18E116e9758Ff11',
        label: 'Caller',
      },
      defaultWeirollWallet: {
        address: '0x',
        label: 'WeirollWallet',
      },
      recipeMarketHub: {
        address: '0xA0A18b895Bd59F509d174921506245c14f98c0F6',
        label: 'RecipeMarketHub',
      },
      multiCall: {
        address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        label: 'MultiCall',
      },
      roycoWalletHelpers: {
        address: '0x07899ac8BE7462151d6515FCd4773DD9267c9911',
        label: 'RoycoWalletHelpers',
      },
      setter: {
        address: '0x39027795AE6f2b56AdA04F0C25CF5ADBd095933b',
        label: 'CCDMSetter',
      },
      nativeToken: {
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        label: 'NativeToken',
      },
      depositExecutor: {
        address: '0xEC1F64Cd852c65A22bCaA778b2ed76Bc5502645C',
        label: 'DepositExecutor',
      },
    },
  ],
]);

export const chainIdToDeFiAddresses: Record<number, Record<string, AddressArg>> = {
  [ChainIds.Cartio]: {
    ausdt: TokenAddresses.cartio.usdt,
    bgt: TokenAddresses.cartio.btg,
    burr: TokenAddresses.cartio.burr,
    dweth: '0x2d93FbcE4CffC15DD385A80B3f4CC1D4E76C38b3',
    ebtc: TokenAddresses.cartio.ebtc,
    unibtc: '0xC3827A4BC8224ee2D116637023b124CED6db6e90',
    honey: TokenAddresses.cartio.honey,
    mim: TokenAddresses.cartio.mim,
    nativeToken: GeneralAddresses.nativeToken,
    nect: TokenAddresses.cartio.nect,
    pumpbtc: TokenAddresses.cartio.pumpBtc,
    rusd: TokenAddresses.cartio.rusd,
    sbtc: '0x5d417e7798208E9285b5157498bBF23A23E421E7',
    stone: TokenAddresses.cartio.stone,
    usdc: TokenAddresses.cartio.usdc,
    usde: '0xf805ce4F96e0EdD6f0b6cd4be22B34b92373d696',
    usdt: TokenAddresses.cartio.usdt,
    wbera: TokenAddresses.cartio.wbera,
    wbtc: TokenAddresses.cartio.wbtc,
    weth: TokenAddresses.cartio.weth,
    beraEth: Standards.Dinero_Lst.protocol.addresses!.cartio!.lst,
    rBeraEth: Standards.Dinero_Lst.protocol.addresses!.cartio!.rLst,
    bridgeQuoter: '0xd462D024A1919624E19b5658d446BB4Ce04089a9',
    honeyFactory: Standards.Berachain_Honey.protocol.addresses!.cartio!.honeyFactory,
    kodiakRouter: Standards.Kodiak_Islands.protocol.addresses!.cartio!.router,
    kodiakQuoterV2: Standards.Kodiak_Islands.protocol.addresses!.cartio!.quoterV2,
    usdcPsmBond: '0xd064C80776497821313b1Dc0E3192d1a67b2a9fa',
    burrbearZap: '0xd39e7aa57CB0703cE74Bc96dA005dFceE2Ac4F56',
    satlayerVault: '0x50198b5E1330753F167F6e0544e4C8aF829BC99d',
  },
  [ChainIds.Berachain]: {
    ausdt: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
    beraEth: '0x6fc6545d5cDE268D5C7f1e476D444F39c995120d',
    bgt: '0x',
    bridgeQuoter: '0x',
    burr: '0x',
    burrbearZap: '0x',
    dweth: '0xf7b5127B510E568fdC39e6Bb54e2081BFaD489AF',
    ebtc: '0x',
    honey: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce',
    honeyFactory: '0xA4aFef880F5cE1f63c9fb48F661E27F8B4216401',
    kodiakQuoterV2: '0x644C8D6E501f7C994B74F5ceA96abe65d0BA662B',
    kodiakRouter: '0xca4A9Ae6712AFF3948c871503FC46cBe6Da3cAE5',
    mim: '0x5B82028cfc477C4E7ddA7FF33d59A23FA7Be002a',
    nativeToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    nect: '0x1cE0a25D13CE4d52071aE7e02Cf1F6606F4C79d3',
    pumpbtc: '0x1fCca65fb6Ae3b2758b9b2B394CB227eAE404e1E',
    rBeraEth: '0x3B0145f3CFA64BC66F5742F512f871665309075d',
    rseth: '0x4186BFC76E2E237523CBC30FD220FE055156b41F',
    rusd: '0x09D4214C03D01F49544C0448DBE3A27f768F2b34',
    sbtc: '0x93F4d0ab6a8B4271f4a28Db399b5E30612D21116',
    solvbtc: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
    solvbtcbnn: '0xCC0966D8418d412c599A6421b760a847eB169A8c',
    lbtc: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
    stbtc: '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3',
    stone: '0xEc901DA9c68E90798BbBb74c11406A32A70652C3',
    wabtc: '0x09DEF5aBc67e967d54E8233A4b5EBBc1B3fbE34b',
    unibtc: '0xC3827A4BC8224ee2D116637023b124CED6db6e90',
    usdc: '0x549943e04f40284185054145c6E4e9568C1D3241',
    usdcPsmBond: '0xCaB847887a2d516Dfa690fa346638429415c089b',
    usde: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34',
    usdt: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
    wbera: '0x6969696969696969696969696969696969696969',
    wbtc: '0x0555e30da8f98308edb960aa94c0db47230d2b9c',
    weth: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    ylpumpbtc: '0xdCB3D91555385DaE23e6B966b5626aa7A75Be940',
    ylrseth: '0x9B2316cfe980515de7430F1c4E831B89a5921137',
    ylsteth: '0xa958090601E21A82e9873042652e35891D945a8C',
    ylbtclst: '0xE946Dd7d03F6F5C440F68c84808Ca88d26475FC5',
  },
};

const tokenToHolderCartio: Map<AddressArg, AddressArg> = new Map([
  [chainIdToDeFiAddresses[ChainIds.Cartio].nativeToken, '0x0000000000000000000000000000000000000000'], // Native Token (funded via `vm.deal(<address>, 1_000 ether)`)
  [chainIdToDeFiAddresses[ChainIds.Cartio].ausdt, '0xCACa41c458f48D4d7c710F2E62AEe931E149A37d'], // aUSDT
  [chainIdToDeFiAddresses[ChainIds.Cartio].bgt, '0x211bE45338B7C6d5721B5543Eb868547088Aca39'], // BGT
  [chainIdToDeFiAddresses[ChainIds.Cartio].burr, '0x5B34eBA09e567d37884c0AA58509119c87Bfb589'], // BURR
  // [
  //   chainIdToDeFiAddresses[ChainIds.Cartio].dweth,
  //   '0x0000000000000000000000000000000000000000',
  // ], // dWETH (no holder found)
  [chainIdToDeFiAddresses[ChainIds.Cartio].ebtc, '0x895614c89beC7D11454312f740854d08CbF57A78'], // eBTC
  [chainIdToDeFiAddresses[ChainIds.Cartio].honey, '0x3869E8A2A1432D09666f87b9E61FBf6f71eb6c75'], // HONEY
  [chainIdToDeFiAddresses[ChainIds.Cartio].mim, '0xB734c264F83E39Ef6EC200F99550779998cC812d'], // MIM
  [chainIdToDeFiAddresses[ChainIds.Cartio].nect, '0xd137593CDB341CcC78426c54Fb98435C60Da193c'], // NECTAR
  [chainIdToDeFiAddresses[ChainIds.Cartio].pumpbtc, '0xD3b050b548dDfdf90d39421fC5eaaF2653165Ad6'], // pumpBTC
  [chainIdToDeFiAddresses[ChainIds.Cartio].rusd, '0xA51C5F0007d8C506E9F7132dF10d637379a07be0'], // rUSD
  [chainIdToDeFiAddresses[ChainIds.Cartio].sbtc, '0xA3A771A7c4AFA7f0a3f88Cc6512542241851C926'], // SBTC
  [chainIdToDeFiAddresses[ChainIds.Cartio].stone, '0xAfa6405c1ea4727a0f9AF9096bD20A1E6d19C153'], // STONE
  [chainIdToDeFiAddresses[ChainIds.Cartio].usdc, '0xCACa41c458f48D4d7c710F2E62AEe931E149A37d'], // USDC
  [chainIdToDeFiAddresses[ChainIds.Cartio].wbera, '0x9C8a5c82e797e074Fe3f121B326b140CEC4bcb33'], // WBERA
  [chainIdToDeFiAddresses[ChainIds.Cartio].wbtc, '0x603C6152DF404CB5250Ce8E6FE01e4294254F728'], // WBTC
  [chainIdToDeFiAddresses[ChainIds.Cartio].weth, '0x8a73D1380345942F1cb32541F1b19C40D8e6C94B'], // WETH
  [chainIdToDeFiAddresses[ChainIds.Cartio].unibtc, '0xC3827A4BC8224ee2D116637023b124CED6db6e90'], // UniBtc-OT
]);

const tokenToHolderBerchain: Map<AddressArg, AddressArg> = new Map([
  [chainIdToDeFiAddresses[ChainIds.Berachain].nativeToken, '0x0000000000000000000000000000000000000000'], // Native Token (funded via `vm.deal(<address>, 1_000 ether)`)
  [chainIdToDeFiAddresses[ChainIds.Berachain].weth, '0x8E4Ef86AfAf6AFde0D36F794C968C805e2f64bf5'],
]);

export const chainIdToTokenHolder: Map<ChainIds, Map<AddressArg, AddressArg>> = new Map([
  [ChainIds.Cartio, tokenToHolderCartio],
  [ChainIds.Berachain, tokenToHolderBerchain],
]);
