import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class ConcreteLbtcShortcut implements Shortcut {
  name = 'concrete-lbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      lbtc: '0x73a58b73018c1a417534232529b57b99132b13D2',
      vault: '0xC12823865DAA0579216A464b04aa3ae3faF12B4E',
    },
    [ChainIds.Berachain]: {
      lbtc: chainIdToDeFiAddresses[ChainIds.Berachain].lbtc,
      vault: '0xf0d94806e6E5cB54336ED0f8De459659718F149C',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { lbtc, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [lbtc],
      tokensOut: [vault],
    });

    const lbtcAmount = getBalance(lbtc, builder);

    const vaultAmount = await mintErc4626(lbtc, vault, lbtcAmount, builder);
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
          [this.inputs[ChainIds.Cartio].lbtc, { label: 'ERC20:lbtc' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:Concrete Vault' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].lbtc, { label: 'ERC20:lbtc' }],
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
