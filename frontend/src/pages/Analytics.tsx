import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { PortfolioOverview } from '../components/PortfolioOverview';
import { BalanceChart } from '../components/charts/BalanceChart';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ChartSkeleton, MetricCardSkeleton } from '../components/LoadingSkeleton';
import { useRealTimeAnalytics } from '../hooks/useRealTimeAnalytics';
import { downloadCSV, formatDateForExport } from '../utils/export';

export function Analytics() {
  const { isConnected } = useAccount();
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const { data, loading, error, currentValues } = useRealTimeAnalytics(timeRange);

  // Transform data for BalanceChart
  const balanceData = data.map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    balance: point.tokenSupply,
  }));

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your performance and insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 7
                  ? 'bg-base-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 30
                  ? 'bg-base-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              30d
            </button>
            <button
              onClick={() => setTimeRange(90)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 90
                  ? 'bg-base-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              90d
            </button>
            <button
              onClick={() => {
                const exportData = data.map(point => ({
                  Date: formatDateForExport(point.date),
                  'Token Supply': point.tokenSupply,
                  'NFTs Minted': point.nftMinted,
                  'Total Staked': point.totalStaked,
                  'Revenue (ETH)': point.revenue,
                }));
                downloadCSV(exportData, `analytics-${timeRange}d-${Date.now()}`);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error}. Showing limited data.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Token Supply</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentValues.tokenSupply.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">NFTs Minted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentValues.nftMinted.toLocaleString()}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Staked</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentValues.totalStaked.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.reduce((sum, point) => sum + point.revenue, 0).toFixed(2)} ETH
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <BalanceChart data={balanceData} />
            )}
          </div>
          <ErrorBoundary>
            <PortfolioOverview />
          </ErrorBoundary>
        </div>

        <div className="mt-6">
          <ErrorBoundary>
            {/* Transaction history can be added here if needed */}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}