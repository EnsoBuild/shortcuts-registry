import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDSbtcShortcut implements Shortcut {
  name = 'dolomite-dsbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      sbtc: '0x5d417e7798208E9285b5157498bBF23A23E421E7', // SBTC
      vault: '0xA8Cb3818Fa799018bc862ADE08F8a37e08BA1062', // dSBTC
    },
    [ChainIds.Berachain]: {
      sbtc: chainIdToDeFiAddresses[ChainIds.Berachain].sbtc, // SBTC
      vault: '0xA8Cb3818Fa799018bc862ADE08F8a37e08BA1062', // dSBTC
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { sbtc, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [sbtc],
      tokensOut: [vault],
    });

    const sbtcAmount = getBalance(sbtc, builder);
    const vaultAmount = await mintErc4626(sbtc, vault, sbtcAmount, builder);

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
          [this.inputs[ChainIds.Cartio].sbtc, { label: 'ERC20:SBTC' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:dSBTC' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].sbtc, { label: 'ERC20:SBTC' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:dSBTC' }],
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
