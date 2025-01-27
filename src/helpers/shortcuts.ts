import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { BeraborrowBeraethShortcut } from '../shortcuts/beraborrow/beraEth';
import { BeraborrowNectHoneyShortcut } from '../shortcuts/beraborrow/nect-honey';
import { BeraborrowNectUsdeShortcut } from '../shortcuts/beraborrow/nect-usde';
import { BeraborrowPumpbtcShortcut } from '../shortcuts/beraborrow/pumpbtc';
import { BeraborrowRsethShortcut } from '../shortcuts/beraborrow/rseth';
import { BeraborrowSbtcShortcut } from '../shortcuts/beraborrow/sbtc';
import { BeraborrowSolvbtcShortcut } from '../shortcuts/beraborrow/solvbtc';
import { BeraborrowSolvbtcbnnShortcut } from '../shortcuts/beraborrow/solvbtcbnn';
import { BeraborrowStbtcShortcut } from '../shortcuts/beraborrow/stbtc';
import { BeraborrowStoneShortcut } from '../shortcuts/beraborrow/stone';
import { BeraborrowUnibtcShortcut } from '../shortcuts/beraborrow/unibtc';
import { BeraborrowWbtcHoneyShortcut } from '../shortcuts/beraborrow/wbtc-honey';
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
import { D2UsdcBeralandShortcut } from '../shortcuts/d2/usdc-beraland';
import { D2UsdcHyperberaShortcut } from '../shortcuts/d2/usdc-hyperbera';
import { D2UsdcKodiakplusShortcut } from '../shortcuts/d2/usdc-kodiakplus';
import { DahliaUsdcShortcut } from '../shortcuts/dahlia/usdc';
import { DahliaWethShortcut } from '../shortcuts/dahlia/weth';
import { DolomiteDberaethShortcut } from '../shortcuts/dolomite/dberaeth';
import { DolomiteDnectShortcut } from '../shortcuts/dolomite/dnect';
import { DolomiteDPumpBtcShortcut } from '../shortcuts/dolomite/dpumpbtc';
import { DolomiteDRsEthShortcut } from '../shortcuts/dolomite/drseth';
import { DolomiteDSbtcShortcut } from '../shortcuts/dolomite/dsbtc';
import { DolomiteDUsdcShortcut } from '../shortcuts/dolomite/dusdc';
import { DolomiteDYlPumpBtcShortcut } from '../shortcuts/dolomite/dylpumpbtc';
import { DolomiteInfraredDethShortcut } from '../shortcuts/dolomite/ir-deth';
import { DolomiteInfraredDHoneyShortcut } from '../shortcuts/dolomite/ir-dhoney';
import { DolomiteInfraredDUsdtShortcut } from '../shortcuts/dolomite/ir-dusdt';
import { DolomiteInfraredDwbtcShortcut } from '../shortcuts/dolomite/ir-dwbtc';
import { GoldilocksRsethRsethotShortcut } from '../shortcuts/goldilocks/rseth-rsethot';
import { GoldilockssolvbtcbnnsolvbtcbnnOtShortcut } from '../shortcuts/goldilocks/solvbtcbnnot-solvbtc';
import { GoldilocksUniBtcUniBtcOtShortcut } from '../shortcuts/goldilocks/unibtc-unibtcot';
import { KodiakbBraethwethShortcut } from '../shortcuts/kodiak/beraeth-weth';
import { KodiakHoneyUsdcShortcut } from '../shortcuts/kodiak/honey-usdc';
import { KodiakMimHoneyhShortcut } from '../shortcuts/kodiak/mim-honey';
import { KodiakRusdHoneyShortcut } from '../shortcuts/kodiak/rusd-honey';
import { KodiakSusdaUsdaShortcut } from '../shortcuts/kodiak/susda-usda';
import { KodiakUsdeUsdaShortcut } from '../shortcuts/kodiak/usde-usda';
import { KodiakUsdtHoneyShortcut } from '../shortcuts/kodiak/usdt-honey';
import { KodiakwbtcHoneyShortcut } from '../shortcuts/kodiak/wbtc-honey';
import { KodiakWbtcUnibtcShortcut } from '../shortcuts/kodiak/wbtc-unibtc';
import { KodiakWbtcWethShortcut } from '../shortcuts/kodiak/wbtc-weth';
import { KodiakWethHoneyShortcut } from '../shortcuts/kodiak/weth-honey';
import { KodiaksWethStoneShortcut } from '../shortcuts/kodiak/weth-stone';
import { OrigamiBoycoHoneyShortcut } from '../shortcuts/origami/oboy-HONEY-a';
import { SatlayerLbtcShortcut } from '../shortcuts/satlayer/lbtc';
import { SatlayerPumpBtcShortcut } from '../shortcuts/satlayer/pumpbtc';
import { SatlayerSbtcShortcut } from '../shortcuts/satlayer/sbtc';
import { SatlayerSolvbtcbnnBnnShortcut } from '../shortcuts/satlayer/solvbtcbnn';
import { SatlayerUnibtcShortcut } from '../shortcuts/satlayer/unibtc';
import { SatlayerWabtcShortcut } from '../shortcuts/satlayer/wabtc';
import { ThjUsdcShortcut } from '../shortcuts/thj/usdc';
import { VedaLbtcShortcut } from '../shortcuts/veda/lbtc';
import { VedaUsdcShortcut } from '../shortcuts/veda/usdc';
import { VedaWbtcShortcut } from '../shortcuts/veda/wbtc';
import { VedaWeethShortcut } from '../shortcuts/veda/weeth';
import { VedaWethShortcut } from '../shortcuts/veda/weth';
import { Shortcut } from '../types';
import { buildVerificationHash } from './utils';

export const shortcuts: Record<string, Record<string, Shortcut>> = {
  beraborrow: {
    'nect-honey': new BeraborrowNectHoneyShortcut(),
    'nect-usde': new BeraborrowNectUsdeShortcut(),
    'wbtc-honey': new BeraborrowWbtcHoneyShortcut(),
    'wbtc-weth': new BeraborrowWbtcWethShortcut(),
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
    weth: new BeraborrowWethShortcut(),
    ylbtclst: new BeraborrowYlbtclstShortcut(),
    ylpumpbtc: new BeraborrowYlpumpbtcShortcut(),
    ylrseth: new BeraborrowYlrsethShortcut(),
    ylsteth: new BeraborrowYlstethShortcut(),
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
    dberaeth: new DolomiteDberaethShortcut(),
    dnect: new DolomiteDnectShortcut(),
    dpumpbtc: new DolomiteDPumpBtcShortcut(),
    drseth: new DolomiteDRsEthShortcut(),
    dsbtc: new DolomiteDSbtcShortcut(),
    dusdc: new DolomiteDUsdcShortcut(),
    dylpumpbtc: new DolomiteDYlPumpBtcShortcut(),
    'ir-deth': new DolomiteInfraredDethShortcut(),
    'ir-dusdt': new DolomiteInfraredDUsdtShortcut(),
    'ir-dhoney': new DolomiteInfraredDHoneyShortcut(),
    'ir-dwbtc': new DolomiteInfraredDwbtcShortcut(),
  },
  d2: {
    'usdc-kodiakplus': new D2UsdcKodiakplusShortcut(),
    'usdc-beraland': new D2UsdcBeralandShortcut(),
    'usdc-hyperbera': new D2UsdcHyperberaShortcut(),
  },

  goldilocks: {
    'unibtc-unibtcot': new GoldilocksUniBtcUniBtcOtShortcut(),
    'rseth-rsethot': new GoldilocksRsethRsethotShortcut(),
    'solvbtcbnnot-solvbtc': new GoldilockssolvbtcbnnsolvbtcbnnOtShortcut(),
  },
  kodiak: {
    'beraeth-weth': new KodiakbBraethwethShortcut(),
    'honey-usdc': new KodiakHoneyUsdcShortcut(),
    'mim-honey': new KodiakMimHoneyhShortcut(),
    'rusd-honey': new KodiakRusdHoneyShortcut(),
    'susda-usda': new KodiakSusdaUsdaShortcut(),
    'usde-usda': new KodiakUsdeUsdaShortcut(),
    'usdt-honey': new KodiakUsdtHoneyShortcut(),
    'wbtc-honey': new KodiakwbtcHoneyShortcut(),
    'wbtc-unibtc': new KodiakWbtcUnibtcShortcut(),
    'wbtc-weth': new KodiakWbtcWethShortcut(),
    'weth-honey': new KodiakWethHoneyShortcut(),
    'weth-stone': new KodiaksWethStoneShortcut(),
  },
  veda: {
    usdc: new VedaUsdcShortcut(),
    lbtc: new VedaLbtcShortcut(),
    wbtc: new VedaWbtcShortcut(),
    weth: new VedaWethShortcut(),
    weeth: new VedaWeethShortcut(),
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
    unibtc: new SatlayerUnibtcShortcut(),
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
