import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { EnhancedTransactionHistory } from '../components/EnhancedTransactionHistory';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400">Track all your BaseLytics contract interactions</p>
        </div>

        <EnhancedTransactionHistory />

      </div>
    </ErrorBoundary>
  );
}