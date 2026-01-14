import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Trader {
  address: string;
  name: string;
  totalReturn: number;
  winRate: number;
  followers: number;
  aum: number;
  verified: boolean;
}

interface Strategy {
  id: string;
  creator: string;
  name: string;
  description: string;
  price: number;
  sales: number;
  rating: number;
}

export function useSocialTrading() {
  const { address } = useAccount();
  const [following, setFollowing] = useState<string[]>([]);
  const [copyTrading, setCopyTrading] = useState<Record<string, { enabled: boolean; allocation: number }>>({});

  useEffect(() => {
    const saved = localStorage.getItem(`baselytics_following_${address}`);
    if (saved) setFollowing(JSON.parse(saved));
  }, [address]);

  const getLeaderboard = async (): Promise<Trader[]> => {
    // Fetch from backend or subgraph
    return [
      {
        address: '0x1234...',
        name: 'CryptoWhale',
        totalReturn: 245.5,
        winRate: 68.5,
        followers: 1250,
        aum: 5000000,
        verified: true,
      },
    ];
  };

  const followTrader = (traderAddress: string) => {
    setFollowing(prev => {
      const updated = [...prev, traderAddress];
      localStorage.setItem(`baselytics_following_${address}`, JSON.stringify(updated));
      return updated;
    });
  };

  const unfollowTrader = (traderAddress: string) => {
    setFollowing(prev => {
      const updated = prev.filter(a => a !== traderAddress);
      localStorage.setItem(`baselytics_following_${address}`, JSON.stringify(updated));
      return updated;
    });
  };

  const enableCopyTrading = (traderAddress: string, allocation: number) => {
    setCopyTrading(prev => ({
      ...prev,
      [traderAddress]: { enabled: true, allocation },
    }));
  };

  const disableCopyTrading = (traderAddress: string) => {
    setCopyTrading(prev => ({
      ...prev,
      [traderAddress]: { enabled: false, allocation: 0 },
    }));
  };

  const getStrategies = async (): Promise<Strategy[]> => {
    // Fetch from marketplace
    return [];
  };

  const purchaseStrategy = async (strategyId: string) => {
    // Execute purchase transaction
  };

  return {
    following,
    copyTrading,
    getLeaderboard,
    followTrader,
    unfollowTrader,
    enableCopyTrading,
    disableCopyTrading,
    getStrategies,
    purchaseStrategy,
  };
}
