import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance } from '../../utils';

export class KodiakSolvbtcFbtcShortcut implements Shortcut {
  name = 'kodiak-solvbtc-fbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      solvbtc: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtc,
      fbtc: chainIdToDeFiAddresses[ChainIds.Berachain].fbtc,
      island: '0x7297485557E5488Ff416A8349aF29717dF7AE625',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { solvbtc, fbtc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtc, fbtc],
      tokensOut: [island],
    });
    const amountInSolvbtc = getBalance(solvbtc, builder);
    const amountInFbtc = getBalance(fbtc, builder);

    await depositKodiak(provider, builder, [solvbtc, fbtc], [amountInSolvbtc, amountInFbtc], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].solvbtc, { label: 'ERC20:solvbtc' }],
          [this.inputs[ChainIds.Berachain].fbtc, { label: 'ERC20:fbtc' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-solvbtc-fbtc' }],
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
