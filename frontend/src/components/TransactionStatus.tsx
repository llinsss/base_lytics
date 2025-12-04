import React from 'react';
import { useTransactionManager } from '../hooks/useTransactionManager';

export function TransactionStatus() {
  const { transactions } = useTransactionManager();
  const pendingTxs = transactions.filter(tx => tx.status === 'pending' || tx.status === 'confirming');

  if (pendingTxs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {pendingTxs.map(tx => (
        <div key={tx.hash} className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded-lg shadow-lg dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">{tx.type} {tx.status}...</span>
          </div>
        </div>
      ))}
    </div>
  );
}