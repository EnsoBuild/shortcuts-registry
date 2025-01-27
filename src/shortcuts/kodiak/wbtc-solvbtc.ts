import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakWbtcSolvbtcShortcut implements Shortcut {
  name = 'kodiak-wbtc-solvbtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      solvbtc: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtc,
      island: '0x3879451f4f69F0c2d37CaD45319cFf2E7d29C596',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, solvbtc, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc, solvbtc],
      tokensOut: [island],
    });
    const amountInWbtc = builder.add(balanceOf(wbtc, walletAddress()));
    const amountInSolvbtc = builder.add(balanceOf(solvbtc, walletAddress()));

    await depositKodiak(provider, builder, [wbtc, solvbtc], [amountInWbtc, amountInSolvbtc], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].solvbtc, { label: 'ERC20:solvbtc' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-wbtc-solvbtc' }],
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
