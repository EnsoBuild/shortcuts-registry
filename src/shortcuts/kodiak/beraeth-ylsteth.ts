import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, mintBeraeth } from '../../utils';

export class KodiakBeraEthYlstethShortcut implements Shortcut {
  name = 'kodiak-beraeth-ylsteth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      ylsteth: chainIdToDeFiAddresses[ChainIds.Berachain].ylsteth,
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      island: '0xba86cd31c9e142ed833748ab6304e82a48d34b32',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { ylsteth, beraeth, island, weth } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth, ylsteth],
      tokensOut: [island],
    });
    const wethAmount = builder.add(balanceOf(beraeth, walletAddress()));
    const beraethAmount = await mintBeraeth(wethAmount, builder);

    const ylstethAmount = builder.add(balanceOf(ylsteth, walletAddress()));

    await depositKodiak(
      provider,
      builder,
      [beraeth, ylsteth],
      [beraethAmount, ylstethAmount],
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
          [this.inputs[ChainIds.Berachain].beraeth, { label: 'ERC20:beraeth' }],
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:weth' }],
          [this.inputs[ChainIds.Berachain].ylsteth, { label: 'ERC20:ylsteth' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island beraETH-ylsteth' }],
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
