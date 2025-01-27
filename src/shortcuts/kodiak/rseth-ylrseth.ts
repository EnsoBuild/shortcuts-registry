import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance } from '../../utils';

export class KodiaksRsethYlrsethShortcut implements Shortcut {
  name = 'kodiak-rseth-ylrseth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      ylrseth: chainIdToDeFiAddresses[ChainIds.Berachain].ylrseth,
      rseth: chainIdToDeFiAddresses[ChainIds.Berachain].rseth,
      island: '0xFF619BDaeDF635251c3aF5BFa82bcaf856C95cC3',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { ylrseth, rseth, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [ylrseth, rseth],
      tokensOut: [island],
    });
    const amountInYlrseth = getBalance(ylrseth, builder);
    const amountInRseth = getBalance(rseth, builder);

    await depositKodiak(
      provider,
      builder,
      [rseth, ylrseth],
      [amountInYlrseth, amountInRseth],
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
          [this.inputs[ChainIds.Berachain].ylrseth, { label: 'ERC20:ylrseth' }],
          [this.inputs[ChainIds.Berachain].rseth, { label: 'ERC20:rseth' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-rseth-ylrseth' }],
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
