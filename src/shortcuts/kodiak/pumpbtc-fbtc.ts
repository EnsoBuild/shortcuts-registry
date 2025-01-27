import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance } from '../../utils';

export class KodiakPumpbtcFbtcShortcut implements Shortcut {
  name = 'kodiak-pumpbtc-fbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      pumpbtc: chainIdToDeFiAddresses[ChainIds.Berachain].pumpbtc,
      fbtc: chainIdToDeFiAddresses[ChainIds.Berachain].fbtc,
      island: '0xbC865D60eCCeC3b412a32f764667291C54C93736',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { pumpbtc, fbtc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [pumpbtc, fbtc],
      tokensOut: [island],
    });
    const amountInPumpbtc = getBalance(pumpbtc, builder);
    const amountInFbtc = getBalance(fbtc, builder);

    await depositKodiak(provider, builder, [pumpbtc, fbtc], [amountInPumpbtc, amountInFbtc], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].fbtc, { label: 'ERC20:fbtc' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-pumpbtc-fbtc' }],
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
