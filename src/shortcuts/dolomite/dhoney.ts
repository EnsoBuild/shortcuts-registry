import { Builder } from '@ensofinance/shortcuts-builder';
import { RoycoClient } from '@ensofinance/shortcuts-builder/client/implementations/roycoClient';
import { AddressArg, ChainIds, WeirollScript } from '@ensofinance/shortcuts-builder/types';

import { chainIdToDeFiAddresses, chainIdToTokenHolder } from '../../constants';
import type { AddressData, Input, Output, Shortcut } from '../../types';
import { ensureMinAmountOut, getBalance, mintErc4626, mintHoney } from '../../utils';

export class DolomiteDHoneyShortcut implements Shortcut {
  name = 'dolomite-dhoney';
  description = '';
  supportedChains = [ChainIds.Cartio];
  inputs: Record<number, Input> = {
    [ChainIds.Cartio]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Cartio].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Cartio].honey,
      dhoney: '0x7f2B60fDff1494A0E3e060532c9980d7fad0404B',
      infraredVault: '0x53fACeCc391021a69Ba79351007079536AA64C6d',
    },
    /*
    [ChainIds.Berachain]: {
      usdc: chainIdToDeFiAddresses[ChainIds.Berachain].usdc,
      honey: chainIdToDeFiAddresses[ChainIds.Berachain].honey,
      dhoney: '0x7f2B60fDff1494A0E3e060532c9980d7fad0404B',
      infraredVault: '0x0', //TODO
    },
    */
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
      case ChainIds.Cartio:
        return new Map([
          [this.inputs[ChainIds.Cartio].usdc, { label: 'ERC20:USDC' }],
          [this.inputs[ChainIds.Cartio].honey, { label: 'ERC20:HONEY' }],
          [this.inputs[ChainIds.Cartio].dhoney, { label: 'ERC20:dHONEY' }],
          [this.inputs[ChainIds.Cartio].infraredVault, { label: 'ERC20:irdHONEY' }],
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
