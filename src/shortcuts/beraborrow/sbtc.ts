import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class BeraborrowSbtcShortcut implements Shortcut {
  name = 'beraborrow-sbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      sbtc: chainIdToDeFiAddresses[ChainIds.Cartio].sbtc,
      psm: '0x2A280f6769Ba2a254C3D1FeCef0280F87DB0a265',
    },
    [ChainIds.Berachain]: {
      sbtc: chainIdToDeFiAddresses[ChainIds.Berachain].sbtc,
      psm: '0x583Cc8a82B55A96a9dED97f5353397c85ee8b60E',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { sbtc, psm } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [sbtc],
      tokensOut: [psm],
    });
    const sbtcAmount = getBalance(sbtc, builder);

    const vaultAmount = await mintErc4626(sbtc, psm, sbtcAmount, builder);
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
          [this.inputs[ChainIds.Cartio].psm, { label: 'Beraborrow Boyco sbtc' }],
          [this.inputs[ChainIds.Cartio].sbtc, { label: 'ERC20:sbtc' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].psm, { label: 'Beraborrow Boyco sbtc' }],
          [this.inputs[ChainIds.Berachain].sbtc, { label: 'ERC20:sbtc' }],
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
