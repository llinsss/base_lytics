import React from 'react';
import { useRewards } from '../hooks/useRewards';

export function RewardsShowcase() {
  const { rewards, getRarityColor, getTotalRewards, getRewardsByRarity } = useRewards();
  const rarityStats = getRewardsByRarity();

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">Rewards & Collectibles</h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-500">{getTotalRewards()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(rarityStats).map(([rarity, count]) => (
            <div key={rarity} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className={`text-lg font-bold ${getRarityColor(rarity)}`}>{count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{rarity}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map(reward => (
            <div key={reward.id} className="relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  reward.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  reward.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  reward.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reward.rarity}
                </span>
              </div>
              
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  {reward.rarity === 'legendary' ? '👑' :
                   reward.rarity === 'epic' ? '💎' :
                   reward.rarity === 'rare' ? '⭐' : '🏅'}
                </div>
                <h4 className="font-semibold dark:text-white">{reward.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{reward.description}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Owned: {reward.balance}</span>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h4 className="text-lg font-semibold dark:text-white mb-2">No Rewards Yet</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Start trading, staking, and participating in governance to earn rewards!
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">How to Earn Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Trading Volume</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Bronze: $1,000+ volume</li>
              <li>• Silver: $10,000+ volume</li>
              <li>• Gold: $100,000+ volume</li>
              <li>• Diamond: $1,000,000+ volume</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Platform Activity</h4>
            <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
              <li>• Maintain trading streaks</li>
              <li>• Participate in governance</li>
              <li>• Stake tokens long-term</li>
              <li>• Early platform adoption</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}