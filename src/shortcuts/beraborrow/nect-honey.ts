import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, FromContractCallArg, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';
import { sub } from '@ensofinance/shortcuts-standards/helpers/math';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, getSetterValue, mintHoney, mintNect, redeemHoney, redeemNect } from '../../utils';

export class BeraborrowNectHoneyShortcut implements Shortcut {
  name = 'nect-honey';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      nect: chainIdToDeFiAddresses[ChainIds.Cartio].nect,
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      island: Standards.Kodiak_Islands.protocol.addresses!.cartio!.nectUsdcIsland, // KODI-HONEY-NECT
      quoterV2: chainIdToDeFiAddresses[ChainIds.Cartio].kodiakQuoterV2,
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'usdcToMintHoney']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { honey, nect, usdc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [island],
    });
    const amountIn = builder.add(balanceOf(usdc, walletAddress()));
    const usdcToMintHoney = getSetterValue(builder, this.setterInputs[chainId], 'usdcToMintHoney');
    const remainingUsdc = sub(amountIn, usdcToMintHoney, builder);
    // Get HONEY
    const mintedAmountHoney = await mintHoney(usdc, usdcToMintHoney, builder);
    // Get NECT
    const mintedAmountNect = await mintNect(remainingUsdc, builder);

    await depositKodiak(
      builder,
      [honey, nect],
      [mintedAmountHoney, mintedAmountNect as FromContractCallArg],
      island,
      this.setterInputs[chainId],
    );

    const honeyLeftoverAmount = builder.add(balanceOf(honey, walletAddress()));
    const nectLeftoversAmount = builder.add(balanceOf(nect, walletAddress()));

    await redeemHoney(usdc, honeyLeftoverAmount, builder);
    await redeemNect(nectLeftoversAmount, builder);

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
          [
            this.inputs[ChainIds.Cartio].island,
            {
              label: 'Kodiak Island-HONEY-NECT',
            },
          ],
          [this.inputs[ChainIds.Cartio].primary, { label: 'Kodiak Island Router' }],
          [this.inputs[ChainIds.Cartio].quoterV2, { label: 'Kodiak QuoterV2' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].nect, { label: 'ERC20:NECT' }],
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
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
