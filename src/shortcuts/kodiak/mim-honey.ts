import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getBalance, mintErc4626, mintHoney, redeemHoney } from '../../utils';

export class KodiakMimHoneyhShortcut implements Shortcut {
  name = 'kodiak-mim-honey';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      mim: chainIdToDeFiAddresses[ChainIds.Berachain].mim,
      island: '0x933b2e6a71edBF11BBA75C5Ad241D246b145E0b0',
      infraredVault: '0x718874A9402f8E5802607D4D1Cc008274F0BD3D4',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { mim, usdc, honey, island, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [mim, usdc],
      tokensOut: [island, infraredVault],
    });

    const mimAmount = builder.add(balanceOf(mim, walletAddress()));
    const usdcAmount = builder.add(balanceOf(usdc, walletAddress()));
    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);

    await depositKodiak(provider, builder, [mim, honey], [mimAmount, mintedAmount], island, this.setterInputs);

    const islandAmount = getBalance(island, builder);
    await mintErc4626(island, infraredVault, islandAmount, builder);

    const leftoverAmount = getBalance(honey, builder);
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
      case ChainIds.Berachain:
        return new Map([
          [chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter, { label: 'Kodiak Island Router' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-MIM-HONEY-0.05%' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].mim, { label: 'ERC20:MIM' }],
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].infraredVault, { label: 'Infrared Vault' }],
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
