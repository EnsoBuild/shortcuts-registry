import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getAddress } from '@ethersproject/address';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDRsEthShortcut implements Shortcut {
  name = 'dolomite-drseth';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      rseth: getAddress('0x9eCaf80c1303CCA8791aFBc0AD405c8a35e8d9f1') as AddressArg,
      vault: getAddress('0xE6dE202a0d14af12b298b6c07CB8653d1c2E12dD') as AddressArg, // drsETH
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut']),
    [ChainIds.Berachain]: new Set(['minAmountOut']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { rseth, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [rseth],
      tokensOut: [vault],
    });

    const rsethAmount = getBalance(rseth, builder);
    const vaultAmount = await mintErc4626(rseth, vault, rsethAmount, builder);

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
          [this.inputs[ChainIds.Cartio].rseth, { label: 'ERC20:rsETH' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:drsETH' }],
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
