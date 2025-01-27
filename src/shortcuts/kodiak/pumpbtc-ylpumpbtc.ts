import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakPumpbtcYlPumpbtcShortcut implements Shortcut {
  name = 'kodiak-pumpbtc-ylpumpbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      pumpbtc: chainIdToDeFiAddresses[ChainIds.Berachain].pumpbtc,
      ylpumpbtc: chainIdToDeFiAddresses[ChainIds.Berachain].ylpumpbtc,
      island: '0xc64794dc7c550B9A4a8F7cAF68e49F31C0269D90',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { pumpbtc, ylpumpbtc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [pumpbtc, ylpumpbtc],
      tokensOut: [island],
    });
    const amountInPumpbtc = builder.add(balanceOf(pumpbtc, walletAddress()));
    const amountInYlPumpbtc = builder.add(balanceOf(ylpumpbtc, walletAddress()));

    await depositKodiak(
      provider,
      builder,
      [pumpbtc, ylpumpbtc],
      [amountInPumpbtc, amountInYlPumpbtc],
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
          [this.inputs[ChainIds.Berachain].ylpumpbtc, { label: 'ERC20:ylpumpbtc' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-pumpbtc-ylpumpbtc' }],
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
