import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { PortfolioOverview } from '../components/PortfolioOverview';
import { BalanceChart } from '../components/charts/BalanceChart';
import { TransactionHistory } from '../components/TransactionHistory';

export function Analytics() {
  const { isConnected } = useAccount();
  
  // Mock data for charts
  const balanceData = [
    { date: '1/1', balance: 100 },
    { date: '1/2', balance: 150 },
    { date: '1/3', balance: 120 },
    { date: '1/4', balance: 200 },
    { date: '1/5', balance: 180 },
    { date: '1/6', balance: 250 },
    { date: '1/7', balance: 300 }
  ];

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your performance and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceChart data={balanceData} />
        </div>
        <PortfolioOverview />
      </div>

      <div className="mt-6">
        <TransactionHistory />
      </div>
    </div>
  );
}