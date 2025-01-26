import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import { AddressData, Input, Output, Shortcut } from '../../types';
import { depositKodiak, getBalance, mintHoney } from '../../utils';

export class BeraborrowWbtcHoneyShortcut implements Shortcut {
  name = 'beraborrow-wbtc-honey';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      wbtc: chainIdToDeFiAddresses[ChainIds.Berachain].wbtc,
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      island: '0xf6b16E73d3b0e2784AAe8C4cd06099BE65d092Bf',
      vault: '0x2B9371E53b5301B517c772E117616a5c165081F2',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { wbtc, usdc, honey, island, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [wbtc, usdc],
      tokensOut: [vault],
    });
    const usdcAmount = getBalance(usdc, builder);
    const wbtcAmount = getBalance(wbtc, builder);
    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);

    await depositKodiak(provider, builder, [wbtc, honey], [wbtcAmount, mintedAmount], island, this.setterInputs);

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
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].weth, { label: 'ERC20:WETH' }],
          [this.inputs[ChainIds.Berachain].wbtc, { label: 'ERC20:WBTC' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'ERC20:BB_VAULT' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'Kodiak Island-WBTC-HONEY' }],
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
