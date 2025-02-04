import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, FromContractCallArg, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';
import { sub } from '@ensofinance/shortcuts-standards/helpers/math';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import {
  balanceOf,
  depositKodiak,
  getSetterValue,
  mintHoney,
  mintNectWithUsdc,
  redeemHoney,
  redeemNectForUsc,
} from '../../utils';

export class BeraborrowNectHoneyShortcut implements Shortcut {
  name = 'beraborrow-nect-honey';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      nect: chainIdToDeFiAddresses[ChainIds.Cartio].nect,
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      island: Standards.Kodiak_Islands.protocol.addresses!.cartio!.nectUsdcIsland, // KODI-HONEY-NECT
    },
    [ChainIds.Berachain]: {
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      nect: chainIdToDeFiAddresses[ChainIds.Berachain].nect,
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      island: '0x74E852a4f88bfbEff01275bB95d5ed77f2967d12', // KODI-HONEY-NECT
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'usdcToMintHoney']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { honey, nect, usdc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [island],
    });
    const usdcAmount = builder.add(balanceOf(usdc, walletAddress()));
    const usdcToMintHoney = getSetterValue(builder, this.setterInputs, 'usdcToMintHoney');
    const remainingUsdc = sub(usdcAmount, usdcToMintHoney, builder);
    // Get HONEY
    const honeyMintedAmount = await mintHoney(usdc, usdcToMintHoney, builder);
    // Get NECT
    const nectMintedAmount = await mintNectWithUsdc(remainingUsdc, builder);

    await depositKodiak(
      provider,
      builder,
      [honey, nect],
      [honeyMintedAmount, nectMintedAmount as FromContractCallArg],
      island,
      this.setterInputs,
    );

    const honeyLeftoverAmount = builder.add(balanceOf(honey, walletAddress()));
    const nectLeftoversAmount = builder.add(balanceOf(nect, walletAddress()));

    await redeemHoney(usdc, honeyLeftoverAmount, builder);
    await redeemNectForUsc(nectLeftoversAmount, builder);

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
          [chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter, { label: 'Kodiak Island Router' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].nect, { label: 'ERC20:NECT' }],
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [
            this.inputs[ChainIds.Berachain].island,
            {
              label: 'Kodiak Island-HONEY-NECT',
            },
          ],
          [chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter, { label: 'Kodiak Island Router' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].nect, { label: 'ERC20:NECT' }],
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
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
