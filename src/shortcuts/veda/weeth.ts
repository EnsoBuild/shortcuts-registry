import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance } from '../../utils';

export class VedaWeethShortcut implements Shortcut {
  name = 'veda-weeth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      weeth: chainIdToDeFiAddresses[ChainIds.Berachain].weeth,
      vault: '0xa6976B2211411461aB6DF4B3AAE896531Eb527df',
      vaultToken: '0xB83742330443f7413DBD2aBdfc046dB0474a944e',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weeth, vault, vaultToken } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weeth],
      tokensOut: [vaultToken],
    });
    const amountIn = getBalance(weeth, builder);

    const vaultVault = getStandardByProtocol('etherfi-liquid', chainId);
    await vaultVault.deposit.addToBuilder(builder, {
      tokenIn: [weeth],
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
          [this.inputs[ChainIds.Berachain].weeth, { label: 'ERC20:weeth' }],
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
