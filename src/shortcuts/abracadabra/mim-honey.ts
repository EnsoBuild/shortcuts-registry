import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, mintHoney, redeemHoney } from '../../utils';

export class AbracadabraMimHoneyhortcut implements Shortcut {
  name = 'abracadabra-mim-honey';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      mim: chainIdToDeFiAddresses[ChainIds.Cartio].mim,
      island: '0x150683BF3f0a344e271fc1b7dac3783623e7208A',
      primary: chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter,
    },
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      mim: chainIdToDeFiAddresses[ChainIds.Berachain].mim,
      island: '0x933b2e6a71edBF11BBA75C5Ad241D246b145E0b0',
      primary: chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter,
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { mim, usdc, honey, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [mim, usdc],
      tokensOut: [island],
    });

    const mimAmount = builder.add(balanceOf(mim, walletAddress()));
    const usdcAmount = builder.add(balanceOf(usdc, walletAddress()));
    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);

    await depositKodiak(provider, builder, [mim, honey], [mimAmount, mintedAmount], island, this.setterInputs);

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
          [
            this.inputs[ChainIds.Cartio].island,
            {
              label: 'Kodiak Island-HONEY-NECT',
            },
          ],
          [this.inputs[ChainIds.Cartio].primary, { label: 'Kodiak Island Router' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-MIM-HONEY-0.05%' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].mim, { label: 'ERC20:MIM' }],
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
