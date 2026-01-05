import React, { useState } from 'react';
import { usePortfolioRebalancing } from '../hooks/usePortfolioRebalancing';

export function PortfolioRebalancing() {
  const { strategies, currentPortfolio, createStrategy, executeRebalance, toggleStrategy } = usePortfolioRebalancing();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    frequency: 'weekly' as const,
    threshold: 5,
    allocations: { ETH: 40, BTC: 30, USDC: 30 }
  });

  const handleCreateStrategy = () => {
    if (newStrategy.name) {
      createStrategy(newStrategy.name, newStrategy.allocations, newStrategy.frequency, newStrategy.threshold);
      setNewStrategy({ name: '', frequency: 'weekly', threshold: 5, allocations: { ETH: 40, BTC: 30, USDC: 30 } });
      setShowCreateForm(false);
    }
  };

  const totalValue = currentPortfolio.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">⚖️ Portfolio Rebalancing</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          Create Strategy
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Create Rebalancing Strategy</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Strategy name"
              value={newStrategy.name}
              onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">ETH %</label>
                <input
                  type="number"
                  value={newStrategy.allocations.ETH}
                  onChange={(e) => setNewStrategy({
                    ...newStrategy,
                    allocations: { ...newStrategy.allocations, ETH: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">BTC %</label>
                <input
                  type="number"
                  value={newStrategy.allocations.BTC}
                  onChange={(e) => setNewStrategy({
                    ...newStrategy,
                    allocations: { ...newStrategy.allocations, BTC: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">USDC %</label>
                <input
                  type="number"
                  value={newStrategy.allocations.USDC}
                  onChange={(e) => setNewStrategy({
                    ...newStrategy,
                    allocations: { ...newStrategy.allocations, USDC: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleCreateStrategy} className="btn-primary">Create</button>
              <button onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Current Portfolio</h3>
          <div className="space-y-3">
            {currentPortfolio.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium dark:text-white">{asset.symbol}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.balance} {asset.symbol} • ${asset.value.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium dark:text-white">{asset.currentAllocation}%</div>
                  <div className={`text-sm ${
                    asset.deviation > 0 ? 'text-red-600' : asset.deviation < 0 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {asset.deviation > 0 ? '+' : ''}{asset.deviation}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between font-semibold dark:text-white">
              <span>Total Portfolio Value</span>
              <span>${totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Rebalancing Strategies</h3>
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium dark:text-white">{strategy.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {strategy.frequency} • {strategy.threshold}% threshold
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStrategy(strategy.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        strategy.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      {strategy.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  {Object.entries(strategy.allocations).map(([asset, allocation]) => (
                    <div key={asset} className="text-center">
                      <div className="font-medium dark:text-white">{asset}</div>
                      <div className="text-gray-600 dark:text-gray-400">{allocation}%</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {strategy.lastRebalance 
                      ? `Last: ${strategy.lastRebalance.toLocaleDateString()}`
                      : 'Never executed'
                    }
                  </div>
                  <button
                    onClick={() => executeRebalance(strategy.id)}
                    className="btn-primary text-xs"
                  >
                    Rebalance Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}