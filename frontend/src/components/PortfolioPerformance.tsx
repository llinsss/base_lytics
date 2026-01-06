import React from 'react';
import { usePortfolioPerformance } from '../hooks/usePortfolioPerformance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function PortfolioPerformance() {
  const { metrics, performanceHistory, sharpeRatio, maxDrawdown } = usePortfolioPerformance();

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Portfolio Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="text-xl font-bold dark:text-white">${metrics.totalValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total P&L</p>
            <p className={`text-xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${metrics.totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">P&L %</p>
            <p className={`text-xl font-bold ${metrics.pnlPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.pnlPercentage > 0 ? '+' : ''}{metrics.pnlPercentage}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</p>
            <p className="text-xl font-bold dark:text-white">{sharpeRatio.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">24h Change</p>
            <p className={`font-semibold ${metrics.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.dayChange > 0 ? '+' : ''}{metrics.dayChange}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">7d Change</p>
            <p className={`font-semibold ${metrics.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.weekChange > 0 ? '+' : ''}{metrics.weekChange}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</p>
            <p className="font-semibold text-red-500">-{maxDrawdown.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Best Performer</p>
            <p className="font-semibold text-green-600 dark:text-green-400">
              {metrics.bestPerformer.asset} +{metrics.bestPerformer.change}%
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Worst Performer</p>
            <p className="font-semibold text-red-600 dark:text-red-400">
              {metrics.worstPerformer.asset} {metrics.worstPerformer.change}%
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Performance Chart</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}