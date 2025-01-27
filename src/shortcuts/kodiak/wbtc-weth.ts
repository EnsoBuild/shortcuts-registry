import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance, mintErc4626 } from '../../utils';

export class KodiakWbtcWethShortcut implements Shortcut {
  name = 'kodiak-wbtc-weth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      island: '0x58FDB6EEbf7df7Ce4137994436fb0e629Bb84b84',
      infraredVault: '0x2Bdf0C4960f6B2fC8b2094956d3bCd848F60b931',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, wbtc, island, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc, weth],
      tokensOut: [island, infraredVault],
    });
    const amountInWeth = getBalance(weth, builder);
    const amountInWbtc = getBalance(wbtc, builder);

    await depositKodiak(provider, builder, [wbtc, weth], [amountInWbtc, amountInWeth], island, this.setterInputs);

    const islandAmount = getBalance(island, builder);
    await mintErc4626(island, infraredVault, islandAmount, builder);

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
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:WETH' }],
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-WETH-WBTC-0.3%' }],
          [this.inputs[ChainIds.Berachain].infraredVault, { label: 'Infrared Vault' }],
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
