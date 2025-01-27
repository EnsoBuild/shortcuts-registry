import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintBeraeth, mintErc4626 } from '../../utils';

export class ConcreteBeraethShortcut implements Shortcut {
  name = 'concrete-weth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      vault: '0xB1Bc48201a78703216aC2b2dC5d0e976f0f5C0A9',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, vault, beraeth } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [vault],
    });

    const wethAmount = getBalance(weth, builder);
    const beraethAmount = await mintBeraeth(wethAmount, builder);

    const vaultAmount = await mintErc4626(beraeth, vault, beraethAmount, builder);
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
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:weth' }],
          [this.inputs[ChainIds.Berachain].beraeth, { label: 'ERC20:Beraeth' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:Concrete Vault' }],
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
