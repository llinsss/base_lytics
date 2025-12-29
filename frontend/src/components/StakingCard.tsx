import React, { useState } from 'react';
import { useStaking } from '../hooks';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { Skeleton } from './LoadingSkeleton';
import { useNotifications } from '../contexts/NotificationContext';

export function StakingCard() {
  const { address } = useAccount();
  const { stakedBalance, stake, unstake, isPending, isLoading } = useStaking();
  const { addNotification } = useNotifications();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const isValidStakeAmount = stakeAmount ? parseFloat(stakeAmount) > 0 : true;
  const isValidUnstakeAmount = unstakeAmount ? parseFloat(unstakeAmount) > 0 : true;

  const handleStake = () => {
    if (!stakeAmount || !isValidStakeAmount) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to stake',
        duration: 3000,
      });
      return;
    }

    try {
      stake(parseEther(stakeAmount));
      setStakeAmount('');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Staking Failed',
        message: error.message || 'Failed to stake tokens',
        duration: 5000,
      });
    }
  };

  const handleUnstake = () => {
    if (!unstakeAmount || !isValidUnstakeAmount) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to unstake',
        duration: 3000,
      });
      return;
    }

    try {
      unstake(parseEther(unstakeAmount));
      setUnstakeAmount('');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Unstaking Failed',
        message: error.message || 'Failed to unstake tokens',
        duration: 5000,
      });
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Staking</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Staked Balance</p>
        {isLoading ? (
          <Skeleton height={32} width="60%" className="mt-2" />
        ) : (
          <p className="text-2xl font-bold dark:text-white">
            {formatEther(stakedBalance as bigint)} BLT
          </p>
        )}
      </div>

      {address && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Stake Tokens</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  stakeAmount && !isValidStakeAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              <button
                onClick={handleStake}
                disabled={isPending || !stakeAmount || !isValidStakeAmount}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Stake
              </button>
            </div>
            {stakeAmount && !isValidStakeAmount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Amount must be greater than 0
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Unstake Tokens</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  unstakeAmount && !isValidUnstakeAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              <button
                onClick={handleUnstake}
                disabled={isPending || !unstakeAmount || !isValidUnstakeAmount}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Unstake
              </button>
            </div>
            {unstakeAmount && !isValidUnstakeAmount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Amount must be greater than 0
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}