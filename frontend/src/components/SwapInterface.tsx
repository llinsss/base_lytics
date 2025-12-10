import React, { useState } from 'react';
import { useTokenSwap } from '../hooks/useTokenSwap';
import { parseEther, formatEther } from 'viem';

export function SwapInterface() {
  const [amountIn, setAmountIn] = useState('');
  const [tokenIn, setTokenIn] = useState('ETH');
  const [tokenOut, setTokenOut] = useState('BLT');
  const { swap, getQuote, slippage, setSlippage, isPending } = useTokenSwap();

  const quote = amountIn ? getQuote(parseEther(amountIn), tokenIn, tokenOut) : 0n;

  const handleSwap = () => {
    if (amountIn) {
      swap(parseEther(amountIn), tokenIn, tokenOut);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Token Swap</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="ETH">ETH</option>
              <option value="BLT">BLT</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
            }}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ↕️
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quote ? formatEther(quote) : '0.0'}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="ETH">ETH</option>
              <option value="BLT">BLT</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Slippage: {slippage}%</span>
          <button
            onClick={() => setSlippage(slippage === 0.5 ? 1.0 : 0.5)}
            className="text-base-600 hover:text-base-700"
          >
            Adjust
          </button>
        </div>

        <button
          onClick={handleSwap}
          disabled={isPending || !amountIn}
          className="btn-primary w-full"
        >
          {isPending ? 'Swapping...' : 'Swap'}
        </button>
      </div>
    </div>
  );
}