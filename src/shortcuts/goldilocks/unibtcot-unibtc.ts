import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, NumberArg, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { div } from '@ensofinance/shortcuts-standards/helpers/math';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { burnTokens, depositKodiak, getBalance } from '../../utils';

export class GoldilocksUniBtcOtUniBtcShortcut implements Shortcut {
  name = 'goldilocks-unibtcOt-unibtc';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      unibtc: '0xC3827A4BC8224ee2D116637023b124CED6db6e90',
      ot: '0xAc92f4033AcddE6C908D7b13F40014490795E2F9',
      yt: '0x7Cf31aaaaFe1aBB46a935c543C65ce7346729B90',
      vault: '0x834Cb23083be1C80F9737468e49555a56B149Af5',
      island: '0xB4E5c02409070258FaAe3C895996b8E115209ec6',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { unibtc, ot, yt, vault, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [unibtc],
      tokensOut: [island],
    });

    const amountIn = getBalance(unibtc, builder);
    const halfAmount = div(amountIn, 2, builder);

    const goldilocks = getStandardByProtocol('goldilocks', chainId);
    const { amountOut } = await goldilocks.deposit.addToBuilder(
      builder,
      {
        tokenIn: unibtc,
        tokenOut: [ot, yt],
        amountIn: halfAmount,
        primaryAddress: vault,
      },
      ['amountOut'],
    );

    if (!Array.isArray(amountOut)) throw 'Error: Invalid amountOut'; // should never throw
    const [otAmount] = amountOut as NumberArg[];

    await depositKodiak(provider, builder, [unibtc, ot], [halfAmount, otAmount], island, this.setterInputs);

    const otLeftOvers = getBalance(ot, builder);
    const ytAmount = getBalance(yt, builder);

    await burnTokens(yt, ytAmount, builder);

    await goldilocks.redeem.addToBuilder(builder, {
      tokenIn: ot,
      tokenOut: unibtc,
      amountIn: otLeftOvers,
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
          [this.inputs[ChainIds.Cartio].ebtc, { label: 'ERC20:UniBtc' }],
          [this.inputs[ChainIds.Cartio].ot, { label: 'ERC20:UniBtc-OT' }],
          [this.inputs[ChainIds.Cartio].yt, { label: 'ERC20:UniBtc-YT' }],
          [this.inputs[ChainIds.Cartio].vault, { label: 'GoldiVault:uniBtc' }],
          [this.inputs[ChainIds.Cartio].island, { label: 'KodiakIsland:UniBtcOT/UniBtc' }],
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
