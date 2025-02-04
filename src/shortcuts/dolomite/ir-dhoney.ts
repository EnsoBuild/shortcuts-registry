import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626, mintHoney } from '../../utils';

export class DolomiteInfraredDHoneyShortcut implements Shortcut {
  name = 'dolomite-infrared-dhoney';
  description = '';
  supportedChains = [ChainIds.Berachain];
  inputs: Record<number, Input> = {
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      dhoney: '0x7f2B60fDff1494A0E3e060532c9980d7fad0404B',
      infraredVault: '0x920598318D0C48a19a9cBd26D86Aa0D8079b139A',
    },
  };
  setterInputs = new Set(['minAmountOut']);

  async build(chainId: number): Promise<Output> {
    const client = new RoycoClient();

    const inputs = this.inputs[chainId];
    const { usdc, honey, dhoney, infraredVault } = inputs;

    const builder = new Builder(chainId, client, {
      tokensIn: [usdc],
      tokensOut: [infraredVault],
    });

    // Get the amount of USDC in the wallet, used to mint Honey
    const usdcAmount = getBalance(usdc, builder);
    const honeyMintedAmount = await mintHoney(usdc, usdcAmount, builder);

    // Mint dHoney
    const dHoneyAmount = await mintErc4626(honey, dhoney, honeyMintedAmount, builder);
    // Mint Infrared Vault
    const infraredVaultAmount = await mintErc4626(dhoney, infraredVault, dHoneyAmount, builder);

    ensureMinAmountOut(infraredVaultAmount, builder);

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
          [this.inputs[ChainIds.Berachain].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Berachain].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Berachain].dhoney, { label: 'ERC20:dHONEY' }],
          [this.inputs[ChainIds.Berachain].infraredVault, { label: 'ERC20:irdHONEY' }],
        ]);
      default:
        throw new Error(`Unsupported chainId: ${chainId}`);
    }
  }

  getTokenHolder(chainId: number): Map<AddressArg, AddressArg> {
    const tokenToHolder = chainIdToTokenHolder.get(chainId);
    if (!tokenToHolder) {
      throw new Error(`Unsupported 'chainId': ${chainId}`);
    }

    return tokenToHolder as Map<AddressArg, AddressArg>;
  }
}
