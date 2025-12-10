import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { SwapInterface } from '../components/SwapInterface';
import { LiquidityPool } from '../components/LiquidityPool';
import { AIInsights } from '../components/AIInsights';

export function DeFi() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('swap');

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">DeFi Hub</h1>
        <p className="text-gray-600 dark:text-gray-400">Advanced DeFi features and AI-powered insights</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('swap')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'swap' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Token Swap
        </button>
        <button
          onClick={() => setActiveTab('liquidity')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'liquidity' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          Liquidity
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'insights' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          AI Insights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'swap' && <SwapInterface />}
          {activeTab === 'liquidity' && <LiquidityPool />}
          {activeTab === 'insights' && <AIInsights />}
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">DeFi Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Value Locked</span>
                <span className="font-semibold dark:text-white">$2.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">24h Volume</span>
                <span className="font-semibold dark:text-white">$156K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold dark:text-white">1,234</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-primary w-full text-sm">Bridge Assets</button>
              <button className="btn-primary w-full text-sm">Yield Farm</button>
              <button className="btn-primary w-full text-sm">Flash Loan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}