import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakSusdaUsdaShortcut implements Shortcut {
  name = 'kodiak-susda-usda';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      susda: chainIdToDeFiAddresses[ChainIds.Berachain].susda,
      usda: chainIdToDeFiAddresses[ChainIds.Berachain].usda,
      island: '0x7CeBCc76A2faecC0aE378b340815fcbb71eC1Fe0',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { susda, usda, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [susda, usda],
      tokensOut: [island],
    });
    const amountInsusda = builder.add(balanceOf(susda, walletAddress()));
    const amountInusda = builder.add(balanceOf(usda, walletAddress()));

    await depositKodiak(provider, builder, [susda, usda], [amountInsusda, amountInusda], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].susda, { label: 'ERC20:susda' }],
          [this.inputs[ChainIds.Berachain].usda, { label: 'ERC20:usda' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-susda-usda-0.3%' }],
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
