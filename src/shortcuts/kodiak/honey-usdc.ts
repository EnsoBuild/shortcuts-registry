import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';
import { sub } from '@ensofinance/shortcuts-standards/helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getSetterValue, mintHoney, redeemHoney } from '../../utils';

export class KodiakHoneyUsdcShortcut implements Shortcut {
  name = 'kodiak-honey-usdc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      island: Standards.Kodiak_Islands.protocol.addresses!.cartio!.honeyUsdcIsland,
    },
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      island: '0xb73deE52F38539bA854979eab6342A60dD4C8c03',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'usdcToMintHoney']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdc, honey, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [island],
    });
    const amountIn = builder.add(balanceOf(usdc, walletAddress()));
    const usdcToMintHoney = getSetterValue(builder, this.setterInputs, 'usdcToMintHoney');
    const remainingUsdc = sub(amountIn, usdcToMintHoney, builder);
    const mintedAmount = await mintHoney(usdc, usdcToMintHoney, builder);

    await depositKodiak(provider, builder, [usdc, honey], [remainingUsdc, mintedAmount], island, this.setterInputs);

    const leftoverAmount = builder.add(balanceOf(honey, walletAddress()));
    await redeemHoney(usdc, leftoverAmount, builder);

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
      case ChainIds.Cartio:
        return new Map([
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-USDC-HONEY-0.5%' }],
          [chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter, { label: 'Kodiak Island Router' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-USDC-HONEY-0.5%' }],
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
