import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakUsdeUsdaShortcut implements Shortcut {
  name = 'kodiak-usda-usde';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usde: chainIdToDeFiAddresses[ChainIds.Berachain].usde,
      usda: chainIdToDeFiAddresses[ChainIds.Berachain].usda,
      island: '0x63b0EdC427664D4330F72eEc890A86b3F98ce225',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usde, usda, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usde, usda],
      tokensOut: [island],
    });
    const amountInusde = builder.add(balanceOf(usde, walletAddress()));
    const amountInusda = builder.add(balanceOf(usda, walletAddress()));

    await depositKodiak(provider, builder, [usde, usda], [amountInusde, amountInusda], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].usde, { label: 'ERC20:usde' }],
          [this.inputs[ChainIds.Berachain].usda, { label: 'ERC20:usda' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-usde-usda-0.3%' }],
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
