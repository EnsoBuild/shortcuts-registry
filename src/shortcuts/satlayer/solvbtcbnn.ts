import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintSatLayerVault } from '../../utils';

export class SatlayerSolvbtcbnnBnnShortcut implements Shortcut {
  name = 'satlayer-solvbtcbnnbnn';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      solvbtcbnn: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtcbnn,
      receiptToken: '0xE7041941E9E4f3d12D9Eb6D9b228d3781548b126',
      vault: chainIdToDeFiAddresses[ChainIds.Berachain].satlayerVault,
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { solvbtcbnn, vault, receiptToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtcbnn],
      tokensOut: [receiptToken],
    });

    const solvbtcbnnAmount = getBalance(solvbtcbnn, builder);
    const receiptTokenAmount = await mintSatLayerVault(solvbtcbnn, receiptToken, vault, solvbtcbnnAmount, builder);

    ensureMinAmountOut(receiptTokenAmount, builder);

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
          [this.inputs[ChainIds.Berachain].vault, { label: 'SatlayerPool' }],
          [this.inputs[ChainIds.Berachain].solvbtcbnn, { label: 'ERC20:solvbtcbnn' }],
          [this.inputs[ChainIds.Berachain].receiptToken, { label: 'ERC20:satsolvbtcbnn' }],
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
