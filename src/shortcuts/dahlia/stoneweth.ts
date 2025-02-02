import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DahliaStonewethShortcut implements Shortcut {
  name = 'dahlia-weth';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: TokenAddresses.cartio.weth,
      vault: '0x479Df3548C4261Cb101BE33536B3D90CCA6eb327',
    },
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      vault: '0x67457E78BA3A8fcDC9070ED36e4c29D89C0e8914',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [vault],
    });

    const wethAmount = getBalance(weth, builder);

    const vaultAmount = await mintErc4626(weth, vault, wethAmount, builder);
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
          [this.inputs[ChainIds.Cartio].vault, { label: 'Dahlia Vault' }],
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:WETH' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].vault, { label: 'Dahlia Vault' }],
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:WETH' }],
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
