import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class ConcreteSusdeShortcut implements Shortcut {
  name = 'susde';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      susde: '0xE0166f6C98aea0fd135D474B69471ca96DC797c4',
      vault: '0x1168848b115DA87587Be9cb2A962FD4A09D930Ea',
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { susde, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [susde],
      tokensOut: [vault],
    });
    const susdeAmount = getBalance(susde, builder);

    const vaultVault = getStandardByProtocol('erc4626', chainId);
    await vaultVault.deposit.addToBuilder(builder, {
      tokenIn: [susde],
      tokenOut: vault,
      amountIn: [susdeAmount],
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
          [this.inputs[ChainIds.Cartio].susde, { label: 'ERC20:susde' }],
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
