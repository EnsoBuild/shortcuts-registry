import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class BeraborrowStoneShortcut implements Shortcut {
  name = 'beraborrow-stone';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      stone: chainIdToDeFiAddresses[ChainIds.Berachain].stone,
      psm: '0xeC5CB1b6849258eEab0613139DFf7698ae256997',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { stone, psm } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [stone],
      tokensOut: [psm],
    });

    const stoneAmount = getBalance(stone, builder);

    const vaultAmount = await mintErc4626(stone, psm, stoneAmount, builder);
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
          [this.inputs[ChainIds.Berachain].psm, { label: 'Beraborrow Boyco stone' }],
          [this.inputs[ChainIds.Berachain].stone, { label: 'ERC20:stone' }],
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
