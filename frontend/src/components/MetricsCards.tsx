import React from 'react';
import { AnalyticsData } from '../hooks/useAnalytics';

interface MetricsCardsProps {
  analytics: AnalyticsData;
}

export function MetricsCards({ analytics }: MetricsCardsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const metrics = [
    {
      title: 'Token Supply',
      value: formatNumber(analytics.tokenSupply.current),
      subtitle: `${analytics.tokenSupply.utilization.toFixed(1)}% utilized`,
      icon: '🪙',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'NFTs Minted',
      value: analytics.nftMetrics.totalMinted.toString(),
      subtitle: `${analytics.nftMetrics.revenue.toFixed(4)} ETH revenue`,
      icon: '🎨',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Staked',
      value: formatNumber(analytics.stakingMetrics.totalStaked),
      subtitle: `${analytics.stakingMetrics.apy.toFixed(2)}% APY`,
      icon: '🏦',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Users',
      value: analytics.stakingMetrics.participants.toString(),
      subtitle: 'Staking participants',
      icon: '👥',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
              <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
            </div>
            <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">{metric.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}