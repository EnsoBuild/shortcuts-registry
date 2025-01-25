import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class BeraborrowSbtcShortcut implements Shortcut {
  name = 'sbtc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      sBtc: chainIdToDeFiAddresses[ChainIds.Cartio].sbtc,
      psm: '0x2A280f6769Ba2a254C3D1FeCef0280F87DB0a265',
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { sBtc, psm } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [sBtc],
      tokensOut: [psm],
    });
    const sbtcAmount = getBalance(sBtc, builder);

    const erc4626 = getStandardByProtocol('erc4626', chainId);
    await erc4626.deposit.addToBuilder(builder, {
      tokenIn: [sBtc],
      tokenOut: psm,
      amountIn: [sbtcAmount],
      psmAddress: psm,
    });

    const psmAmount = getBalance(psm, builder);
    ensureMinAmountOut(psmAmount, builder);

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
          [this.inputs[ChainIds.Cartio].psm, { label: 'Beraborrow Boyco sBTC' }],
          [this.inputs[ChainIds.Cartio].sBtc, { label: 'ERC20:SBTC' }],
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
