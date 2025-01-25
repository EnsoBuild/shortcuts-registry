import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { Standards } from '@ensofinance/shortcuts-standards';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintSatLayerVault } from '../../utils';

export class SatlayerSolvBtcShortcut implements Shortcut {
  name = 'satlayer-solvbtc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      solvbtc: '0xB4618618b6Fcb61b72feD991AdcC344f43EE57Ad',
      receiptToken: '0xC034312c39DEdEE529fa6de123d0b24DBb43a053',
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
    const { solvbtc, vault, receiptToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtc],
      tokensOut: [receiptToken],
    });

    const solvbtcAmount = getBalance(solvbtc, builder);
    const receiptTokenAmount = await mintSatLayerVault(solvbtc, receiptToken, vault, solvbtcAmount, builder);

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
          [this.inputs[ChainIds.Cartio].solvbtc, { label: 'ERC20:SolvBtc' }],
          [this.inputs[ChainIds.Cartio].receiptToken, { label: 'ERC20:satSolvBtc' }],
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
