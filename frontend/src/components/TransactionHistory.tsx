import React from 'react';
import { useTransactionManager } from '../hooks/useTransactionManager';

export function TransactionHistory() {
  const { transactions } = useTransactionManager();

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Transactions</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium dark:text-white">{tx.type}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tx.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  tx.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}