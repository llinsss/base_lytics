import React, { useState } from 'react';
import { useTokenScreener } from '../hooks/useTokenScreener';

export function TokenScreener() {
  const { 
    tokens, 
    filters, 
    setFilters, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder,
    getTrendingTokens,
    getNewTokens
  } = useTokenScreener();

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column as any);
      setSortOrder('desc');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Token Screener</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-sm"
          >
            🔍 Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Min Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || undefined)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Max Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || undefined)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Min Market Cap</label>
                <input
                  type="number"
                  placeholder="1000000"
                  onChange={(e) => handleFilterChange('minMarketCap', Number(e.target.value) || undefined)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Min Volume</label>
                <input
                  type="number"
                  placeholder="100000"
                  onChange={(e) => handleFilterChange('minVolume', Number(e.target.value) || undefined)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Risk Level</label>
                <select
                  onChange={(e) => handleFilterChange('riskLevel', e.target.value || undefined)}
                  className="input w-full"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Max Age (days)</label>
                <input
                  type="number"
                  placeholder="365"
                  onChange={(e) => handleFilterChange('maxAge', Number(e.target.value) || undefined)}
                  className="input w-full"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked || undefined)}
                    className="mr-2"
                  />
                  <span className="text-sm dark:text-white">Verified Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('symbol')}
                >
                  Token {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('price')}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('change24h')}
                >
                  24h % {sortBy === 'change24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('marketCap')}
                >
                  Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-right p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('volume24h')}
                >
                  Volume {sortBy === 'volume24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center p-2">Risk</th>
                <th className="text-center p-2">Age</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map(token => (
                <tr key={token.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium dark:text-white">{token.symbol}</span>
                      {token.verified && <span className="text-blue-500">✓</span>}
                      <span className="text-xs text-gray-500">{token.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-right dark:text-white">${token.price.toFixed(4)}</td>
                  <td className={`p-2 text-right font-medium ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                  </td>
                  <td className="p-2 text-right dark:text-white">${(token.marketCap / 1000000).toFixed(1)}M</td>
                  <td className="p-2 text-right dark:text-white">${(token.volume24h / 1000000).toFixed(1)}M</td>
                  <td className={`p-2 text-center font-medium ${getRiskColor(token.risk)}`}>
                    {token.risk.toUpperCase()}
                  </td>
                  <td className="p-2 text-center text-gray-500">{token.age}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">🔥 Trending</h3>
          <div className="space-y-2">
            {getTrendingTokens().slice(0, 5).map(token => (
              <div key={token.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="font-medium dark:text-white">{token.symbol}</span>
                <span className="text-green-500 font-medium">+{token.change24h.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">🆕 New Tokens</h3>
          <div className="space-y-2">
            {getNewTokens().slice(0, 5).map(token => (
              <div key={token.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <span className="font-medium dark:text-white">{token.symbol}</span>
                  {token.verified && <span className="text-blue-500 ml-1">✓</span>}
                </div>
                <span className="text-sm text-gray-500">{token.age}d old</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}