import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useStakingInfo, useTokenBalance, useContractWrite } from '../hooks/useContracts';
import { CONTRACT_ADDRESSES, BASE_TOKEN_ABI, BASE_STAKING_ABI } from '../utils/contracts';

export function StakingCard() {
  const { address } = useAccount();
  const stakingInfo = useStakingInfo(address);
  const tokenBalance = useTokenBalance(address);
  const { writeContract, isPending, isConfirming, isSuccess } = useContractWrite();
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');

  const handleApprove = () => {
    const amount = activeTab === 'stake' ? stakeAmount : unstakeAmount;
    if (!amount) return;
    
    writeContract({
      address: CONTRACT_ADDRESSES.BaseToken,
      abi: BASE_TOKEN_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.BaseStaking, parseEther(amount)],
    });
  };

  const handleStake = () => {
    if (!stakeAmount) return;
    
    writeContract({
      address: CONTRACT_ADDRESSES.BaseStaking,
      abi: BASE_STAKING_ABI,
      functionName: 'stake',
      args: [parseEther(stakeAmount)],
    });
  };

  const handleUnstake = () => {
    if (!unstakeAmount) return;
    
    writeContract({
      address: CONTRACT_ADDRESSES.BaseStaking,
      abi: BASE_STAKING_ABI,
      functionName: 'unstake',
      args: [parseEther(unstakeAmount)],
    });
  };

  const handleClaimRewards = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.BaseStaking,
      abi: BASE_STAKING_ABI,
      functionName: 'claimReward',
    });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">Staking</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Your Staked</p>
          <p className="text-lg font-bold text-base-600">
            {stakingInfo.userStaked ? formatEther(stakingInfo.userStaked) : '0'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Pending Rewards</p>
          <p className="text-lg font-bold text-green-600">
            {stakingInfo.pendingRewards ? formatEther(stakingInfo.pendingRewards) : '0'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">APY</p>
          <p className="text-lg font-bold">{stakingInfo.apy.toFixed(2)}%</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Total Staked</span>
          <span>{stakingInfo.totalStaked ? formatEther(stakingInfo.totalStaked) : '0'} tokens</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Your Balance</span>
          <span>{tokenBalance ? formatEther(tokenBalance) : '0'} tokens</span>
        </div>
      </div>

      {stakingInfo.pendingRewards > 0n && (
        <div className="mb-6">
          <button
            onClick={handleClaimRewards}
            disabled={isPending || isConfirming}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      )}

      <div className="border-t pt-6">
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('stake')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
              activeTab === 'stake'
                ? 'bg-base-600 text-white border-base-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => setActiveTab('unstake')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-r border-b ${
              activeTab === 'unstake'
                ? 'bg-base-600 text-white border-base-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Unstake
          </button>
        </div>

        {activeTab === 'stake' && (
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Amount to stake"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="input-field"
            />
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming || !stakeAmount}
                className="btn-secondary flex-1"
              >
                Approve
              </button>
              <button
                onClick={handleStake}
                disabled={isPending || isConfirming || !stakeAmount}
                className="btn-primary flex-1"
              >
                Stake
              </button>
            </div>
          </div>
        )}

        {activeTab === 'unstake' && (
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Amount to unstake"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              className="input-field"
            />
            <button
              onClick={handleUnstake}
              disabled={isPending || isConfirming || !unstakeAmount}
              className="btn-primary w-full"
            >
              Unstake
            </button>
          </div>
        )}

        {isSuccess && (
          <p className="text-green-600 text-sm mt-2">Transaction successful!</p>
        )}
      </div>
    </div>
  );
}