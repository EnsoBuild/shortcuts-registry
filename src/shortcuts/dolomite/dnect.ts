import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626, mintNectWithUsdc } from '../../utils';

export class DolomiteDnectShortcut implements Shortcut {
  name = 'dolomite-dnect';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      nect: chainIdToDeFiAddresses[ChainIds.Berachain].nect,
      vault: '0x474F32Eb1754827C531C16330Db07531e901BcBe', //dnect
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdc, vault, nect } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [vault],
    });

    const usdcAmount = getBalance(usdc, builder);

    const nectMintedAmount = await mintNectWithUsdc(usdcAmount, builder);

    const vaultAmount = await mintErc4626(nect, vault, nectMintedAmount, builder);

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
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].nect, { label: 'ERC20:NECT' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:dnect' }],
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
