import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';

interface Reward {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  balance: number;
}

const REWARD_METADATA = {
  1: { name: 'Bronze Trader', description: 'Traded $1,000+ volume', rarity: 'common' as const },
  2: { name: 'Silver Trader', description: 'Traded $10,000+ volume', rarity: 'rare' as const },
  3: { name: 'Gold Trader', description: 'Traded $100,000+ volume', rarity: 'epic' as const },
  4: { name: 'Diamond Trader', description: 'Traded $1,000,000+ volume', rarity: 'legendary' as const },
  5: { name: 'Streak Master', description: 'Active trading streak', rarity: 'rare' as const },
  6: { name: 'Volume King', description: 'High volume milestone', rarity: 'epic' as const },
  7: { name: 'Early Adopter', description: 'Platform pioneer', rarity: 'legendary' as const },
  8: { name: 'Governance Voter', description: 'Active in governance', rarity: 'rare' as const }
};

export function useRewards() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const { writeContract, isPending } = useWriteContract();
  const [rewards, setRewards] = useState<Reward[]>([]);

  const { data: rewardsData, refetch } = useReadContract({
    address: process.env.REACT_APP_REWARDS_CONTRACT as `0x${string}`,
    abi: [
      {
        name: 'getUserRewards',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [
          { name: 'tokenIds', type: 'uint256[]' },
          { name: 'balances', type: 'uint256[]' }
        ]
      }
    ],
    functionName: 'getUserRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  React.useEffect(() => {
    if (rewardsData) {
      const [tokenIds, balances] = rewardsData as [bigint[], bigint[]];
      const userRewards = tokenIds.map((id, index) => {
        const tokenId = Number(id);
        const metadata = REWARD_METADATA[tokenId as keyof typeof REWARD_METADATA];
        return {
          id: tokenId,
          name: metadata?.name || `Reward #${tokenId}`,
          description: metadata?.description || 'Unknown reward',
          image: `/rewards/${tokenId}.png`,
          rarity: metadata?.rarity || 'common',
          balance: Number(balances[index])
        };
      }).filter(reward => reward.balance > 0);
      
      setRewards(userRewards);
    }
  }, [rewardsData]);

  const claimReward = async (tokenId: number) => {
    if (!address) return;

    try {
      await writeContract({
        address: process.env.REACT_APP_REWARDS_CONTRACT as `0x${string}`,
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'id', type: 'uint256' },
              { name: 'amount', type: 'uint256' },
              { name: 'data', type: 'bytes' }
            ]
          }
        ],
        functionName: 'mint',
        args: [address, BigInt(tokenId), BigInt(1), '0x']
      });

      addNotification({
        title: 'Reward Claimed!',
        message: `You earned ${REWARD_METADATA[tokenId as keyof typeof REWARD_METADATA]?.name}`,
        type: 'success'
      });

      refetch();
    } catch (error) {
      addNotification({
        title: 'Claim Failed',
        message: 'Failed to claim reward',
        type: 'error'
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-blue-500';
      case 'epic': return 'text-purple-500';
      case 'legendary': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getTotalRewards = () => rewards.reduce((sum, reward) => sum + reward.balance, 0);

  const getRewardsByRarity = () => {
    const grouped = rewards.reduce((acc, reward) => {
      acc[reward.rarity] = (acc[reward.rarity] || 0) + reward.balance;
      return acc;
    }, {} as Record<string, number>);
    return grouped;
  };

  return {
    rewards,
    claimReward,
    getRarityColor,
    getTotalRewards,
    getRewardsByRarity,
    isLoading: isPending,
    refetch
  };
}