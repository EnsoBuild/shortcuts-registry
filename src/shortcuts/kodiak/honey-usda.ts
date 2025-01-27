import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getBalance, mintHoney, redeemHoney } from '../../utils';

export class KodiakUsdaHoneyShortcut implements Shortcut {
  name = 'kodiak-usda-honey';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usda: chainIdToDeFiAddresses[ChainIds.Berachain].usda,
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      island: '0xbfbEfcfAE7a58C14292B53C2CcD95bF2c5742EB0',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usda, usdc, honey, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usda, usdc],
      tokensOut: [island],
    });

    const usdcAmount = getBalance(usdc, builder);
    const usdaAmount = getBalance(usda, builder);

    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);
    await depositKodiak(provider, builder, [honey, usda], [mintedAmount, usdaAmount], island, this.setterInputs);

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
          [this.inputs[ChainIds.Cartio].usda, { label: 'ERC20:usda' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-usda-HONEY-0.5%' }],
          [chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter, { label: 'Kodiak Island Router' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].usda, { label: 'ERC20:usda' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-usda-HONEY-0.3%' }],
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
