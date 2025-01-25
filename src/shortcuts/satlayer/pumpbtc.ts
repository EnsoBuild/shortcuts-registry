import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintSatLayerVault } from '../../utils';

export class SatlayerPumpBtcShortcut implements Shortcut {
  name = 'satlayer-pumpbtc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      pumpbtc: chainIdToDeFiAddresses[ChainIds.Cartio].pumpbtc,
      receiptToken: Standards.Satlayer_Vaults.protocol.addresses!.cartio!.receiptToken,
      vault: Standards.Satlayer_Vaults.protocol.addresses!.cartio!.vault,
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { pumpbtc, vault, receiptToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [pumpbtc],
      tokensOut: [receiptToken],
    });

    const pumpbtcAmount = getBalance(pumpbtc, builder);
    const receiptTokenAmount = await mintSatLayerVault(pumpbtc, receiptToken, vault, pumpbtcAmount, builder);

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
      case ChainIds.Cartio:
        return new Map([
          [this.inputs[ChainIds.Cartio].vault, { label: 'SatlayerPool' }],
          [this.inputs[ChainIds.Cartio].pumpbtc, { label: 'ERC20:pumpBTC.bera' }],
          [this.inputs[ChainIds.Cartio].receiptToken, { label: 'ERC20:satpumpBTC.bera' }],
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
