import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteInfraredDwbtcShortcut implements Shortcut {
  name = 'dolomite-infrared-dwbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      vault: '0x29cF6e8eCeFb8d3c9dd2b727C1b7d1df1a754F6f', //dwbtc
      infraredVault: '0x104E92e8F7aA38A6e2f5f52ADFf357Ab05738D71',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, vault, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc],
      tokensOut: [infraredVault],
    });

    const wbtcAmount = getBalance(wbtc, builder);
    const vaultAmount = await mintErc4626(wbtc, vault, wbtcAmount, builder);
    const infraredVaultAmount = await mintErc4626(vault, infraredVault, vaultAmount, builder);

    ensureMinAmountOut(infraredVaultAmount, builder);

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
          [this.inputs[ChainIds.Berachain].eth, { label: 'ERC20:eth' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:deth' }],
          [this.inputs[ChainIds.Berachain].infraredVault, { label: 'ERC20:Infrared Vault' }],
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
