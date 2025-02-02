import { AddressArg } from '@ensofinance/shortcuts-builder/types';
import { StaticJsonRpcProvider } from '@ethersproject/providers';

import { getChainId, getRpcUrlByChainId, getUniswapLiquidity } from '../src/helpers';

async function main() {
  try {
    const args: string[] = process.argv.slice(2);

    if (args.length < 3) throw 'Error: Please pass chain, lp token, and amount';
    const chain = args[0];
    const lpToken = args[1];
    const liquidity = args[2];

    const chainId = getChainId(chain);
    if (!chainId) throw 'Error: Unknown chain';

    const rpcUrl = getRpcUrlByChainId(chainId);
    const provider = new StaticJsonRpcProvider({
      url: rpcUrl,
    });

    const response = await getUniswapLiquidity(provider, lpToken as AddressArg, liquidity);
    console.log(response);
  } catch (e) {
    console.error(e);
  }
}

main();
