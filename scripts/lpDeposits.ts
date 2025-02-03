import { BigNumber } from '@ethersproject/bignumber';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import {
  getChainId,
  getDepositLockerAmount,
  getMarketInputToken,
  getRpcUrlByChainId,
  getUniswapLiquidity,
} from '../src/helpers';

const minBps = 9970;
const bps = 10000;

async function main() {
  try {
    const args: string[] = process.argv.slice(2);

    if (args.length < 2) throw 'Error: Please pass chain and market hash';
    const chain = args[0];
    const marketHash = args[1];

    const chainId = getChainId(chain);
    if (!chainId) throw 'Error: Unknown chain';

    const rpcUrl = getRpcUrlByChainId(chainId);
    const provider = new StaticJsonRpcProvider({
      url: rpcUrl,
    });

    const lockedAmount = await getDepositLockerAmount(provider, marketHash);
    // Check if underlying is uniswap
    const token = await getMarketInputToken(provider, marketHash);

    console.log('Market Hash: ', marketHash);
    console.log('Locked amount: ', lockedAmount.toString());
    console.log('LP Token: ', token);
    const { amount0, amount1 } = await getUniswapLiquidity(provider, token, lockedAmount);
    const minAmount0 = BigNumber.from(amount0).mul(minBps).div(bps).toString();
    const minAmount1 = BigNumber.from(amount1).mul(minBps).div(bps).toString();

    console.log({
      amount0,
      amount1,
      minAmount0,
      minAmount1,
    });
  } catch (e) {
    console.error(e);
  }
}

main();
