import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDWbtcShortcut implements Shortcut {
  name = 'dolomite-wbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Cartio].wbtc,
      vault: '0x29cF6e8eCeFb8d3c9dd2b727C1b7d1df1a754F6f', //dwbtc
    },
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      vault: '0x29cF6e8eCeFb8d3c9dd2b727C1b7d1df1a754F6f', //dwbtc
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc],
      tokensOut: [vault],
    });

    const wbtcAmount = getBalance(wbtc, builder);
    const vaultAmount = await mintErc4626(wbtc, vault, wbtcAmount, builder);

    ensureMinAmountOut(vaultAmount, builder);

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
          [this.inputs[ChainIds.Cartio].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:dWBTC' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:dWBTC' }],
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
