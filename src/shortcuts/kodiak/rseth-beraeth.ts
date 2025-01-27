import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance, mintBeraeth } from '../../utils';

export class KodiakRsethBeraethShortcut implements Shortcut {
  name = 'kodiak-rseth-beraeth';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      rseth: chainIdToDeFiAddresses[ChainIds.Berachain].rseth,
      beraeth: chainIdToDeFiAddresses[ChainIds.Berachain].beraeth,
      island: '0xEFb340d54D54E1C4E3566878a5D64A3a591e12A3',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { rseth, beraeth, weth, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth, rseth],
      tokensOut: [island],
    });
    const wethAmount = getBalance(weth, builder);
    const rsEthAmount = getBalance(rseth, builder);
    const beraethAmount = await mintBeraeth(wethAmount, builder);

    await depositKodiak(provider, builder, [rseth, beraeth], [rsEthAmount, beraethAmount], island, this.setterInputs);

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
          [this.inputs[ChainIds.Berachain].rseth, { label: 'ERC20:rseth' }],
          [this.inputs[ChainIds.Berachain].beraeth, { label: 'ERC20:beraeth' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-rseth-beraeth' }],
          [chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter, { label: 'Kodiak Router' }],
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
