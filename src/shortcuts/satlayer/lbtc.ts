import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintSatLayerVault } from '../../utils';

export class SatlayerLbtcShortcut implements Shortcut {
  name = 'satlayer-lbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      lbtc: '0x73a58b73018c1a417534232529b57b99132b13D2', // LBTC
      receiptToken: '0xD9B6b1db8707cED387043b1c568fB172c809cffD',
      vault: Standards.Satlayer_Vaults.protocol.addresses!.cartio!.vault,
    },
    [ChainIds.Berachain]: {
      lbtc: chainIdToDeFiAddresses[ChainIds.Berachain].lbtc,
      receiptToken: '0x961395ed9960fE5e281585bEAa730b99AF3AB763',
      vault: chainIdToDeFiAddresses[ChainIds.Berachain].satlayerVault,
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { lbtc, vault, receiptToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [lbtc],
      tokensOut: [receiptToken],
    });

    const lbtcAmount = getBalance(lbtc, builder);

    const receiptTokenAmount = await mintSatLayerVault(lbtc, receiptToken, vault, lbtcAmount, builder);
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
          [this.inputs[ChainIds.Cartio].lbtc, { label: 'ERC20:lBtc' }],
          [this.inputs[ChainIds.Cartio].receiptToken, { label: 'ERC20:satBtc' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].vault, { label: 'SatlayerPool' }],
          [this.inputs[ChainIds.Berachain].lbtc, { label: 'ERC20:lBtc' }],
          [this.inputs[ChainIds.Berachain].receiptToken, { label: 'ERC20:satBtc' }],
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
