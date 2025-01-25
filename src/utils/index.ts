import { Builder } from '@ensofinance/shortcuts-builder';
import { contractCall, getChainName, walletAddress } from '@ensofinance/shortcuts-builder/helpers';
import {
  AddressArg,
  ChainIds,
  FromContractCallArg,
  NumberArg,
  Transaction,
  WalletAddressArg,
} from '@ensofinance/shortcuts-builder/types';
import { PUBLIC_RPC_URLS, getStandardByProtocol } from '@ensofinance/shortcuts-standards';
import { GeneralAddresses, TokenAddresses } from '@ensofinance/shortcuts-standards/addresses';
import {
  addAction,
  addApprovals,
  areAddressesEqual,
  percentMul,
  resetApprovals,
} from '@ensofinance/shortcuts-standards/helpers';
import { Interface } from '@ethersproject/abi';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { chainIdToDeFiAddresses, chainIdToSimulationRoles } from '../constants';
import type { RoycoOutput, Shortcut, SimulationResult } from '../types';

export async function prepareResponse(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  simulationResult: any,
  transaction: Transaction,
): Promise<SimulationResult> {
  return {
    logs: simulationResult.logs,
    simulationURL: simulationResult.simulationURL,
    transaction,
  };
}

export function balanceOf(token: AddressArg, owner: WalletAddressArg) {
  return contractCall({
    address: token,
    functionName: 'balanceOf',
    abi: ['function balanceOf(address) external view returns (uint256)'],
    args: [owner],
  });
}

export async function mintHoney(asset: AddressArg, amount: NumberArg, builder: Builder) {
  const berachainHoney = getStandardByProtocol('berachain-honey', 80000); // TODO: return this to 'builder.chainId' after standards get updated to support bera
  const { honey, honeyFactory } = chainIdToDeFiAddresses[builder.chainId];

  const { amountOut } = await berachainHoney.deposit.addToBuilder(builder, {
    tokenIn: asset,
    tokenOut: honey,
    amountIn: amount,
    primaryAddress: honeyFactory,
  });

  return amountOut as FromContractCallArg;
}

export async function mintNect(amountIn: NumberArg, builder: Builder) {
  const erc4626 = getStandardByProtocol('erc4626', builder.chainId);
  const { amountOut: mintedAmountNect } = await erc4626.deposit.addToBuilder(builder, {
    tokenIn: [chainIdToDeFiAddresses[builder.chainId].usdc],
    tokenOut: chainIdToDeFiAddresses[builder.chainId].nect,
    amountIn: [amountIn],
    primaryAddress: chainIdToDeFiAddresses[builder.chainId].usdcPsmBond,
  });
  return mintedAmountNect as FromContractCallArg;
}

export async function mintBeraEth(amountIn: NumberArg, builder: Builder): Promise<NumberArg> {
  const { weth, beraEth, rBeraEth } = chainIdToDeFiAddresses[builder.chainId];

  const dineroBeraeth = getStandardByProtocol('dinero-lst', builder.chainId, true);
  const { amountOut } = await dineroBeraeth.deposit.addToBuilder(
    builder,
    {
      tokenIn: [weth],
      tokenOut: beraEth,
      amountIn: [amountIn],
      primaryAddress: rBeraEth,
    },
    ['amountOut'],
  );
  if (Array.isArray(amountOut)) return amountOut[0] as NumberArg;
  return amountOut as NumberArg;
}

export async function redeemHoney(asset: AddressArg, amount: NumberArg, builder: Builder) {
  const berachainHoney = getStandardByProtocol('berachain-honey', builder.chainId);
  const { honey, honeyFactory } = chainIdToDeFiAddresses[builder.chainId];

  const { amountOut } = await berachainHoney.redeem.addToBuilder(builder, {
    tokenIn: honey,
    tokenOut: asset,
    amountIn: amount,
    primaryAddress: honeyFactory,
  });

  return amountOut as FromContractCallArg;
}

export async function redeemNect(amount: NumberArg, builder: Builder) {
  const approvals = {
    tokens: [chainIdToDeFiAddresses[builder.chainId].nect],
    amounts: [amount],
    spender: chainIdToDeFiAddresses[builder.chainId].usdcPsmBond,
  };

  addApprovals(builder, approvals);
  const redeem = contractCall({
    address: chainIdToDeFiAddresses[builder.chainId].usdcPsmBond,
    functionName: 'withdraw',
    abi: ['function withdraw(uint shares, address receiver, address owner) '],
    args: [amount, walletAddress(), walletAddress()],
  });

  builder.add(redeem);
}

export async function burnTokens(token: AddressArg, amount: NumberArg, builder: Builder) {
  const erc20 = getStandardByProtocol('erc20', builder.chainId);
  await erc20.transfer.addToBuilder(builder, {
    token,
    receiver: GeneralAddresses.null,
    amount,
  });
}

export function getBalance(token: AddressArg, builder: Builder) {
  return builder.add(balanceOf(token, walletAddress()));
}

export async function depositBurrbear(builder: Builder, amountIn: NumberArg, setterInputs: Set<string>) {
  const primary = chainIdToDeFiAddresses[builder.chainId].burrbearZap;
  const chainName = getChainName(builder.chainId);

  const approvals = {
    tokens: [TokenAddresses[chainName].usdc],
    amounts: [amountIn],
    spender: primary,
  };

  const amountSharesMin = builder.add({
    address: chainIdToSimulationRoles.get(builder.chainId)!.setter.address!,
    abi: ['function getValue(uint256 index) external view returns (uint256)'],
    functionName: 'getValue',
    args: [findPositionInSetterInputs(setterInputs, 'minAmountOut')],
  });

  addAction({
    builder,
    action: {
      address: primary,
      abi: ['function deposit(uint256 amount, address receiver, uint256 minBptOut)'],
      functionName: 'deposit',
      args: [amountIn, walletAddress(), amountSharesMin],
    },
    approvals,
  });
}

export async function depositKodiak(
  builder: Builder,
  tokensIn: AddressArg[],
  amountsIn: NumberArg[],
  island: AddressArg,
  setterInputs: Set<string>,
) {
  const rpcUrl = PUBLIC_RPC_URLS[builder.chainId].rpcUrls.public;
  const router = chainIdToDeFiAddresses[builder.chainId].kodiakRouter;
  const provider = new StaticJsonRpcProvider(rpcUrl);
  const islandInterface = new Interface(['function token0() external view returns(address)']);
  const token0Bytes = await provider.call({
    to: island,
    data: islandInterface.encodeFunctionData('token0', []),
  });
  const token0 = '0x' + token0Bytes.slice(26);
  const [amount0, amount1] = areAddressesEqual(token0, tokensIn[0])
    ? [amountsIn[0], amountsIn[1]]
    : [amountsIn[1], amountsIn[0]];
  const approvals = {
    tokens: tokensIn,
    amounts: amountsIn,
    spender: router,
  };
  const minAmount0Bps = getSetterValue(builder, setterInputs, 'minAmount0Bps');
  const minAmount1Bps = getSetterValue(builder, setterInputs, 'minAmount1Bps');
  const amount0Min = percentMul(amount0, minAmount0Bps, builder);
  const amount1Min = percentMul(amount1, minAmount1Bps, builder);
  const amountSharesMin = getSetterValue(builder, setterInputs, 'minAmountOut');
  addAction({
    builder,
    action: {
      address: router,
      abi: [
        'function addLiquidity(address island, uint256 amount0Max, uint256 amount1Max, uint256 amount0Min, uint256 amount1Min, uint256 amountSharesMin, address receiver) returns (uint256 amount0, uint256 amount1, uint256 mintAmount)',
      ],
      functionName: 'addLiquidity',
      args: [island, amount0, amount1, amount0Min, amount1Min, amountSharesMin, walletAddress()],
    },
    approvals,
  });
  resetApprovals(builder, {
    tokens: tokensIn,
    spender: router,
  });
}

export async function buildRoycoMarketShortcut(shortcut: Shortcut, chainId: ChainIds): Promise<RoycoOutput> {
  const output = await shortcut.build(chainId);

  return {
    weirollCommands: output.script.commands,
    weirollState: output.script.state,
  };
}

export function getSetterValue(builder: Builder, set: Set<string>, item: string) {
  return builder.add({
    address: chainIdToSimulationRoles.get(builder.chainId)!.setter.address!,
    abi: ['function getValue(uint256 index) external view returns (uint256)'],
    functionName: 'getValue',
    args: [findPositionInSetterInputs(set, item)],
  });
}

function findPositionInSetterInputs(set: Set<string>, item: string) {
  let index = 0;
  for (const value of set) {
    if (value === item) {
      return index;
    }
    index++;
  }
  throw new Error(`Missing input '${item}' in set: ${JSON.stringify(set)}`);
}
