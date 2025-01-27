import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakWbtcFbtcShortcut implements Shortcut {
  name = 'kodiak-wbtc-fbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      fbtc: chainIdToDeFiAddresses[ChainIds.Berachain].fbtc,
      island: '0xA91D046D26b540c875Bc3CC785181A270bC37704',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, fbtc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc, fbtc],
      tokensOut: [island],
    });
    const amountInWbtc = builder.add(balanceOf(wbtc, walletAddress()));
    const amountInFbtc = builder.add(balanceOf(fbtc, walletAddress()));

    await depositKodiak(provider, builder, [wbtc, fbtc], [amountInWbtc, amountInFbtc], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:wbtc' }],
          [this.inputs[ChainIds.Berachain].fbtc, { label: 'ERC20:fbtc' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-wbtc-fbtc' }],
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
