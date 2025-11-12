import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { MetricsCards } from '../components/MetricsCards';
import { TokenSupplyChart } from '../components/charts/TokenSupplyChart';
import { NFTRevenueChart } from '../components/charts/NFTRevenueChart';
import { StakingChart } from '../components/charts/StakingChart';

export function Analytics() {
  const { analytics, loading, refresh } = useAnalytics();
  const [timeRange, setTimeRange] = useState('30d');

  const exportData = () => {
    if (!analytics) return;
    
    const csvContent = [
      'Date,Token Supply,NFT Minted,Staking TVL',
      ...analytics.timeSeriesData.map(item => 
        `${item.date},${item.tokenSupply},${item.nftMinted},${item.stakingTVL}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baselytics-analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics</h1>
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your BaseLytics ecosystem</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button onClick={refresh} className="btn-secondary">
            Refresh
          </button>
          <button onClick={exportData} className="btn-primary">
            Export
          </button>
        </div>
      </div>

      <div className="mb-8">
        <MetricsCards analytics={analytics} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TokenSupplyChart data={analytics.timeSeriesData} />
        <NFTRevenueChart 
          data={analytics.timeSeriesData} 
          mintPrice={analytics.nftMetrics.mintPrice}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <StakingChart 
          data={analytics.timeSeriesData} 
          apy={analytics.stakingMetrics.apy}
        />
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-medium mb-1">Growth Trend</h3>
            <p className="text-sm text-gray-600">
              Token supply growing steadily with {analytics.tokenSupply.utilization.toFixed(1)}% utilization
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-medium mb-1">Revenue Stream</h3>
            <p className="text-sm text-gray-600">
              {analytics.nftMetrics.totalMinted} NFTs generating {analytics.nftMetrics.revenue.toFixed(4)} ETH
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-medium mb-1">Staking Health</h3>
            <p className="text-sm text-gray-600">
              {analytics.stakingMetrics.totalStaked.toLocaleString()} tokens staked at {analytics.stakingMetrics.apy.toFixed(2)}% APY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}