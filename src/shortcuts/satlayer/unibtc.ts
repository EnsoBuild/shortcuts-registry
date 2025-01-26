import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintSatLayerVault } from '../../utils';

export class SatlayerUnibtcShortcut implements Shortcut {
  name = 'satlayer-unibtc';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      unibtc: chainIdToDeFiAddresses[ChainIds.Berachain].unibtc,
      receiptToken: '0x2A5Fc05F71cfC54DdcAD19457CEe79E3aAF415C9',
      vault: chainIdToDeFiAddresses[ChainIds.Berachain].satlayerVault,
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { unibtc, vault, receiptToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [unibtc],
      tokensOut: [receiptToken],
    });

    const unibtcAmount = getBalance(unibtc, builder);
    const receiptTokenAmount = await mintSatLayerVault(unibtc, receiptToken, vault, unibtcAmount, builder);

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
          [this.inputs[ChainIds.Berachain].unibtc, { label: 'ERC20:unibtc.bera' }],
          [this.inputs[ChainIds.Berachain].receiptToken, { label: 'ERC20:satunibtc.bera' }],
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
