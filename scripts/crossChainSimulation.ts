import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { getDepositLockerAmount, getMarketInputToken, getRpcUrlByChainId, getUniswapLiquidity } from '../src/helpers';
import { main_ as simulateShortcut } from './simulateShortcut';

// these are just guesses based on simulation outcomes
const uniV2ZeroToOne = [
  '0xf8663b3c0f78b4efae0422b163e86e79afa1ce90778885d93d53c9d4f6d5c3d8',
  '0x1997c604de34a71974228bca4a66f601427c48960b6e59ff7ebc8e34f43f3ecf',
  '0x219169d9e78064768cddd0397c2202dc9e5c2bc0e1dbc13465363b0458d33c34',
  '0xfa4917a871f9cf06d3d00be6678993888b3aac41c3da21edf32c3c9cf3978d70',
  '0x6262ac035c2284f5b5249a690a6fd81c35f1ecef501da089f25741a4492cf5f3',
  '0x289dc2a22ebb4ef7404de9293b6718d9f81f0843e1af4cf9a9c51d2e757348d6',
  '0x17ffd16948c053cc184c005477548e559566879a0e2847e87ebd1111c602535c',
  '0x7ecf55915abe3c24dc5d8365a8edabc8833f4efb8e7c027429c9528aed91ecb7',
  '0x49104b3cadbb31470e5b949c6892a33954ee9ce35041df4a04a88eb694b645c0',
];

const marketHashes: Record<string, Record<string, string>> = {
  beraborrow: {
    'nect-honey': '0x62bb6fb784e059f338340a9724b35ef2ef8fde5e65613e9fcaacd097d81dc67e',
    'nect-usde': '0x2240151f263be555a4ef61476a5c111373e0efe8cd539f179b4b5850977e9d4e',
    'wbtc-honey': '0xcdd60ed30d20f9edc3fac624bb623db32103658b6da678949ef53df16139b488',
    'wbtc-weth': '0x568d2509ec17c27426a9d55e58673160c937aeaedc0a3fcc7c63c5b7df495ec7',
    'weth-honey': '0xf8663b3c0f78b4efae0422b163e86e79afa1ce90778885d93d53c9d4f6d5c3d8',
    beraeth: '0xd77d3e3e075394a6c94a8c83dab114bb7266b96c5234e4a98476f41339029c30',
    pumpbtc: '0xfe95d44ab171140b66fb5180e9de765578d9d2bfbdbb66307abb86ba05a59e93',
    rseth: '0xfef8ead03d79cf7cbe6f73c8d1136f8c84f6cf6ed9bc208719e7fcee807cb336',
    sbtc: '0xe92ebafbee7aa7a636ff62e04aa2ab9353f60ef72dcdcfdfcf48b67a7ad8ffc7',
    solvbtc: '0x28b337bd45eda5e2fc596bfe22320bef0af9da85d4c770d0fd03ddf72428c00a',
    solvbtcbnn: '0x54b4b37c355868591a91baed36a3c8083f6480ccb11145106d0dad912d7dffd2',
    stbtc: '0x84790e638ddd7a59e64b8c239e96e29c2c6c155a9882a0c834b9ced016b7c999',
    stone: '0x88ee202388086447b8dc8403c5aa2cfbcdb52e749fd16af5c6a3c7bb614b17c9',
    unibtc: '0xb32d047eb63b5c2af537c2e4df6a09c40a50b75aefd83a928600241a4666b087',
    weth: '0xb9f307d83c78d09a134aac7713821aab8e1da2404b895db66f0975135dd5006e',
    ylbtclst: '0x4fa4a76aa8b93ccdddba0c20c336056803b7410fb375c9c9541e9c54fbfb2f9a',
    ylpumpbtc: '0x897eec875e51d6c8b5339d6a9984a00acb0aa86f9d4ab4eddbb4a791bb0a88e9',
    ylrseth: '0x6b3dfac03cea102e59d2d5711088f3001782e07239dcc90f274dd9762220c49a',
    ylsteth: '0xc182b0267a6ca015c2d2a144ca19e1f6b36479675754914002e0613320ed8d9a',
  },
  burrbear: {
    usdc: '0x71cee3cf3329e9a2803d578cdd6c823d7a16aa39adea3a7053395299bd258800',
  },
  concrete: {
    wbtc: '0xece925dbccbb21333dbe99679fef655ad2dc2cb185e0963711c944e302595b28',
    lbtc: '0xa31a8bb230f77a5d286985b92fe8d0c7504a1892568d70685659f781aec78209',
    susde: '0x3d7cf2bd0a04fd3c66a5fa334a399b3926efe0fc0450b8da49a5da29f2c36d7f',
    usde: '0x5043bfe3f6bab5fa4c8f19fb2f6856de2d2e717a541e0d7126b308926be04e2e',
  },
  dahlia: {
    susdcusdc: '0x7e804adb4c426b81fbe1f005f92d8dee99f98b0502c3946ac5ad436b453c6435',
    stoneweth: '0x4dd921e829db80e73c56d888eeaf46a7934a3c4a2f7f78231dd4502f8eaa2558',
    wberausdc: '0x20ca89af1fd136d0ef9c4e3e74e8ab1943d28e6879206a3e180fd35e29fb2d7d',
  },
  dolomite: {
    'ir-deth': '0x0a7565b14941c6a3dde083fb7a857e27e12c55fa34f709c37586ec585dbe7f3f',
    'ir-dhoney': '0x9778047cb8f3740866882a97a186dff42743bebb3ad8010edbf637ab0e37751f',
    'ir-dusdt': '0x9c7bd5b59ebcb9a9e6787b9b174a98a69e27fa5a4fe98270b461a1b9b1b1aa3e',
    'ir-dwbtc': '0xa6905c68ad66ea9ce966aa1662e1417df08be333ab8ec04507e0f0301d3a78e9',
    dberaeth: '0x258ac521d801d5112a484ad1b82e6fd2efc24aba29e5cd3d56db83f4a173dc90',
    dnect: '0xbe5cd829fcb3cdfe8224ad72fc3379198d38da26131c5b7ab6664c8f56a9730d',
    dpumpbtc: '0xff917303af9337534eece4b88948d609980b66ca0b41875da782aec4858cade5',
    drseth: '0x415f935bbb9bf1bdc1f49f2ca763d5b2406efbf9cc949836880dd5bbd054db95',
    drsweth: '0xc90525132d909f992363102ebd6298d95b1f312acdb9421fd1f7ac0c0dd78d3f',
    dsbtc: '0x42a09eccabf1080c40a24522e9e8adbee5a0ad907188c9b6e50ba26ba332eac3',
    dsolvbtc: '0xb1d5ccc4388fe639f8d949061bc2de95ecb1efb11c5ceb93bdb71caab58c8aa3',
    dsolvbtcbnn: '0x2a3a73ba927ec6bbf0e2e12e21a32e274a295389ce9d6ae2b32435d12c597c2c',
    dstbtc: '0xc6887dddd833a3d585c7941cd31b0f8ff3ec5903d49cd5e7ac450b46532d3e79',
    dstone: '0xb27f671bc0dd8773a25136253acd72150dd59e50e44dc8439e9dc5c84c2b19f6',
    dsusda: '0x2dd74f8f8a8d7f27b2a82a6edce57b201f9b4a3c4780934caf99363115e48be6',
    dsusde: '0x092c0c4d8d124fc29364e8cd8417198c4bbe335e3f6c4b1f79215a3457b4831a',
    dunibtc: '0xd10bdc88272e0958baa62a4ae2bfce1d8feed639a93e03c0aa5cec7adfbdf2c3',
    dusda: '0x86a5077c6a9190cde78ec75b8888c46ed0a3d1289054127a955a2af544633cf3',
    dusdc: '0x1e0a98a276ba873cfa427e247c7d0e438f604a54fcb36481063e1220af021faf',
    dusde: '0xa588ad19850cf2a111c3c727033da8e557abc94de70fce2d2b2f2f78140f15e5',
    dylbtclst: '0x0194c329e2b9712802c37d3f17502bcefce2e128933f24f4fe847dfc7e5e8965',
    dylpumpbtc: '0x6306bfce6bff30ec4efcea193253c43e057f1474007d0d2a5a0c2938bd6a9b81',
    dylsteth: '0x5bac1cacdd36b3d95a7f9880a264f8481ab56d3d1a53993de084c6fa5febcc15',
  },
  d2: {
    'usdc-kodiakplus': '0x027987432679079fbbc990691d14dabe7f7780f51df6a1a53e7bd875b1f9581a',
    //'usdc-beraland': '0x0964848864e96952ee2454ce58fc93b867f9b2d9a6b44216eec8b08726813d1b',
    'usdc-hyperbera': '0xb7b78119806fcb9bbc499131da16b52ce52cf4a1ceabfc59e4f2f6e6ef7046c0',
  },
  goldilocks: {
    'unibtc-unibtcot': '0x72679855f582a6d908bf39d40cb5a299b6a98a82bf1bfd9055f1853fc5160f54',
    'rseth-rsethot': '0xab32e1695b84b148140cb78c044d247e307b26cb043dc5538657f3a5634dee6e',
    'solvbtcbnnot-solvbtc': '0xbd3ef685577bdca03225bb2cd2158f0772cdfd694ba03b9eb4856b59a7288081',
  },
  kodiak: {
    'beraeth-rsweth': '0x3ef317447bd10825f0a053565f8474a460cfb22cda414ea30b671e304f0691b6',
    'beraeth-stone': '0x1997c604de34a71974228bca4a66f601427c48960b6e59ff7ebc8e34f43f3ecf',
    'beraeth-ylsteth': '0x219169d9e78064768cddd0397c2202dc9e5c2bc0e1dbc13465363b0458d33c34',
    'honey-usda': '0xfa4917a871f9cf06d3d00be6678993888b3aac41c3da21edf32c3c9cf3978d70',
    'honey-usdc': '0x72bec627884d7bdf538f174bedd551e9eccf3995adc880f40972e2bab87df3b9',
    'mim-honey': '0x9a117f13c7d5d2b4b18e444f72e6e77c010a1fd90cf21135be75669d66ad9428',
    'pumpbtc-fbtc': '0xab27dc8061f66791bb94a536546b08ba15e06344dabad2cc6267cf44f0070574',
    //'pumpbtc-ylbtclst': '0x2fa37184f43783f5d6b23548c4a7a21bb86cd2f314bba9d5bb7d2415d61d11c8',
    //'pumpbtc-ylpumpbtc': '0xaa636d73f39ea0de0e04ed9270eac5d943707e7f8fb9c3480c0d80eb015ccfc8',
    'rseth-beraeth': '0x25f7a422282a1f26d9d96b5d1c43fa5c6f8c355b0ed7a4755ac8d04a504817f5',
    //'rseth-ylrseth': '0x460ec133419318efe4e05b4c3b6db421503fd6fcefbb20a43f50e3fc50f2ee39',
    'rusd-honey': '0xcdb30c06ea11f3f5408bce5eefdb392dfe0008ef81af3a486bcfed891f9cc112',
    'solvbtc-fbtc': '0xc5165360e2e8b195cb55e21cf259ce6a5ee996b055057d8705851d9b01fc8620',
    'solvbtc-solvbtcbnn': '0x378d4d32d89450978d01cfdf1ff1907d4419aa186c48abb94e612b76d75f3fae',
    'susda-usda': '0xd70673b98af7096f575717d70fbf2fa935dd719926b55c0e011480678cdac563',
    'susde-honey': '0xad9ee12ea8b3dccf85934c2918bd4ad38ccf7bc8b43d5fcb6f298858aa4c9ca4',
    //'unibtc-ylbtclst': '0x21c6a0baa6f41b060937be5a4f1be096b63f426c50f763b4dabd1af46803fa2f',
    'usde-honey': '0x5f7935e257b94aee6caf9bbe917d4cfad75e8bc3b231806769ca0935af8371e8',
    'usde-usda': '0xab689b5eac7541b8cc774f0ca3705a91b21660e8221fc7bd8e93c391fb5d690d',
    'usdt-honey': '0xf8f745f188ddb10c16724faee95583521191c3c69e15490fa53c1136b73c17d7',
    'wbtc-fbtc': '0xd6e9ff1fa0c9c6bb25cafcb76c61c0d398a479ba073509e10209271f40a01712',
    'wbtc-honey': '0x6262ac035c2284f5b5249a690a6fd81c35f1ecef501da089f25741a4492cf5f3',
    'wbtc-pumpbtc': '0xa74b61544834483b093531cff533d01788a5dea12d8a83902646111025303bfb',
    'wbtc-sbtc': '0x289dc2a22ebb4ef7404de9293b6718d9f81f0843e1af4cf9a9c51d2e757348d6',
    'wbtc-solvbtc': '0x290aad1fabd8d2557d28a3854a2433ddc11a35f0d12936dd99102067ac515d07',
    'wbtc-stbtc': '0x9b60d30f266858fa671bf268796aa503700310e31a8f46ebaa8f8281fbad89aa',
    'wbtc-unibtc': '0x568f3bb6ba4c6afe37899fda35bc315ae8167274685ea295e03cf20d471afd8b',
    'wbtc-wabtc': '0x49104b3cadbb31470e5b949c6892a33954ee9ce35041df4a04a88eb694b645c0',
    'wbtc-weth': '0xab37ea8895eed81c4aa76d5dba64441756904b15e78f6ffa5183b0fc1563c1c5',
    'weth-beraeth': '0xaf2a845c9d6007128b7aec375a4fcdee2b12bbaeb78caf928d3bd08e104417d6',
    'weth-honey': '0x17ffd16948c053cc184c005477548e559566879a0e2847e87ebd1111c602535c',
    'weth-stone': '0x7ecf55915abe3c24dc5d8365a8edabc8833f4efb8e7c027429c9528aed91ecb7',
  },
  veda: {
    lbtc: '0xabf4b2f17bc32faf4c3295b1347f36d21ec5629128d465b5569e600bf8d46c4f',
    wbtc: '0xb36f14fd392b9a1d6c3fabedb9a62a63d2067ca0ebeb63bbc2c93b11cc8eb3a2',
    weth: '0x0484203315d701daff0d6dbdd55c49c3f220c3c7b917892bed1badb8fdc0182e',
    weeth: '0xff0182973d5f1e9a64392c413caaa75f364f24632a7de0fdd1a31fe30517fdd2',
  },
  origami: {
    'oboy-honey': '0xa655556eb64a0fd18b9a3c80794ab370743bc431a4b2a6116fa97dcc7f741a2b',
  },
  satlayer: {
    pumpbtc: '0x036d9e250c6dafef1dd361199181548f9990a00452abf5231cebe7a15f9e19bd',
    sbtc: '0x7ccce28638cbb503d17e8d9290a97f18731199655ccde282da7b464f21361b79',
    lbtc: '0xde894ab596c084e65d0123ab6fa66f95b0571091cd8ec7efbeabe4942e7c40cd',
    wabtc: '0x2dcd8ec59fe12b4cb802f5a26445f9684635c52139560f169a7c4d67da186c18',
    solvbtcbnn: '0x7dadff589e53d9813969d0be6de99c033d140ec1d304e57a754797736656dcd5',
    unibtc: '0xdd3f0e11d59726f2e63fc1b180abc94034dd3e0f4018b51371b73348d82b3769',
  },
  thj: {
    usdc: '0xaa449e0679bd82798c7896c6a031f2da55299e64c0b4bddd57ad440921c04628',
  },
};

async function main() {
  try {
    const args: string[] = process.argv.slice(2);
    const expectedMarketHash = args[0];
    const rpcUrl = getRpcUrlByChainId(1);
    const provider = new StaticJsonRpcProvider({
      url: rpcUrl,
    });

    for (const protocol of Object.keys(marketHashes)) {
      for (const name of Object.keys(marketHashes[protocol])) {
        const marketHash = marketHashes[protocol][name];
        if (!expectedMarketHash || expectedMarketHash === marketHash) {
          const lockedAmount = await getDepositLockerAmount(provider, marketHash);
          // Check if underlying is uniswap
          const token = await getMarketInputToken(provider, marketHash);

          console.log('Market Hash: ', marketHash);
          console.log('Locked amount: ', lockedAmount.toString());
          console.log('Token: ', token);

          let amountString: string;
          try {
            const { amount0, amount1 } = await getUniswapLiquidity(provider, token, lockedAmount);
            console.log('LP Token');
            amountString = uniV2ZeroToOne.includes(marketHash)
              ? [amount1.toString(), amount0.toString()].join(',')
              : [amount0.toString(), amount1.toString()].join(',');
            //eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            // single token
            console.log('Single Token');
            amountString = lockedAmount.toString();
          }
          console.log('Simulate amount: ', amountString);
          await simulateShortcut(['berachain', protocol, name, amountString]);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
}

main();
