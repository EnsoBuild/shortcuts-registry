import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDsolvbtcbnnShortcut implements Shortcut {
  name = 'dolomite-dsolvbtcbnn';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      solvbtcbnn: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtcbnn,
      vault: '0x9875ec2a91aE0445a3D365C242987D3f7b81C2A4',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { solvbtcbnn, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtcbnn],
      tokensOut: [vault],
    });

    const solvbtcbnnAmount = getBalance(solvbtcbnn, builder);
    const vaultAmount = await mintErc4626(solvbtcbnn, vault, solvbtcbnnAmount, builder);

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
          [this.inputs[ChainIds.Berachain].solvbtcbnn, { label: 'ERC20:solvbtcbnn' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:dsolvbtcbnn' }],
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
