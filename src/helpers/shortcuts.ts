import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { AbracadabraMimHoneyhortcut } from '../shortcuts/abracadabra/mim-honey';
import { BeraborrowBeraethShortcut } from '../shortcuts/beraborrow/beraEth';
import { BeraborrowNectHoneyShortcut } from '../shortcuts/beraborrow/nect-honey';
import { BeraborrowPumpbtcShortcut } from '../shortcuts/beraborrow/pumpbtc';
import { BeraborrowRsethShortcut } from '../shortcuts/beraborrow/rseth';
import { BeraborrowSbtcShortcut } from '../shortcuts/beraborrow/sbtc';
import { BeraborrowSolvbtcShortcut } from '../shortcuts/beraborrow/solvbtc';
import { BeraborrowSolvbtcbnnShortcut } from '../shortcuts/beraborrow/solvbtcbnn';
import { BeraborrowStbtcShortcut } from '../shortcuts/beraborrow/stbtc';
import { BeraborrowStoneShortcut } from '../shortcuts/beraborrow/stone';
import { BeraborrowUnibtcShortcut } from '../shortcuts/beraborrow/unibtc';
import { BeraborrowUsdcShortcut } from '../shortcuts/beraborrow/usdc';
import { BeraborrowUsdeShortcut } from '../shortcuts/beraborrow/usde';
import { BeraborrowWbtcWethShortcut } from '../shortcuts/beraborrow/wbtc-weth';
import { BeraborrowWethShortcut } from '../shortcuts/beraborrow/weth';
import { BeraborrowWethHoneyShortcut } from '../shortcuts/beraborrow/weth-honey';
import { BeraborrowYlbtclstShortcut } from '../shortcuts/beraborrow/ylbtclst';
import { BeraborrowYlpumpbtcShortcut } from '../shortcuts/beraborrow/ylpumpbtc';
import { BeraborrowYlrsethShortcut } from '../shortcuts/beraborrow/ylrseth';
import { BeraborrowYlstethShortcut } from '../shortcuts/beraborrow/ylsteth';
import { BerachainHoneyShortcut } from '../shortcuts/berachain/honey';
import { BurrbearUsdcShortcut } from '../shortcuts/burrbear/usdc';
import { ConcreteLbtcShortcut } from '../shortcuts/concrete/lbtc';
import { ConcreteSusdeShortcut } from '../shortcuts/concrete/susde';
import { ConcreteUsdcShortcut } from '../shortcuts/concrete/usdc';
import { ConcreteUsdeShortcut } from '../shortcuts/concrete/usde';
import { ConcreteWethShortcut } from '../shortcuts/concrete/weth';
import { D2UsdcShortcut } from '../shortcuts/d2/usdc';
import { DahliaUsdcShortcut } from '../shortcuts/dahlia/usdc';
import { DahliaWethShortcut } from '../shortcuts/dahlia/weth';
import { DolomiteDEthShortcut } from '../shortcuts/dolomite/deth';
import { DolomiteDHoneyShortcut } from '../shortcuts/dolomite/dhoney';
import { DolomiteDPumpBtcShortcut } from '../shortcuts/dolomite/dpumpbtc';
import { DolomiteDRsEthShortcut } from '../shortcuts/dolomite/drseth';
import { DolomiteDSbtcShortcut } from '../shortcuts/dolomite/dsbtc';
import { DolomiteDUsdcShortcut } from '../shortcuts/dolomite/dusdc';
import { DolomiteDUsdtShortcut } from '../shortcuts/dolomite/dusdt';
import { DolomiteDWbtcShortcut } from '../shortcuts/dolomite/dwbtc';
import { DolomiteDYlPumpBtcShortcut } from '../shortcuts/dolomite/dylpumpbtc';
import { GoldilocksUniBtcOtUniBtcShortcut } from '../shortcuts/goldilocks/unibtcot-unibtc';
import { InfraredHoneyUsdcShortcut } from '../shortcuts/infrared/honey-usdc';
import { InfraredWbtcWethShortcut } from '../shortcuts/infrared/wbtc-weth';
import { InfraredWethHoneyShortcut } from '../shortcuts/infrared/weth-honey';
import { KodiakbBraethwethShortcut } from '../shortcuts/kodiak/beraeth-weth';
import { KodiakHoneyUsdcShortcut } from '../shortcuts/kodiak/honey-usdc';
import { KodiaknectUsdeShortcut } from '../shortcuts/kodiak/nect-usde';
import { KodiakWbtcWethShortcut } from '../shortcuts/kodiak/wbtc-weth';
import { KodiakWethHoneyShortcut } from '../shortcuts/kodiak/weth-honey';
import { OrigamiBoycoHoneyShortcut } from '../shortcuts/origami/oboy-HONEY-a';
import { SatlayerLbtcShortcut } from '../shortcuts/satlayer/lbtc';
import { SatlayerPumpBtcShortcut } from '../shortcuts/satlayer/pumpbtc';
import { SatlayerSbtcShortcut } from '../shortcuts/satlayer/sbtc';
import { SatlayerSolvbtcbnnBnnShortcut } from '../shortcuts/satlayer/solvbtcbnn';
import { SatlayerWabtcShortcut } from '../shortcuts/satlayer/wabtc';
import { ThjUsdcShortcut } from '../shortcuts/thj/usdc';
import { VedaUsdcShortcut } from '../shortcuts/veda/usdc';
import { Shortcut } from '../types';
import { buildVerificationHash } from './utils';

export const shortcuts: Record<string, Record<string, Shortcut>> = {
  abracadabra: {
    'honey-mim': new AbracadabraMimHoneyhortcut(),
  },
  beraborrow: {
    'nect-honey': new BeraborrowNectHoneyShortcut(),
    'weth-honey': new BeraborrowWethHoneyShortcut(),

    beraEth: new BeraborrowBeraethShortcut(),
    pumpbtc: new BeraborrowPumpbtcShortcut(),
    rseth: new BeraborrowRsethShortcut(),
    sbtc: new BeraborrowSbtcShortcut(),
    solvbtc: new BeraborrowSolvbtcShortcut(),
    solvbtcbnn: new BeraborrowSolvbtcbnnShortcut(),
    stbtc: new BeraborrowStbtcShortcut(),
    stone: new BeraborrowStoneShortcut(),
    unibtc: new BeraborrowUnibtcShortcut(),
    usdc: new BeraborrowUsdcShortcut(),
    usde: new BeraborrowUsdeShortcut(),
    weth: new BeraborrowWethShortcut(),
    ylbtclst: new BeraborrowYlbtclstShortcut(),
    ylpumpbtc: new BeraborrowYlpumpbtcShortcut(),
    ylrseth: new BeraborrowYlrsethShortcut(),
    ylsteth: new BeraborrowYlstethShortcut(),
    'wbtc-weth': new BeraborrowWbtcWethShortcut(),
  },
  berachain: {
    honey: new BerachainHoneyShortcut(),
  },
  burrbear: {
    usdc: new BurrbearUsdcShortcut(),
  },
  concrete: {
    usdc: new ConcreteUsdcShortcut(),
    weth: new ConcreteWethShortcut(),
    wbtc: new ConcreteWethShortcut(),
    lbtc: new ConcreteLbtcShortcut(),
    susde: new ConcreteSusdeShortcut(),
    usde: new ConcreteUsdeShortcut(),
  },
  dahlia: {
    usdc: new DahliaUsdcShortcut(),
    weth: new DahliaWethShortcut(),
  },
  dolomite: {
    deth: new DolomiteDEthShortcut(),
    dhoney: new DolomiteDHoneyShortcut(),
    dpumpbtc: new DolomiteDPumpBtcShortcut(),
    drseth: new DolomiteDRsEthShortcut(),
    dsbtc: new DolomiteDSbtcShortcut(),
    dusdc: new DolomiteDUsdcShortcut(),
    dusdt: new DolomiteDUsdtShortcut(),
    dwbtc: new DolomiteDWbtcShortcut(),
    dylpumpbtc: new DolomiteDYlPumpBtcShortcut(),
  },
  d2: {
    usdc: new D2UsdcShortcut(),
  },

  goldilocks: {
    'unibtcot-unibtc': new GoldilocksUniBtcOtUniBtcShortcut(),
  },
  kodiak: {
    'honey-usdc': new KodiakHoneyUsdcShortcut(),
    'weth-honey': new KodiakWethHoneyShortcut(),
    'wbtc-weth': new KodiakWbtcWethShortcut(),
    'beraeth-weth': new KodiakbBraethwethShortcut(),
    'nect-usde': new KodiaknectUsdeShortcut(),
  },
  veda: {
    usdc: new VedaUsdcShortcut(),
  },
  origami: {
    'oboy-honey': new OrigamiBoycoHoneyShortcut(),
  },
  satlayer: {
    pumpbtc: new SatlayerPumpBtcShortcut(),
    sbtc: new SatlayerSbtcShortcut(),
    lbtc: new SatlayerLbtcShortcut(),
    wabtc: new SatlayerWabtcShortcut(),
    solvbtcbnn: new SatlayerSolvbtcbnnBnnShortcut(),
  },
  infrared: {
    'wbtc-weth': new InfraredWbtcWethShortcut(),
    'honey-usdc': new InfraredHoneyUsdcShortcut(),
    'weth-honey': new InfraredWethHoneyShortcut(),
  },
  thj: {
    usdc: new ThjUsdcShortcut(),
  },
};

export async function buildShortcutsHashMap(
  chainId: number,
  provider: StaticJsonRpcProvider,
): Promise<Record<string, Shortcut>> {
  const shortcutsArray = [];
  for (const protocol in shortcuts) {
    for (const market in shortcuts[protocol]) {
      const shortcut = shortcuts[protocol][market];
      if (shortcut.inputs[chainId]) shortcutsArray.push(shortcuts[protocol][market]);
    }
  }
  const hashArray = await Promise.all(
    shortcutsArray.map(async (shortcut) => {
      const { script, metadata } = await shortcut.build(chainId, provider);
      return buildVerificationHash(metadata.tokensOut![0], script);
    }),
  );
  const shortcutsHashMap: Record<string, Shortcut> = {};
  for (const i in shortcutsArray) {
    shortcutsHashMap[hashArray[i]] = shortcutsArray[i];
  }
  return shortcutsHashMap;
}
