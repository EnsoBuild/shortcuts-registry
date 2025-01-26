import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class VedaWbtcShortcut implements Shortcut {
  name = 'veda-wbtc';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      vault: '0xf16Cd75E975163f3A0A1af42E5609aB67A6553D7',
      vaultToken: '0x46fcd35431f5B371224ACC2e2E91732867B1A77e',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, vault, vaultToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc],
      tokensOut: [vaultToken],
    });
    const amountIn = getBalance(wbtc, builder);

    const vaultVault = getStandardByProtocol('etherfi-liquid', chainId);
    await vaultVault.deposit.addToBuilder(builder, {
      tokenIn: [wbtc],
      tokenOut: vaultToken,
      amountIn: [amountIn],
      primaryAddress: vault,
    });

    const vaultTokenAmount = getBalance(vaultToken, builder);
    ensureMinAmountOut(vaultTokenAmount, builder);

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
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:wbtc' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:VEDA/ETHERFI Vault' }],
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
