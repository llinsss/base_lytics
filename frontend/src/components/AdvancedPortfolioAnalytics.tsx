import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface PortfolioAsset {
  symbol: string;
  amount: number;
  value: number;
  allocation: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
}

export const AdvancedPortfolioAnalytics: React.FC = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchPortfolioData();
  }, [timeframe]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`/api/portfolio/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      setAssets(data.assets);
      setMetrics(data.metrics);
      setPerformanceHistory(data.performanceHistory);
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const getRiskLevel = (volatility: number) => {
    if (volatility < 0.1) return { level: 'Low', color: 'text-green-500' };
    if (volatility < 0.3) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'High', color: 'text-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
        
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(metrics.totalPnLPercent)}
              </div>
              <div className="text-sm text-gray-500">Total P&L</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Sharpe Ratio</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRiskLevel(metrics.volatility).color}`}>
                {getRiskLevel(metrics.volatility).level}
              </div>
              <div className="text-sm text-gray-500">Risk Level</div>
            </div>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="flex space-x-2 mb-4">
          {['1d', '7d', '30d', '90d', '1y'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded ${
                timeframe === tf 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Performance Chart */}
        {performanceHistory.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatPercent(value), 'Performance']} />
              <Line 
                type="monotone" 
                dataKey="performance" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Asset Allocation</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assets}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ symbol, allocation }) => `${symbol} ${allocation.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="allocation"
              >
                {assets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Allocation']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Asset Performance</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatPercent(value), 'P&L %']} />
              <Bar dataKey="pnlPercent" fill="#8884d8">
                {assets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnlPercent >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Asset Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Asset Details</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Asset</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Value</th>
                <th className="text-right py-2">Allocation</th>
                <th className="text-right py-2">P&L</th>
                <th className="text-right py-2">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-semibold">{asset.symbol}</td>
                  <td className="text-right py-2">{asset.amount.toFixed(4)}</td>
                  <td className="text-right py-2">{formatCurrency(asset.value)}</td>
                  <td className="text-right py-2">{asset.allocation.toFixed(1)}%</td>
                  <td className={`text-right py-2 ${asset.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(asset.pnl)}
                  </td>
                  <td className={`text-right py-2 ${asset.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercent(asset.pnlPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Metrics */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Risk Metrics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.volatility * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500">Volatility</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{(metrics.maxDrawdown * 100).toFixed(2)}%</div>
              <div className="text-sm text-gray-500">Max Drawdown</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{metrics.beta.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Beta</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{metrics.sharpeRatio.toFixed(2)}</div>
              <div className="text-sm text-gray-500">Sharpe Ratio</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};