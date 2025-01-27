import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { sub } from '@ensofinance/shortcuts-standards/helpers';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance, getSetterValue, mintBeraeth, mintErc4626 } from '../../utils';

export class KodiakWethBeraethShortcut implements Shortcut {
  name = 'kodiak-weth-beraeth';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      island: '0x03bCcF796cDef61064c4a2EffdD21f1AC8C29E92',
      primary: chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter,
      infraredVault: '0xbdc6D8481Ba06fA7BB043AB0fb74BAE9e774BF12',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'wethTomintBeraeth']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, beraeth, island, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [infraredVault],
    });
    const amountIn = getBalance(weth, builder);
    const wethTomintBeraeth = getSetterValue(builder, this.setterInputs, 'wethTomintBeraeth');
    const remainingweth = sub(amountIn, wethTomintBeraeth, builder);
    const beraethAmount = await mintBeraeth(wethTomintBeraeth, builder);

    await depositKodiak(provider, builder, [weth, beraeth], [remainingweth, beraethAmount], island, this.setterInputs);

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
      case ChainIds.Cartio:
        return new Map([
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:weth' }],
          [this.inputs[ChainIds.Cartio].beraeth, { label: 'ERC20:beraeth' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-weth-beraeth-0.5%' }],
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
