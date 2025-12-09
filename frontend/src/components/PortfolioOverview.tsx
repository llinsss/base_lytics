import React from 'react';
import { useTokenBalance, useNFTBalance, useStaking } from '../hooks';
import { formatEther } from 'viem';

export function PortfolioOverview() {
  const { balance: tokenBalance } = useTokenBalance();
  const { balance: nftBalance } = useNFTBalance();
  const { stakedBalance } = useStaking();

  const totalValue = Number(formatEther((tokenBalance as bigint) + (stakedBalance as bigint)));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Portfolio Overview</h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Total Token Value</span>
          <span className="font-semibold dark:text-white">{totalValue.toFixed(2)} BLT</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">NFTs Owned</span>
          <span className="font-semibold dark:text-white">{nftBalance.toString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Staked Amount</span>
          <span className="font-semibold dark:text-white">{formatEther(stakedBalance as bigint)} BLT</span>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold dark:text-white">Portfolio Health</span>
            <span className="text-green-600 font-semibold">Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}