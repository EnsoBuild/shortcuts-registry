import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteInfraredDUsdtShortcut implements Shortcut {
  name = 'dolomite-infrared-dusdt';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usdt: chainIdToDeFiAddresses[ChainIds.Berachain].usdt,
      vault: '0xF2d2d55Daf93b0660297eaA10969eBe90ead5CE8', //dusdt
      infraredVault: '0xcc824B6b022e53c564c60d16B1a4e4bb93851A75',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdt, vault, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdt],
      tokensOut: [infraredVault],
    });

    const usdtAmount = getBalance(usdt, builder);
    const vaultAmount = await mintErc4626(usdt, vault, usdtAmount, builder);
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
          [this.inputs[ChainIds.Berachain].usdt, { label: 'ERC20:USDT' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:dUSDT' }],
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
