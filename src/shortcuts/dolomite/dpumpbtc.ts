import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getAddress } from '@ethersproject/address';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626 } from '../../utils';

export class DolomiteDPumpBtcShortcut implements Shortcut {
  name = 'dolomite-dpumpbtc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      pumpbtc: getAddress('0x49a49AB0A048bCADB8b4E51c5c970C46bF889CCD') as AddressArg, // pumpBTC
      vault: getAddress('0x341AB1EF96517E88F276c8455eF5e6a6e1Fb2958') as AddressArg, // dpumpBTC
    },
    [ChainIds.Berachain]: {
      pumpbtc: chainIdToDeFiAddresses[ChainIds.Berachain].pumpbtc, // pumpBTC
      vault: '0x341AB1EF96517E88F276c8455eF5e6a6e1Fb2958', // dpumpBTC
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { pumpbtc, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [pumpbtc],
      tokensOut: [vault],
    });

    const pumpbtcAmount = getBalance(pumpbtc, builder);
    const vaultAmount = await mintErc4626(pumpbtc, vault, pumpbtcAmount, builder);

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
          [this.inputs[ChainIds.Cartio].pumpbtc, { label: 'ERC20:pumpBTC' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:dpumpBTC' }],
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
