import React, { useState } from 'react';
import { useSocialTrading } from '../hooks/useSocialTrading';

export function SocialTrading() {
  const { topTraders, recentTrades, following, followTrader, unfollowTrader, copyTrade } = useSocialTrading();
  const [activeTab, setActiveTab] = useState<'traders' | 'trades' | 'leaderboard'>('traders');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">👥 Social Trading</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('traders')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'traders' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Top Traders
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'trades' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Live Trades
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'leaderboard' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {activeTab === 'traders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topTraders.map((trader) => (
            <div key={trader.id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{trader.avatar}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold dark:text-white">{trader.name}</span>
                    {trader.verified && <span className="text-blue-500">✓</span>}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {trader.followers.toLocaleString()} followers
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Return</span>
                  <span className="font-semibold text-green-600">+{trader.totalReturn}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                  <span className="font-semibold dark:text-white">{trader.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Copiers</span>
                  <span className="font-semibold dark:text-white">{trader.copiers}</span>
                </div>
              </div>
              
              <button
                onClick={() => following.includes(trader.id) ? unfollowTrader(trader.id) : followTrader(trader.id)}
                className={`w-full ${following.includes(trader.id) ? 'btn-secondary' : 'btn-primary'}`}
              >
                {following.includes(trader.id) ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'trades' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Trades</h3>
          <div className="space-y-3">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium dark:text-white">
                    {trade.trader} {trade.action.toUpperCase()} {trade.amount} {trade.asset}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    @ ${trade.price} • {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {trade.profit && (
                    <span className={`text-sm font-medium ${trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.profit > 0 ? '+' : ''}{trade.profit}%
                    </span>
                  )}
                  <button
                    onClick={() => copyTrade(trade.id)}
                    className="btn-primary text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">🏆 Monthly Leaderboard</h3>
          <div className="space-y-3">
            {topTraders.map((trader, index) => (
              <div key={trader.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-base-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium dark:text-white">{trader.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {trader.copiers} copiers
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">+{trader.totalReturn}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{trader.winRate}% win rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}