import React, { useState } from 'react';
import { usePortfolioBacktest } from '../hooks/usePortfolioBacktest';

export function PortfolioBacktest() {
  const { results, isRunning, runBacktest } = usePortfolioBacktest();
  const [strategy, setStrategy] = useState('dca');
  const [period, setPeriod] = useState('1y');
  const [ethAllocation, setEthAllocation] = useState(50);
  const [btcAllocation, setBtcAllocation] = useState(30);
  const [stableAllocation, setStableAllocation] = useState(20);

  const handleRunBacktest = () => {
    const allocation = {
      ETH: ethAllocation,
      BTC: btcAllocation,
      STABLE: stableAllocation
    };
    runBacktest(strategy, period, allocation);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">📊 Portfolio Backtesting</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Backtest Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="dca">Dollar Cost Average</option>
                <option value="momentum">Momentum</option>
                <option value="rebalance">Rebalancing</option>
                <option value="buyhold">Buy & Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="1y">1 Year</option>
                <option value="2y">2 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Portfolio Allocation</label>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="dark:text-white">ETH: {ethAllocation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ethAllocation}
                    onChange={(e) => setEthAllocation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="dark:text-white">BTC: {btcAllocation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={btcAllocation}
                    onChange={(e) => setBtcAllocation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="dark:text-white">Stables: {stableAllocation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stableAllocation}
                    onChange={(e) => setStableAllocation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="btn-primary w-full"
            >
              {isRunning ? 'Running Backtest...' : 'Run Backtest'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Backtest Results</h3>
          
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No backtest results yet</p>
          ) : (
            <div className="space-y-4">
              {results.slice(0, 3).map((result) => (
                <div key={result.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium dark:text-white capitalize">{result.strategy}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{result.period}</div>
                    </div>
                    <div className={`text-lg font-bold ${result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                      <span className="ml-1 font-medium dark:text-white">{result.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                      <span className="ml-1 font-medium text-red-600">{result.maxDrawdown.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Win Rate:</span>
                      <span className="ml-1 font-medium dark:text-white">{result.winRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Trades:</span>
                      <span className="ml-1 font-medium dark:text-white">{result.trades}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}