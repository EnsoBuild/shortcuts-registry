import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance } from '../../utils';

export class KodiaksolvbtcsolvbtcbnnShortcut implements Shortcut {
  name = 'kodiak-solvbtcbnn-solvbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      solvbtc: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtc,
      solvbtcbnn: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtcbnn,
      island: '0x43E487126c4F37D1915cF02a90B5C5295AFb1790',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { solvbtc, solvbtcbnn, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtc, solvbtcbnn],
      tokensOut: [island],
    });
    const amountInSolvbtc = getBalance(solvbtc, builder);
    const amountInSolvbtcbnn = getBalance(solvbtcbnn, builder);

    await depositKodiak(
      provider,
      builder,
      [solvbtc, solvbtcbnn],
      [amountInSolvbtc, amountInSolvbtcbnn],
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
          [this.inputs[ChainIds.Berachain].solvbtc, { label: 'ERC20:solvbtc' }],
          [this.inputs[ChainIds.Berachain].solvbtcbnn, { label: 'ERC20:solvbtcbnn' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-solvbtc-solvbtcbnn' }],
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
