import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak } from '../../utils';

export class KodiakUnibtcYlBtcLstShortcut implements Shortcut {
  name = 'kodiak-unibtc-ylbtclst';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      unibtc: chainIdToDeFiAddresses[ChainIds.Berachain].unibtc,
      ylbtclst: chainIdToDeFiAddresses[ChainIds.Berachain].ylbtclst,
      island: '0x42930C47C681d4C78692aE8A88Eb277e494fDd27',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { unibtc, ylbtclst, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [unibtc, ylbtclst],
      tokensOut: [island],
    });
    const amountInUnibtc = builder.add(balanceOf(unibtc, walletAddress()));
    const amountInYlBtcLst = builder.add(balanceOf(ylbtclst, walletAddress()));

    await depositKodiak(
      provider,
      builder,
      [unibtc, ylbtclst],
      [amountInUnibtc, amountInYlBtcLst],
      island,
      this.setterInputs,
    );

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
          [this.inputs[ChainIds.Berachain].unibtc, { label: 'ERC20:unibtc' }],
          [this.inputs[ChainIds.Berachain].ylbtclst, { label: 'ERC20:ylbtclst' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-unibtc-ylbtclst' }],
          [chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter, { label: 'Kodiak Island Router' }],
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
