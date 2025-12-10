import React, { useState } from 'react';
import { useAITradingBot } from '../hooks/useAITradingBot';

export function AITradingBot() {
  const { strategies, botStatus, setBotStatus, toggleStrategy, createStrategy } = useAITradingBot();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyType, setNewStrategyType] = useState<'dca' | 'momentum' | 'arbitrage' | 'grid'>('dca');

  const handleCreateStrategy = () => {
    if (newStrategyName) {
      createStrategy(newStrategyName, newStrategyType);
      setNewStrategyName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">🤖 AI Trading Bot</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setBotStatus(botStatus === 'running' ? 'paused' : 'running')}
            className={`px-4 py-2 rounded-lg ${botStatus === 'running' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {botStatus === 'running' ? 'Pause Bot' : 'Start Bot'}
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            New Strategy
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Bot Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            botStatus === 'running' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            botStatus === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {botStatus.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">+24.5%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
          </div>
          <div>
            <div className="text-2xl font-bold dark:text-white">84</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Trades</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">92%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Create New Strategy</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Strategy name"
              value={newStrategyName}
              onChange={(e) => setNewStrategyName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <select
              value={newStrategyType}
              onChange={(e) => setNewStrategyType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="dca">Dollar Cost Average</option>
              <option value="momentum">Momentum Trading</option>
              <option value="arbitrage">Arbitrage</option>
              <option value="grid">Grid Trading</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreateStrategy} className="btn-primary">Create</button>
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">{strategy.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{strategy.type} Strategy</p>
              </div>
              <button
                onClick={() => toggleStrategy(strategy.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  strategy.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {strategy.active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Profit: <span className="text-green-600 font-medium">+{strategy.profit}%</span></span>
              <span className="text-gray-600 dark:text-gray-400">Trades: <span className="font-medium dark:text-white">{strategy.trades}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}