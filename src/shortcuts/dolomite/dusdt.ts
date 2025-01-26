import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDUsdtShortcut implements Shortcut {
  name = 'dolomite-dusdt';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      usdt: chainIdToDeFiAddresses[ChainIds.Cartio].usdt,
      vault: '0xF2d2d55Daf93b0660297eaA10969eBe90ead5CE8', //dusdt
    },
    [ChainIds.Berachain]: {
      usdt: chainIdToDeFiAddresses[ChainIds.Berachain].usdt,
      vault: '0xF2d2d55Daf93b0660297eaA10969eBe90ead5CE8', //dusdt
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdt, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdt],
      tokensOut: [vault],
    });

    const usdtAmount = getBalance(usdt, builder);
    const vaultAmount = await mintErc4626(usdt, vault, usdtAmount, builder);

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
          [this.inputs[ChainIds.Cartio].usdt, { label: 'ERC20:USDT' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:dUSDT' }],
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
