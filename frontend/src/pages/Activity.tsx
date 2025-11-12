import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { ActivityFeed } from '../components/ActivityFeed';

export function Activity() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
        <p className="text-gray-600">Track all your BaseLytics contract interactions</p>
      </div>

      <ActivityFeed />

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">📊</p>
            <p className="text-sm text-gray-600">Analytics</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">⛽</p>
            <p className="text-sm text-gray-600">Gas Usage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">📈</p>
            <p className="text-sm text-gray-600">Trends</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">📤</p>
            <p className="text-sm text-gray-600">Export</p>
          </div>
        </div>
      </div>
    </div>
  );
}