import React, { useState } from 'react';
import { useLiquidityPool } from '../hooks/useLiquidityPool';
import { parseEther } from 'viem';

export function LiquidityPool() {
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [lpTokens, setLpTokens] = useState('');
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const { addLiquidity, removeLiquidity, isPending } = useLiquidityPool();

  const handleAddLiquidity = () => {
    if (amountA && amountB) {
      addLiquidity(parseEther(amountA), parseEther(amountB));
    }
  };

  const handleRemoveLiquidity = () => {
    if (lpTokens) {
      removeLiquidity(parseEther(lpTokens));
    }
  };

  return (
    <div className="card">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('add')}
          className={`px-4 py-2 rounded-lg ${mode === 'add' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setMode('remove')}
          className={`px-4 py-2 rounded-lg ${mode === 'remove' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Remove Liquidity
        </button>
      </div>

      {mode === 'add' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">ETH Amount</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">BLT Amount</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={handleAddLiquidity}
            disabled={isPending || !amountA || !amountB}
            className="btn-primary w-full"
          >
            {isPending ? 'Adding...' : 'Add Liquidity'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">LP Tokens</label>
            <input
              type="number"
              placeholder="0.0"
              value={lpTokens}
              onChange={(e) => setLpTokens(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            onClick={handleRemoveLiquidity}
            disabled={isPending || !lpTokens}
            className="btn-primary w-full"
          >
            {isPending ? 'Removing...' : 'Remove Liquidity'}
          </button>
        </div>
      )}
    </div>
  );
}