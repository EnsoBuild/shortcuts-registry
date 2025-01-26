import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance } from '../../utils';

export class BeraborrowWbtcWethShortcut implements Shortcut {
  name = 'beraborrow-wbtc-weth';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: TokenAddresses.cartio.weth,
      wbtc: TokenAddresses.cartio.wbtc,
      island: '0x1E5FFDC9B4D69398c782608105d6e2B724063E13',
      vault: '0xe1e4F5b13F6E87140A657222BB9D38B78ad00bf8',
    },
    [ChainIds.Berachain]: {
      weth: chainIdToDeFiAddresses[ChainIds.Berachain].weth,
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      island: '0x58FDB6EEbf7df7Ce4137994436fb0e629Bb84b84',
      vault: '0x9cE81bC708d6F846E4fA64891982f069941DF0C7',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, wbtc, island, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth, wbtc],
      tokensOut: [vault],
    });
    const amountInWeth = getBalance(weth, builder);
    const amountInWbtc = getBalance(wbtc, builder);

    await depositKodiak(provider, builder, [wbtc, weth], [amountInWbtc, amountInWeth], island, this.setterInputs);

    const amountIsland = getBalance(island, builder);

    const erc4626 = getStandardByProtocol('erc4626', chainId);
    await erc4626.deposit.addToBuilder(builder, {
      tokenIn: [island],
      tokenOut: vault,
      amountIn: [amountIsland],
      primaryAddress: vault,
    });

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
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:WETH' }],
          [this.inputs[ChainIds.Cartio].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:BB_VAULT' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-WETH-WBTC' }],
          [chainIdToDeFiAddresses[ChainIds.Cartio].kodiakRouter, { label: 'Kodiak Island Router' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:WETH' }],
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:BB_VAULT' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-WETH-WBTC' }],
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
