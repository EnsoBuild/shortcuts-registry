import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getBalance, mintBeraeth, mintErc4626 } from '../../utils';

export class KodiakBeraEthStoneShortcut implements Shortcut {
  name = 'kodiak-beraeth-stone';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      stone: chainIdToDeFiAddresses[ChainIds.Berachain].stone,
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      island: '0x57161d6272F47cd48BA165646c802f001040C2E0',
      infraredVault: '0x7D763143a5C037a03d29b4f7049fe71B197FeC40',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { stone, beraeth, island, weth, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth, stone],
      tokensOut: [infraredVault],
    });
    const wethAmount = builder.add(balanceOf(beraeth, walletAddress()));
    const beraethAmount = await mintBeraeth(wethAmount, builder);

    const stoneAmount = builder.add(balanceOf(stone, walletAddress()));

    await depositKodiak(provider, builder, [beraeth, stone], [beraethAmount, stoneAmount], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].beraeth, { label: 'ERC20:beraeth' }],
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:weth' }],
          [this.inputs[ChainIds.Berachain].stone, { label: 'ERC20:stone' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island beraETH-stone' }],
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
