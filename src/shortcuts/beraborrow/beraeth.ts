import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintBeraeth } from '../../utils';

export class BeraborrowBeraethShortcut implements Shortcut {
  name = 'beraborrow-beraeth';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: chainIdToDeFiAddresses[ChainIds.Cartio].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Cartio].beraeth,
      psm: '0x25189a55463d2974F6b55268A09ccEe92f8aa043',
    },
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      psm: '0x8dcb18B561CE7E7b309A2d172bdc2633266dfc85',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, beraeth, psm } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [psm],
    });

    const wethAmount = getBalance(weth, builder);

    await mintBeraeth(wethAmount, builder);

    const beraethAmount = getBalance(beraeth, builder);

    const erc4626 = getStandardByProtocol('erc4626', chainId);
    await erc4626.deposit.addToBuilder(builder, {
      tokenIn: [beraeth],
      tokenOut: psm,
      amountIn: [beraethAmount],
      primaryAddress: psm,
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
          [this.inputs[ChainIds.Cartio].psm, { label: 'Beraborrow Boyco beraeth' }],
          [this.inputs[ChainIds.Cartio].beraeth, { label: 'ERC20:beraeth' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].psm, { label: 'Beraborrow Boyco beraeth' }],
          [this.inputs[ChainIds.Berachain].beraeth, { label: 'ERC20:beraeth' }],
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
