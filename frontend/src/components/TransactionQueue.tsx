import React from 'react';
import { useTransactionQueue } from '../hooks/useTransactionQueue';
import { formatAddress } from '../utils/validation';

export function TransactionQueue() {
  const {
    queue,
    isProcessing,
    removeFromQueue,
    reorderQueue,
    clearCompleted,
    clearAll,
    queuedCount,
    pendingCount,
  } = useTransactionQueue({ autoExecute: false }); // Manual execution for now

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
      case 'confirming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (queue.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Transaction Queue</h3>
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No transactions in queue
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Transaction Queue</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {queuedCount} queued, {pendingCount} pending
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCompleted}
            className="btn-secondary text-sm"
          >
            Clear Completed
          </button>
          <button
            onClick={clearAll}
            className="btn-secondary text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {queue.map((tx, index) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  #{index + 1}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
                <span className="text-sm font-medium dark:text-white">
                  {tx.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {tx.description}
              </p>
              {tx.to && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                  To: {formatAddress(tx.to)}
                </p>
              )}
            </div>
            <button
              onClick={() => removeFromQueue(tx.id)}
              disabled={tx.status === 'pending' || tx.status === 'confirming'}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Processing transactions...
        </div>
      )}
    </div>
  );
}
