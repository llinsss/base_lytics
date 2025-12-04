import React, { useState } from 'react';
import { useStaking } from '../hooks';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';

export function StakingCard() {
  const { address } = useAccount();
  const { stakedBalance, stake, unstake, isPending } = useStaking();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const handleStake = () => {
    if (stakeAmount) {
      stake(parseEther(stakeAmount));
      setStakeAmount('');
    }
  };

  const handleUnstake = () => {
    if (unstakeAmount) {
      unstake(parseEther(unstakeAmount));
      setUnstakeAmount('');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Staking</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Staked Balance</p>
        <p className="text-2xl font-bold dark:text-white">
          {formatEther(stakedBalance)} BLT
        </p>
      </div>

      {address && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Stake Tokens</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleStake}
                disabled={isPending || !stakeAmount}
                className="btn-primary"
              >
                Stake
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Unstake Tokens</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handleUnstake}
                disabled={isPending || !unstakeAmount}
                className="btn-primary"
              >
                Unstake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}