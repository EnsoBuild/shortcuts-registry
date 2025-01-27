import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getBalance, mintErc4626, mintHoney, redeemHoney } from '../../utils';

export class KodiakSusdeHoneyShortcut implements Shortcut {
  name = 'kodiak-susde-honey';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      susde: chainIdToDeFiAddresses[ChainIds.Berachain].susde,
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      island: '0xD5B6EA3544a51BfdDa7E6926BdF778339801dFe8',
      infraredVault: '0x1eCe52A596C2cBEf7b71Fa8FA8FC738aA7Ad441f',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { susde, usdc, honey, island, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [susde, usdc],
      tokensOut: [infraredVault],
    });
    const usdcAmount = getBalance(usdc, builder);
    const susdeAmount = getBalance(susde, builder);
    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);

    await depositKodiak(provider, builder, [susde, honey], [susdeAmount, mintedAmount], island, this.setterInputs);

    const islandAmount = getBalance(island, builder);
    await mintErc4626(island, infraredVault, islandAmount, builder);

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
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].susde, { label: 'ERC20:susde' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-susde-HONEY-0.3%' }],
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
