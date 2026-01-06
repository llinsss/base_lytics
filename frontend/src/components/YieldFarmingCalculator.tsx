import React, { useState } from 'react';
import { useYieldFarming } from '../hooks/useYieldFarming';

export function YieldFarmingCalculator() {
  const { 
    pools, 
    selectedPool, 
    setSelectedPool, 
    amount, 
    setAmount, 
    compoundFrequency, 
    setCompoundFrequency,
    calculateYield,
    getFilteredPools,
    getBestPools
  } = useYieldFarming();

  const [filter, setFilter] = useState<string>('all');
  const calculation = selectedPool ? calculateYield(selectedPool, amount) : null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const filteredPools = filter === 'all' ? pools : getFilteredPools(filter);

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Yield Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input w-full"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Compound Frequency</label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(e.target.value as any)}
              className="input w-full"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {calculation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold mb-3 dark:text-white">
              Yield Projection for {selectedPool?.name}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Daily</p>
                <p className="font-semibold text-green-500">${calculation.dailyYield.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Weekly</p>
                <p className="font-semibold text-green-500">${calculation.weeklyYield.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Monthly</p>
                <p className="font-semibold text-green-500">${calculation.monthlyYield.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Yearly (Compounded)</p>
                <p className="font-semibold text-green-500">${calculation.compoundedYearly.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Available Pools</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Categories</option>
            <option value="dex">DEX</option>
            <option value="lending">Lending</option>
            <option value="staking">Staking</option>
            <option value="vault">Vault</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredPools.map(pool => (
            <div
              key={pool.id}
              onClick={() => setSelectedPool(pool)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedPool?.id === pool.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold dark:text-white">{pool.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{pool.protocol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-500">{pool.apy}% APY</p>
                  <p className={`text-sm ${getRiskColor(pool.risk)}`}>
                    {pool.risk} risk
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex gap-2">
                  {pool.tokens.map(token => (
                    <span key={token} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {token}
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  TVL: ${(pool.tvl / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Top Yields</h3>
        <div className="space-y-2">
          {getBestPools().map(pool => (
            <div key={pool.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <span className="font-medium dark:text-white">{pool.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{pool.protocol}</span>
              </div>
              <span className="font-semibold text-green-500">{pool.apy}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}