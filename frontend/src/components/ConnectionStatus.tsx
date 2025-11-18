import React from 'react';
import { useAccount } from 'wagmi';

export function ConnectionStatus() {
  const { isConnecting, isReconnecting, isDisconnected } = useAccount();

  if (isConnecting || isReconnecting) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-lg dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">
            {isReconnecting ? 'Reconnecting wallet...' : 'Connecting wallet...'}
          </span>
        </div>
      </div>
    );
  }

  return null;
}