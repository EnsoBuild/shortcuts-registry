import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import { AddressData, Input, Output, Shortcut } from '../../types';
import { balanceOf, depositKodiak, mintHoney, redeemHoney } from '../../utils';

export class InfraredWethHoneyShortcut implements Shortcut {
  name = 'infrared-weth-honey';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      weth: chainIdToDeFiAddresses[ChainIds.Cartio].weth,
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      island: '0xD4570a738675fB2c31e7b7b88998EE73E9E17d49',
      vault: '0xD2119799717D20D989550e1c7CBd25Ac40E7de1F',
    },
  };
  setterInputs: Record<number, Set<string>> = {
    [ChainIds.Cartio]: new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']),
  };

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { weth, usdc, honey, island, vault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [weth, usdc],
      tokensOut: [vault],
    });
    const usdcAmount = builder.add(balanceOf(usdc, walletAddress()));
    const wethAmount = builder.add(balanceOf(weth, walletAddress()));
    const mintedAmount = await mintHoney(usdc, usdcAmount, builder);

    await depositKodiak(builder, [weth, honey], [wethAmount, mintedAmount], island, this.setterInputs[chainId]);

    const amountIsland = builder.add(balanceOf(island, walletAddress()));

    const erc4626 = getStandardByProtocol('erc4626', chainId);
    await erc4626.deposit.addToBuilder(builder, {
      tokenIn: [island],
      tokenOut: vault,
      amountIn: [amountIsland],
      primaryAddress: vault,
    });

    const leftoverAmount = builder.add(balanceOf(honey, walletAddress()));
    await redeemHoney(usdc, leftoverAmount, builder);

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
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].weth, { label: 'ERC20:WETH' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'ERC20:INFRARED_VAULT' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'Kodiak Island-WETH-HONEY-0.3%' }],
          [this.inputs[ChainIds.Cartio].primary, { label: 'Kodiak Island Router' }],
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
