import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, Copy, Eye } from 'lucide-react';

interface Trader {
  id: string;
  username: string;
  avatar: string;
  totalReturn: number;
  winRate: number;
  followers: number;
  totalTrades: number;
  riskScore: number;
  verified: boolean;
  recentTrades: Trade[];
}

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  pnl?: number;
}

export const SocialTradingHub: React.FC = () => {
  const [topTraders, setTopTraders] = useState<Trader[]>([]);
  const [followedTraders, setFollowedTraders] = useState<string[]>([]);
  const [copyTradingEnabled, setCopyTradingEnabled] = useState<Record<string, boolean>>({});
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [sortBy, setSortBy] = useState<'return' | 'winRate' | 'followers'>('return');

  useEffect(() => {
    fetchTopTraders();
    fetchFollowedTraders();
  }, [sortBy]);

  const fetchTopTraders = async () => {
    try {
      const response = await fetch(`/api/social/traders?sort=${sortBy}&limit=20`);
      const data = await response.json();
      setTopTraders(data);
    } catch (error) {
      console.error('Failed to fetch traders:', error);
    }
  };

  const fetchFollowedTraders = async () => {
    try {
      const response = await fetch('/api/social/following');
      const data = await response.json();
      setFollowedTraders(data.map((t: any) => t.id));
    } catch (error) {
      console.error('Failed to fetch followed traders:', error);
    }
  };

  const followTrader = async (traderId: string) => {
    try {
      await fetch(`/api/social/follow/${traderId}`, { method: 'POST' });
      setFollowedTraders(prev => [...prev, traderId]);
    } catch (error) {
      console.error('Failed to follow trader:', error);
    }
  };

  const unfollowTrader = async (traderId: string) => {
    try {
      await fetch(`/api/social/unfollow/${traderId}`, { method: 'POST' });
      setFollowedTraders(prev => prev.filter(id => id !== traderId));
    } catch (error) {
      console.error('Failed to unfollow trader:', error);
    }
  };

  const toggleCopyTrading = async (traderId: string) => {
    try {
      const enabled = !copyTradingEnabled[traderId];
      await fetch(`/api/social/copy-trading/${traderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      setCopyTradingEnabled(prev => ({ ...prev, [traderId]: enabled }));
    } catch (error) {
      console.error('Failed to toggle copy trading:', error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatReturn = (value: number) => (
    <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
      {value >= 0 ? '+' : ''}{value.toFixed(2)}%
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Social Trading Hub</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            {[
              { key: 'return', label: 'Total Return' },
              { key: 'winRate', label: 'Win Rate' },
              { key: 'followers', label: 'Followers' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setSortBy(option.key as any)}
                className={`px-3 py-1 rounded text-sm ${
                  sortBy === option.key 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topTraders.map(trader => (
          <div key={trader.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={trader.avatar} 
                  alt={trader.username}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">{trader.username}</span>
                    {trader.verified && <Star className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trader.followers} followers
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedTrader(trader)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold">{formatReturn(trader.totalReturn)}</div>
                <div className="text-xs text-gray-500">Total Return</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{trader.winRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{trader.totalTrades}</div>
                <div className="text-xs text-gray-500">Total Trades</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${getRiskColor(trader.riskScore)}`}>
                  {trader.riskScore}/10
                </div>
                <div className="text-xs text-gray-500">Risk Score</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => followedTraders.includes(trader.id) 
                  ? unfollowTrader(trader.id) 
                  : followTrader(trader.id)
                }
                className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                  followedTraders.includes(trader.id)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                {followedTraders.includes(trader.id) ? 'Following' : 'Follow'}
              </button>
              
              <button
                onClick={() => toggleCopyTrading(trader.id)}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium ${
                  copyTradingEnabled[trader.id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                }`}
              >
                <Copy className="w-4 h-4 inline mr-1" />
                {copyTradingEnabled[trader.id] ? 'Copying' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trader Detail Modal */}
      {selectedTrader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Trader Profile</h3>
              <button
                onClick={() => setSelectedTrader(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <img 
                src={selectedTrader.avatar} 
                alt={selectedTrader.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold">{selectedTrader.username}</h4>
                  {selectedTrader.verified && <Star className="w-5 h-5 text-yellow-500" />}
                </div>
                <p className="text-gray-500">{selectedTrader.followers} followers</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-lg font-bold">{formatReturn(selectedTrader.totalReturn)}</div>
                <div className="text-sm text-gray-500">Total Return</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-lg font-bold">{selectedTrader.winRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-lg font-bold">{selectedTrader.totalTrades}</div>
                <div className="text-sm text-gray-500">Total Trades</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className={`text-lg font-bold ${getRiskColor(selectedTrader.riskScore)}`}>
                  {selectedTrader.riskScore}/10
                </div>
                <div className="text-sm text-gray-500">Risk Score</div>
              </div>
            </div>

            <h5 className="font-semibold mb-3">Recent Trades</h5>
            <div className="space-y-2">
              {selectedTrader.recentTrades.map(trade => (
                <div key={trade.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="font-medium">{trade.symbol}</span>
                    <span className="text-sm text-gray-500">
                      {trade.amount} @ ${trade.price.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-right">
                    {trade.pnl !== undefined && (
                      <div className={trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};