import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  followers: number;
  totalReturn: number;
  winRate: number;
  copiers: number;
  verified: boolean;
}

interface Trade {
  id: string;
  trader: string;
  action: 'buy' | 'sell';
  asset: string;
  amount: number;
  price: number;
  timestamp: number;
  profit?: number;
}

export function useSocialTrading() {
  const { addNotification } = useNotifications();
  const [topTraders] = useState<Trader[]>([
    {
      id: '1',
      name: 'CryptoWhale',
      avatar: '🐋',
      followers: 12500,
      totalReturn: 245.7,
      winRate: 78,
      copiers: 890,
      verified: true
    },
    {
      id: '2',
      name: 'DeFiMaster',
      avatar: '🚀',
      followers: 8900,
      totalReturn: 189.3,
      winRate: 72,
      copiers: 650,
      verified: true
    },
    {
      id: '3',
      name: 'YieldHunter',
      avatar: '🎯',
      followers: 6700,
      totalReturn: 156.8,
      winRate: 69,
      copiers: 420,
      verified: false
    }
  ]);

  const [recentTrades] = useState<Trade[]>([
    {
      id: '1',
      trader: 'CryptoWhale',
      action: 'buy',
      asset: 'ETH',
      amount: 5.2,
      price: 2150,
      timestamp: Date.now() - 300000,
      profit: 8.5
    },
    {
      id: '2',
      trader: 'DeFiMaster',
      action: 'sell',
      asset: 'BLT',
      amount: 1000,
      price: 1.25,
      timestamp: Date.now() - 600000,
      profit: -2.1
    }
  ]);

  const [following, setFollowing] = useState<string[]>([]);

  const followTrader = (traderId: string) => {
    setFollowing(prev => [...prev, traderId]);
    addNotification({ title: 'Now following trader!', type: 'success' });
  };

  const unfollowTrader = (traderId: string) => {
    setFollowing(prev => prev.filter(id => id !== traderId));
    addNotification({ title: 'Unfollowed trader', type: 'info' });
  };

  const copyTrade = (tradeId: string) => {
    addNotification({ title: 'Trade copied successfully!', type: 'success' });
  };

  return { topTraders, recentTrades, following, followTrader, unfollowTrader, copyTrade };
}