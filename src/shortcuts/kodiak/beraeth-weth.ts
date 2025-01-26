import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { sub } from '@ensofinance/shortcuts-standards/helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance, getSetterValue, mintBeraEth } from '../../utils';

export class KodiakbBraethwethShortcut implements Shortcut {
  name = 'kodiak-beraeth-weth';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: chainIdToDeFiAddresses[ChainIds.Cartio].weth,
      beraEth: chainIdToDeFiAddresses[ChainIds.Cartio].beraEth,
      island: '0x4b73646408CB26090aBA90DDC29Bbf5fCb97D1A5',
      primary: chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter,
    },
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraEth: chainIdToDeFiAddresses[ChainIds.Berachain].beraEth,
      island: '0x03bCcF796cDef61064c4a2EffdD21f1AC8C29E92',
      primary: chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter,
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'wethToMintBeraEth']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, beraEth, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [island],
    });
    const amountIn = getBalance(weth, builder);
    const wethToMintBeraEth = getSetterValue(builder, this.setterInputs, 'wethToMintBeraEth');
    const remainingweth = sub(amountIn, wethToMintBeraEth, builder);
    const beraEthAmount = await mintBeraEth(wethToMintBeraEth, builder);

    await depositKodiak(provider, builder, [weth, beraEth], [remainingweth, beraEthAmount], island, this.setterInputs);

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
