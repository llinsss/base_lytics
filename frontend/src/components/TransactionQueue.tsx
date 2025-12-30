import React from 'react';
import { useTransactionQueue } from '../hooks/useTransactionQueue';
import { QueuedTransaction } from '../hooks/useTransactionQueue';

export function TransactionQueue() {
  const {
    queue,
    processing,
    dequeue,
    reorder,
    clearCompleted,
    clearQueue,
    pendingCount,
    completedCount,
  } = useTransactionQueue({ autoExecute: true });

  const pending = queue.filter(tx => tx.status === 'pending');
  const processingTxs = queue.filter(tx => tx.status === 'processing');
  const completed = queue.filter(tx => tx.status === 'completed');
  const failed = queue.filter(tx => tx.status === 'failed');

  if (queue.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Transaction Queue</h3>
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions in queue
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold dark:text-white">Transaction Queue</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {pendingCount} pending, {completedCount} completed
            {processing && ', processing...'}
          </p>
        </div>
        <div className="flex gap-2">
          {(completed.length > 0 || failed.length > 0) && (
            <button
              onClick={clearCompleted}
              className="btn-secondary text-sm"
            >
              Clear Completed
            </button>
          )}
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="btn-secondary text-sm"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Processing */}
        {processingTxs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              Processing
            </h4>
            {processingTxs.map(tx => (
              <TransactionQueueItem
                key={tx.id}
                transaction={tx}
                onCancel={dequeue}
                onReorder={reorder}
              />
            ))}
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Pending ({pending.length})
            </h4>
            {pending.map(tx => (
              <TransactionQueueItem
                key={tx.id}
                transaction={tx}
                onCancel={dequeue}
                onReorder={reorder}
              />
            ))}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
              Completed ({completed.length})
            </h4>
            {completed.slice(0, 5).map(tx => (
              <TransactionQueueItem
                key={tx.id}
                transaction={tx}
                onCancel={dequeue}
                onReorder={reorder}
              />
            ))}
          </div>
        )}

        {/* Failed */}
        {failed.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              Failed ({failed.length})
            </h4>
            {failed.slice(0, 5).map(tx => (
              <TransactionQueueItem
                key={tx.id}
                transaction={tx}
                onCancel={dequeue}
                onReorder={reorder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionQueueItem({
  transaction,
  onCancel,
  onReorder,
}: {
  transaction: QueuedTransaction;
  onCancel: (id: string) => void;
  onReorder: (id: string, priority: number) => void;
}) {
  const getStatusColor = (status: QueuedTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Priority: {transaction.priority}
            </span>
          </div>
          <p className="font-medium dark:text-white mb-1">{transaction.description}</p>
          {transaction.hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-base-600 hover:text-base-700 dark:text-base-400 font-mono"
            >
              {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
            </a>
          )}
          {transaction.error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{transaction.error}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(transaction.timestamp).toLocaleString()}
          </p>
        </div>
        {transaction.status === 'pending' && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onReorder(transaction.id, transaction.priority + 1)}
              className="px-2 py-1 text-xs btn-secondary"
              title="Increase priority"
            >
              ↑
            </button>
            <button
              onClick={() => onCancel(transaction.id)}
              className="px-2 py-1 text-xs btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

