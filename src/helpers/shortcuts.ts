import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { BeraborrowBeraethShortcut } from '../shortcuts/beraborrow/beraeth';
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
import { ConcreteBeraethShortcut } from '../shortcuts/concrete/beraeth';
import { ConcreteLbtcShortcut } from '../shortcuts/concrete/lbtc';
import { ConcreteSusdeShortcut } from '../shortcuts/concrete/susde';
import { ConcreteUsdeShortcut } from '../shortcuts/concrete/usde';
import { ConcreteWbtcShortcut } from '../shortcuts/concrete/wbtc';
import { D2UsdcBeralandShortcut } from '../shortcuts/d2/usdc-beraland';
import { D2UsdcHyperberaShortcut } from '../shortcuts/d2/usdc-hyperbera';
import { D2UsdcKodiakplusShortcut } from '../shortcuts/d2/usdc-kodiakplus';
import { DahliaStonewethShortcut } from '../shortcuts/dahlia/stoneweth';
import { DahliaSusdcusdcShortcut } from '../shortcuts/dahlia/susdcusdc';
import { DahliaWberausdcShortcut } from '../shortcuts/dahlia/wberausdc';
import { DolomiteDberaethShortcut } from '../shortcuts/dolomite/dberaeth';
import { DolomiteDnectShortcut } from '../shortcuts/dolomite/dnect';
import { DolomiteDPumpBtcShortcut } from '../shortcuts/dolomite/dpumpbtc';
import { DolomiteDRsEthShortcut } from '../shortcuts/dolomite/drseth';
import { DolomiteDrswethShortcut } from '../shortcuts/dolomite/drsweth';
import { DolomiteDSbtcShortcut } from '../shortcuts/dolomite/dsbtc';
import { DolomiteDsolvbtcShortcut } from '../shortcuts/dolomite/dsolvbtc';
import { DolomiteDsolvbtcbnnShortcut } from '../shortcuts/dolomite/dsolvbtcbnn';
import { DolomiteDstoneShortcut } from '../shortcuts/dolomite/dstone';
import { DolomiteDsusdeShortcut } from '../shortcuts/dolomite/dsusde';
import { DolomiteDunibtcShortcut } from '../shortcuts/dolomite/dunibtc';
import { DolomiteDusdaShortcut } from '../shortcuts/dolomite/dusda';
import { DolomiteDUsdcShortcut } from '../shortcuts/dolomite/dusdc';
import { DolomiteDusdeShortcut } from '../shortcuts/dolomite/dusde';
import { DolomiteDylbtclstShortcut } from '../shortcuts/dolomite/dylbtclst';
import { DolomiteDYlPumpBtcShortcut } from '../shortcuts/dolomite/dylpumpbtc';
import { DolomiteDylstethShortcut } from '../shortcuts/dolomite/dylsteth';
import { DolomiteInfraredDethShortcut } from '../shortcuts/dolomite/ir-deth';
import { DolomiteInfraredDHoneyShortcut } from '../shortcuts/dolomite/ir-dhoney';
import { DolomiteInfraredDUsdtShortcut } from '../shortcuts/dolomite/ir-dusdt';
import { DolomiteInfraredDwbtcShortcut } from '../shortcuts/dolomite/ir-dwbtc';
import { GoldilocksRsethRsethotShortcut } from '../shortcuts/goldilocks/rseth-rsethot';
import { GoldilockssolvbtcbnnsolvbtcbnnOtShortcut } from '../shortcuts/goldilocks/solvbtcbnnot-solvbtc';
import { GoldilocksUniBtcUniBtcOtShortcut } from '../shortcuts/goldilocks/unibtc-unibtcot';
import { KodiakBeraEthRswEthShortcut } from '../shortcuts/kodiak/beraeth-rsweth';
import { KodiakBeraEthStoneShortcut } from '../shortcuts/kodiak/beraeth-stone';
import { KodiakBeraEthYlstethShortcut } from '../shortcuts/kodiak/beraeth-ylsteth';
import { KodiakUsdaHoneyShortcut } from '../shortcuts/kodiak/honey-usda';
import { KodiakHoneyUsdcShortcut } from '../shortcuts/kodiak/honey-usdc';
import { KodiakMimHoneyhShortcut } from '../shortcuts/kodiak/mim-honey';
import { KodiakPumpbtcFbtcShortcut } from '../shortcuts/kodiak/pumpbtc-fbtc';
import { KodiakPumpbtcYlBtcLstShortcut } from '../shortcuts/kodiak/pumpbtc-ylbtclst';
import { KodiakPumpbtcYlPumpbtcShortcut } from '../shortcuts/kodiak/pumpbtc-ylpumpbtc';
import { KodiakRsethBeraethShortcut } from '../shortcuts/kodiak/rseth-beraeth';
import { KodiaksRsethYlrsethShortcut } from '../shortcuts/kodiak/rseth-ylrseth';
import { KodiakRusdHoneyShortcut } from '../shortcuts/kodiak/rusd-honey';
import { KodiakSolvbtcFbtcShortcut } from '../shortcuts/kodiak/solvbtc-fbtc';
import { KodiaksolvbtcsolvbtcbnnShortcut } from '../shortcuts/kodiak/solvbtc-solvbtcbnn';
import { KodiakSusdaUsdaShortcut } from '../shortcuts/kodiak/susda-usda';
import { KodiakSusdeHoneyShortcut } from '../shortcuts/kodiak/susde-honey';
import { KodiakUnibtcYlBtcLstShortcut } from '../shortcuts/kodiak/unibtc-ylbtclst';
import { KodiakUsdeHoneyShortcut } from '../shortcuts/kodiak/usde-honey';
import { KodiakUsdeUsdaShortcut } from '../shortcuts/kodiak/usde-usda';
import { KodiakUsdtHoneyShortcut } from '../shortcuts/kodiak/usdt-honey';
import { KodiakWbtcFbtcShortcut } from '../shortcuts/kodiak/wbtc-fbtc';
import { KodiakWbtcHoneyShortcut } from '../shortcuts/kodiak/wbtc-honey';
import { KodiakWbtcPumpbtcShortcut } from '../shortcuts/kodiak/wbtc-pumpbtc';
import { KodiakWbtcSbtcShortcut } from '../shortcuts/kodiak/wbtc-sbtc';
import { KodiakWbtcSolvbtcShortcut } from '../shortcuts/kodiak/wbtc-solvbtc';
import { KodiakWbtcStbtcShortcut } from '../shortcuts/kodiak/wbtc-stbtc';
import { KodiakWbtcUnibtcShortcut } from '../shortcuts/kodiak/wbtc-unibtc';
import { KodiakWbtcWabtcShortcut } from '../shortcuts/kodiak/wbtc-wabtc';
import { KodiakWbtcWethShortcut } from '../shortcuts/kodiak/wbtc-weth';
import { KodiakWethBeraethShortcut } from '../shortcuts/kodiak/weth-beraeth';
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
    beraeth: new BeraborrowBeraethShortcut(),
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
    beraeth: new ConcreteBeraethShortcut(),
    wbtc: new ConcreteWbtcShortcut(),
    lbtc: new ConcreteLbtcShortcut(),
    susde: new ConcreteSusdeShortcut(),
    usde: new ConcreteUsdeShortcut(),
  },
  dahlia: {
    susdcusdc: new DahliaSusdcusdcShortcut(),
    stoneweth: new DahliaStonewethShortcut(),
    wberausdc: new DahliaWberausdcShortcut(),
  },
  dolomite: {
    'ir-deth': new DolomiteInfraredDethShortcut(),
    'ir-dhoney': new DolomiteInfraredDHoneyShortcut(),
    'ir-dusdt': new DolomiteInfraredDUsdtShortcut(),
    'ir-dwbtc': new DolomiteInfraredDwbtcShortcut(),
    dberaeth: new DolomiteDberaethShortcut(),
    dnect: new DolomiteDnectShortcut(),
    dpumpbtc: new DolomiteDPumpBtcShortcut(),
    drseth: new DolomiteDRsEthShortcut(),
    drsweth: new DolomiteDrswethShortcut(),
    dsbtc: new DolomiteDSbtcShortcut(),
    dsolvbtc: new DolomiteDsolvbtcShortcut(),
    dsolvbtcbnn: new DolomiteDsolvbtcbnnShortcut(),
    dstbtc: new DolomiteDSbtcShortcut(),
    dstone: new DolomiteDstoneShortcut(),
    dsusda: new DolomiteDusdaShortcut(),
    dsusde: new DolomiteDsusdeShortcut(),
    dunibtc: new DolomiteDunibtcShortcut(),
    dusda: new DolomiteDusdaShortcut(),
    dusdc: new DolomiteDUsdcShortcut(),
    dusde: new DolomiteDusdeShortcut(),
    dylbtclst: new DolomiteDylbtclstShortcut(),
    dylpumpbtc: new DolomiteDYlPumpBtcShortcut(),
    dylsteth: new DolomiteDylstethShortcut(),
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
    'beraeth-rsweth': new KodiakBeraEthRswEthShortcut(),
    'beraeth-stone': new KodiakBeraEthStoneShortcut(),
    'beraeth-ylsteth': new KodiakBeraEthYlstethShortcut(),
    'honey-usda': new KodiakUsdaHoneyShortcut(),
    'honey-usdc': new KodiakHoneyUsdcShortcut(),
    'mim-honey': new KodiakMimHoneyhShortcut(),
    'pumpbtc-fbtc': new KodiakPumpbtcFbtcShortcut(),
    'pumpbtc-ylbtclst': new KodiakPumpbtcYlBtcLstShortcut(),
    'pumpbtc-ylpumpbtc': new KodiakPumpbtcYlPumpbtcShortcut(),
    'rseth-beraeth': new KodiakRsethBeraethShortcut(),
    'rseth-ylrseth': new KodiaksRsethYlrsethShortcut(),
    'rusd-honey': new KodiakRusdHoneyShortcut(),
    'solvbtc-fbtc': new KodiakSolvbtcFbtcShortcut(),
    'solvbtc-solvbtcbnn': new KodiaksolvbtcsolvbtcbnnShortcut(),
    'susda-usda': new KodiakSusdaUsdaShortcut(),
    'susde-honey': new KodiakSusdeHoneyShortcut(),
    'unibtc-ylbtclst': new KodiakUnibtcYlBtcLstShortcut(),
    'usde-honey': new KodiakUsdeHoneyShortcut(),
    'usde-usda': new KodiakUsdeUsdaShortcut(),
    'usdt-honey': new KodiakUsdtHoneyShortcut(),
    'wbtc-fbtc': new KodiakWbtcFbtcShortcut(),
    'wbtc-honey': new KodiakWbtcHoneyShortcut(),
    'wbtc-pumpbtc': new KodiakWbtcPumpbtcShortcut(),
    'wbtc-sbtc': new KodiakWbtcSbtcShortcut(),
    'wbtc-solvbtc': new KodiakWbtcSolvbtcShortcut(),
    'wbtc-stbtc': new KodiakWbtcStbtcShortcut(),
    'wbtc-unibtc': new KodiakWbtcUnibtcShortcut(),
    'wbtc-wabtc': new KodiakWbtcWabtcShortcut(),
    'wbtc-weth': new KodiakWbtcWethShortcut(),
    'weth-beraeth': new KodiakWethBeraethShortcut(),
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
