import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdvancedPortfolioAnalytics() {
  const [timeframe, setTimeframe] = useState('7d');

  const performanceData = [
    { date: '2024-01-01', value: 10000, pnl: 0 },
    { date: '2024-01-02', value: 10250, pnl: 250 },
    { date: '2024-01-03', value: 9800, pnl: -200 },
    { date: '2024-01-04', value: 11200, pnl: 1200 },
    { date: '2024-01-05', value: 10900, pnl: 900 },
    { date: '2024-01-06', value: 12100, pnl: 2100 },
    { date: '2024-01-07', value: 11800, pnl: 1800 }
  ];

  const allocation = [
    { name: 'ETH', value: 45, color: '#627EEA' },
    { name: 'BTC', value: 25, color: '#F7931A' },
    { name: 'USDC', value: 15, color: '#2775CA' },
    { name: 'Other', value: 15, color: '#8B5CF6' }
  ];

  const metrics = {
    totalValue: 11800,
    totalPnL: 1800,
    pnlPercent: 18.0,
    sharpeRatio: 1.45,
    maxDrawdown: -8.2,
    winRate: 68.5,
    avgWin: 245,
    avgLoss: -120
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">📊 Advanced Analytics</h3>
          <div className="flex gap-2">
            {['1d', '7d', '30d', '90d'].map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 text-sm rounded ${
                  timeframe === period ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="text-xl font-bold text-green-600">${metrics.totalValue.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">P&L</p>
            <p className="text-xl font-bold text-blue-600">+${metrics.totalPnL}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</p>
            <p className="text-xl font-bold text-purple-600">{metrics.sharpeRatio}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Win Rate</p>
            <p className="text-xl font-bold text-orange-600">{metrics.winRate}%</p>
          </div>
        </div>

        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="font-semibold mb-4 dark:text-white">Portfolio Allocation</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h4 className="font-semibold mb-4 dark:text-white">Risk Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Max Drawdown</span>
              <span className="font-medium text-red-500">{metrics.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Win</span>
              <span className="font-medium text-green-500">+${metrics.avgWin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Loss</span>
              <span className="font-medium text-red-500">${metrics.avgLoss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Volatility</span>
              <span className="font-medium dark:text-white">12.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}