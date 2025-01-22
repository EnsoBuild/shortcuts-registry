import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { sub } from '@ensofinance/shortcuts-standards/helpers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getSetterValue, mintBeraEth } from '../../utils';

export class KodiakberaethwethShortcut implements Shortcut {
  name = 'kodiak-beraeth-weth';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: chainIdToDeFiAddresses[ChainIds.Cartio].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Cartio].beraEth,
      island: '0x4b73646408CB26090aBA90DDC29Bbf5fCb97D1A5',
      primary: chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter,
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'wethToMintBeraEth']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, beraEth, island, primary } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [island],
    });
    const amountIn = builder.add(balanceOf(weth, walletAddress()));
    const wethToMintBeraEth = getSetterValue(builder, this.setterInputs[chainId], 'wethToMintBeraEth');
    const remainingweth = sub(amountIn, wethToMintBeraEth, builder);
    const mintedAmount = await mintBeraEth(wethToMintBeraEth, builder);

    await depositKodiak(
      builder,
      [weth, beraEth],
      [remainingweth, mintedAmount],
      island,
      primary,
      this.setterInputs[chainId],
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
      case ChainIds.Cartio:
        return new Map([
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:weth' }],
          [this.inputs[ChainIds.Cartio].beraeth, { label: 'ERC20:beraEth' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-weth-beraEth-0.5%' }],
          [this.inputs[ChainIds.Cartio].primary, { label: 'Kodiak Island Router' }],
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
