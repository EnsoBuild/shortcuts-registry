import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';
import { getAddress } from '@ethersproject/address';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class ConcreteWethShortcut implements Shortcut {
  name = 'weth';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: TokenAddresses.cartio.weth,
      vault: getAddress('0x18AA409860b89353172C5A7fF4f5fd28a19f3c5a') as AddressArg,
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth],
      tokensOut: [vault],
    });
    const wethAmount = getBalance(weth, builder);

    const vaultVault = getStandardByProtocol('erc4626', chainId);
    await vaultVault.deposit.addToBuilder(builder, {
      tokenIn: [weth],
      tokenOut: vault,
      amountIn: [wethAmount],
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
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:weth' }],
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
