import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class ConcreteUsdcShortcut implements Shortcut {
  name = 'usdc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      usdc: TokenAddresses.cartio.usdc,
      vault: '0x9c5285F076C6c1D8471E2625aB5c2257547bCe86',
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdc, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [vault],
    });
    const usdcAmount = getBalance(usdc, builder);

    const vaultVault = getStandardByProtocol('erc4626', chainId);
    await vaultVault.deposit.addToBuilder(builder, {
      tokenIn: [usdc],
      tokenOut: vault,
      amountIn: [usdcAmount],
      primaryAddress: vault,
    });

    const vaultAmount = getBalance(vault, builder);
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
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:Concrete Vault' }],
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
