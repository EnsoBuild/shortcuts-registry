import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakPumpbtcYlBtcLstShortcut implements Shortcut {
  name = 'kodiak-pumpbtc-ylbtclst';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      pumpbtc: chainIdToDeFiAddresses[ChainIds.Berachain].pumpbtc,
      ylbtclst: chainIdToDeFiAddresses[ChainIds.Berachain].ylbtclst,
      island: '0x377daaf5043eBDBDf15e79edB143D7e2df2ecF4A',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { pumpbtc, ylbtclst, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [pumpbtc, ylbtclst],
      tokensOut: [island],
    });
    const amountInPumpbtc = builder.add(balanceOf(pumpbtc, walletAddress()));
    const amountInYlBtcLst = builder.add(balanceOf(ylbtclst, walletAddress()));

    await depositKodiak(
      provider,
      builder,
      [pumpbtc, ylbtclst],
      [amountInPumpbtc, amountInYlBtcLst],
      island,
      this.setterInputs,
    );

    const payload = await builder.build({
      requireWeiroll: true,
      returnWeirollScript: true,
    });

    return {
      script: payload.shortcut as WeirollScript,
      metadata: builder.metadata,
    };
  }

  getAddressData(chainId: number): Map<AddressArg, AddressData> {
    switch (chainId) {
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].pumpbtc, { label: 'ERC20:pumpbtc' }],
          [this.inputs[ChainIds.Berachain].ylbtclst, { label: 'ERC20:ylbtclst' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-pumpbtc-ylbtclst' }],
          [chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter, { label: 'Kodiak Island Router' }],
        ]);
      default:
        throw new Error(`Unsupported chainId: ${chainId}`);
    }
  }
  getTokenHolder(chainId: number): Map<AddressArg, AddressArg> {
    const tokenToHolder = chainIdToTokenHolder.get(chainId);
    if (!tokenToHolder) throw new Error(`Unsupported 'chainId': ${chainId}`);

    return tokenToHolder as Map<AddressArg, AddressArg>;
  }
}
