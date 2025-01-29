import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, NumberArg, WeirollScript } from '@ensofinance/shortcuts-builder/types';
import { getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { div } from '@ensofinance/shortcuts-standards/helpers/math';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { burnTokens, depositKodiak, getBalance } from '../../utils';

export class GoldilocksRsethRsethotShortcut implements Shortcut {
  name = 'goldilocks-rseth-rsethot';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      rseth: chainIdToDeFiAddresses[ChainIds.Berachain].rseth,
      ot: '0xB1195a6cdB7ef8fB22671bd8321727dBB6DDDe03',
      yt: '0xfb8283E50c89e367674BC566db3070D9e9Ff2fDd',
      vault: '0xE4dC8142CEd52C547384032e43379b0514341c22',
      island: '0xf8163EaC4c0239a81a7d8BD05B8e14498a5fD880',
    },
  };
  setterInputs = new Set(['minAmountOut', 'minAmount0Bps', 'minAmount1Bps']);

  async build(chainId: number, provider: StaticJsonRpcProvider): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { rseth, ot, yt, vault, island } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [rseth],
      tokensOut: [island],
    });

    const amountIn = getBalance(rseth, builder);
    const halfAmount = div(amountIn, 2, builder);

    const goldilocks = getStandardByProtocol('goldilocks', chainId);
    const { amountOut } = await goldilocks.deposit.addToBuilder(
      builder,
      {
        tokenIn: rseth,
        tokenOut: [ot, yt],
        amountIn: halfAmount,
        primaryAddress: vault,
      },
      ['amountOut'],
    );

    if (!Array.isArray(amountOut)) throw 'Error: Invalid amountOut'; // should never throw
    const [otAmount] = amountOut as NumberArg[];

    await depositKodiak(provider, builder, [rseth, ot], [halfAmount, otAmount], island, this.setterInputs);

    const otLeftOvers = getBalance(ot, builder);

    await goldilocks.redeem.addToBuilder(builder, {
      tokenIn: ot,
      tokenOut: rseth,
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
      case ChainIds.Berachain:
        return new Map([
          [this.inputs[ChainIds.Berachain].rseth, { label: 'ERC20:rseth' }],
          [this.inputs[ChainIds.Berachain].ot, { label: 'ERC20:rseth-OT' }],
          [this.inputs[ChainIds.Berachain].yt, { label: 'ERC20:rseth-YT' }],
          [this.inputs[ChainIds.Berachain].vault, { label: 'GoldiVault:rseth' }],
          [this.inputs[ChainIds.Berachain].island, { label: 'KodiakIsland:rsethOT/rseth' }],
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
