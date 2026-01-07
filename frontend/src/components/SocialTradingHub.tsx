import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  roi: number;
  followers: number;
  winRate: number;
  copiers: number;
  verified: boolean;
}

export function SocialTradingHub() {
  const { addNotification } = useNotifications();
  const [following, setFollowing] = useState<string[]>([]);
  const [copyAmount, setCopyAmount] = useState('100');

  const topTraders: Trader[] = [
    { id: '1', name: 'CryptoKing', avatar: '👑', roi: 245.8, followers: 1250, winRate: 78.5, copiers: 89, verified: true },
    { id: '2', name: 'DeFiMaster', avatar: '🚀', roi: 189.2, followers: 890, winRate: 72.1, copiers: 67, verified: true },
    { id: '3', name: 'YieldHunter', avatar: '🎯', roi: 156.7, followers: 654, winRate: 69.8, copiers: 45, verified: false },
    { id: '4', name: 'BaseBuilder', avatar: '🔵', roi: 134.5, followers: 432, winRate: 65.2, copiers: 32, verified: true }
  ];

  const followTrader = (traderId: string, traderName: string) => {
    if (following.includes(traderId)) {
      setFollowing(prev => prev.filter(id => id !== traderId));
      addNotification({
        title: 'Unfollowed Trader',
        message: `Stopped copying ${traderName}`,
        type: 'info'
      });
    } else {
      setFollowing(prev => [...prev, traderId]);
      addNotification({
        title: 'Following Trader',
        message: `Now copying ${traderName} with $${copyAmount}`,
        type: 'success'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">👥 Social Trading Hub</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-white">Copy Amount ($)</label>
          <input
            type="number"
            value={copyAmount}
            onChange={(e) => setCopyAmount(e.target.value)}
            className="input w-full"
            placeholder="100"
          />
        </div>

        <div className="space-y-3">
          {topTraders.map(trader => (
            <div key={trader.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{trader.avatar}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium dark:text-white">{trader.name}</span>
                    {trader.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {trader.followers} followers • {trader.copiers} copiers
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-green-500">+{trader.roi}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {trader.winRate}% win rate
                </div>
                <button
                  onClick={() => followTrader(trader.id, trader.name)}
                  className={`mt-2 px-3 py-1 text-sm rounded ${
                    following.includes(trader.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {following.includes(trader.id) ? 'Unfollow' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {following.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3 dark:text-white">Your Copy Trades</h4>
          <div className="space-y-2">
            {following.map(traderId => {
              const trader = topTraders.find(t => t.id === traderId);
              return (
                <div key={traderId} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="dark:text-white">{trader?.avatar} {trader?.name}</span>
                  <span className="text-green-600 font-medium">${copyAmount} allocated</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}