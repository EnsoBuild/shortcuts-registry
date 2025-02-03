import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, NumberArg, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { sub } from '@ensofinance/shortcuts-standards/helpers/math';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { burnTokens, depositKodiak, getBalance, getSetterValue } from '../../utils';

export class GoldilockssolvbtcbnnsolvbtcbnnOtShortcut implements Shortcut {
  name = 'goldilocks-solvbtcbnn-solvbtcbnnot';
  description = '';
  supportedChains = [ChainIds.Cartio, ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      solvbtcbnn: '0xC3827A4BC8224ee2D116637023b124CED6db6e90',
      ot: '0xAc92f4033AcddE6C908D7b13F40014490795E2F9',
      yt: '0x7Cf31aaaaFe1aBB46a935c543C65ce7346729B90',
      vault: '0x834Cb23083be1C80F9737468e49555a56B149Af5',
      island: '0xB4E5c02409070258FaAe3C895996b8E115209ec6',
    },
    [ChainIds.Berachain]: {
      solvbtcbnn: chainIdToDeFiAddresses[ChainIds.Berachain].solvbtcbnn,
      ot: '0xA01cB564ecc3F58a4e2bA5fD59d13a6b998de9b8',
      yt: '0x89b37108D3eb174673D98f0a5bb419f47270130e',
      vault: '0xe2f6eF50fD232c7c9698F2f4CaE44A6D80AaFdEE',
      island: '0xadD169f7E0905fb2e78cDFBee155c975Db0F2cbe',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps', 'amountToMintGoldilocks']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { solvbtcbnn, ot, yt, vault, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [solvbtcbnn],
      tokensOut: [island],
    });

    const amountIn = getBalance(solvbtcbnn, builder);
    const amountToMintGoldilocks = getSetterValue(builder, this.setterInputs, 'amountToMintGoldilocks');
    const remainingAmount = sub(amountIn, amountToMintGoldilocks, builder);

    const goldilocks = getStandardByProtocol('goldilocks', chainId);
    const { amountOut } = await goldilocks.deposit.addToBuilder(
      builder,
      {
        tokenIn: solvbtcbnn,
        tokenOut: [ot, yt],
        amountIn: amountToMintGoldilocks,
        primaryAddress: vault,
      },
      ['amountOut'],
    );

    if (!Array.isArray(amountOut)) throw 'Error: Invalid amountOut'; // should never throw
    const [otAmount] = amountOut as NumberArg[];

    await depositKodiak(provider, builder, [ot, solvbtcbnn], [otAmount, remainingAmount], island, this.setterInputs);

    const otLeftOvers = getBalance(ot, builder);

    await goldilocks.redeem.addToBuilder(builder, {
      tokenIn: ot,
      tokenOut: solvbtcbnn,
      amountIn: otLeftOvers,
      primaryAddress: vault,
    });

    const ytAmount = getBalance(yt, builder);
    await burnTokens(yt, ytAmount, builder);

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
          [this.inputs[ChainIds.Cartio].ebtc, { label: 'ERC20:solvbtcbnn' }],
          [this.inputs[ChainIds.Cartio].ot, { label: 'ERC20:solvbtcbnn-OT' }],
          [this.inputs[ChainIds.Cartio].yt, { label: 'ERC20:solvbtcbnn-YT' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'GoldiVault:solvbtcbnn' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'KodiakIsland:solvbtcbnnOT/solvbtcbnn' }],
          [chainIdToDeFiAddresses[ChainIds.Berachain].kodiakRouter, { label: 'Kodiak Island Router' }],
        ]);
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].ebtc, { label: 'ERC20:solvbtcbnn' }],
          [this.inputs[ChainIds.Berachain].ot, { label: 'ERC20:solvbtcbnn-OT' }],
          [this.inputs[ChainIds.Berachain].yt, { label: 'ERC20:solvbtcbnn-YT' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'GoldiVault:solvbtcbnn' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'KodiakIsland:solvbtcbnnOT/solvbtcbnn' }],
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
