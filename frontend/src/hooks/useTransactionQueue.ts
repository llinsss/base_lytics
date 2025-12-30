import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseTransactionError } from '../utils/transactionErrors';
import { useNotifications } from '../contexts/NotificationContext';

export interface QueuedTransaction {
  id: string;
  description: string;
  to: `0x${string}`;
  data: `0x${string}`;
  value?: bigint;
  gasLimit?: bigint;
  priority: number; // Higher = more priority
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  hash?: `0x${string}`;
  timestamp: number;
}

interface TransactionQueueOptions {
  maxConcurrent?: number;
  autoExecute?: boolean;
}

/**
 * Hook for managing a queue of transactions
 */
export function useTransactionQueue(options: TransactionQueueOptions = {}) {
  const { maxConcurrent = 1, autoExecute = true } = options;
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { addNotification } = useNotifications();
  
  const [queue, setQueue] = useState<QueuedTransaction[]>([]);
  const [processing, setProcessing] = useState(false);

  /**
   * Add transaction to queue
   */
  const enqueue = useCallback((
    description: string,
    to: `0x${string}`,
    data: `0x${string}`,
    options?: {
      value?: bigint;
      gasLimit?: bigint;
      priority?: number;
    }
  ): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: QueuedTransaction = {
      id,
      description,
      to,
      data,
      value: options?.value,
      gasLimit: options?.gasLimit,
      priority: options?.priority || 0,
      status: 'pending',
      timestamp: Date.now(),
    };

    setQueue(prev => {
      const newQueue = [...prev, transaction];
      // Sort by priority (higher first), then by timestamp
      return newQueue.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.timestamp - b.timestamp;
      });
    });

    addNotification({
      type: 'info',
      title: 'Transaction Queued',
      message: `${description} added to queue`,
      duration: 3000,
    });

    if (autoExecute) {
      processQueue();
    }

    return id;
  }, [autoExecute, addNotification]);

  /**
   * Remove transaction from queue
   */
  const dequeue = useCallback((id: string) => {
    setQueue(prev => prev.map(tx =>
      tx.id === id ? { ...tx, status: 'cancelled' } : tx
    ));

    addNotification({
      type: 'info',
      title: 'Transaction Cancelled',
      message: 'Transaction removed from queue',
      duration: 2000,
    });
  }, [addNotification]);

  /**
   * Reorder queue (change priority)
   */
  const reorder = useCallback((id: string, newPriority: number) => {
    setQueue(prev => {
      const newQueue = prev.map(tx =>
        tx.id === id ? { ...tx, priority: newPriority } : tx
      );
      return newQueue.sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.timestamp - b.timestamp;
      });
    });
  }, []);

  /**
   * Process the queue
   */
  const processQueue = useCallback(async () => {
    if (processing || !walletClient || !publicClient) return;

    const pending = queue.filter(tx => tx.status === 'pending');
    if (pending.length === 0) return;

    setProcessing(true);

    try {
      const toProcess = pending.slice(0, maxConcurrent);

      for (const transaction of toProcess) {
        try {
          // Update status to processing
          setQueue(prev => prev.map(tx =>
            tx.id === transaction.id ? { ...tx, status: 'processing' } : tx
          ));

          // Estimate gas if not provided
          let gasLimit = transaction.gasLimit;
          if (!gasLimit) {
            gasLimit = await publicClient.estimateGas({
              to: transaction.to,
              data: transaction.data,
              value: transaction.value,
              account: walletClient.account.address,
            });
          }

          // Send transaction
          const hash = await walletClient.sendTransaction({
            to: transaction.to,
            data: transaction.data,
            value: transaction.value,
            gas: gasLimit,
          });

          // Wait for confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ hash });

          // Update status to completed
          setQueue(prev => prev.map(tx =>
            tx.id === transaction.id
              ? { ...tx, status: 'completed', hash, gasLimit: receipt.gasUsed }
              : tx
          ));

          addNotification({
            type: 'success',
            title: 'Transaction Completed',
            message: transaction.description,
            duration: 5000,
          });
        } catch (error: any) {
          const parsed = parseTransactionError(error);
          
          setQueue(prev => prev.map(tx =>
            tx.id === transaction.id
              ? { ...tx, status: 'failed', error: parsed.message }
              : tx
          ));

          addNotification({
            type: 'error',
            title: 'Transaction Failed',
            message: `${transaction.description}: ${parsed.message}`,
            duration: 8000,
          });
        }
      }
    } finally {
      setProcessing(false);
      
      // Continue processing if there are more pending transactions
      const stillPending = queue.filter(tx => tx.status === 'pending');
      if (stillPending.length > 0 && autoExecute) {
        setTimeout(() => processQueue(), 1000);
      }
    }
  }, [queue, processing, walletClient, publicClient, maxConcurrent, autoExecute, addNotification]);

  /**
   * Clear completed/failed transactions
   */
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(tx =>
      tx.status !== 'completed' && tx.status !== 'failed' && tx.status !== 'cancelled'
    ));
  }, []);

  /**
   * Clear entire queue
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
    addNotification({
      type: 'info',
      title: 'Queue Cleared',
      message: 'All transactions removed from queue',
      duration: 2000,
    });
  }, [addNotification]);

  return {
    queue,
    processing,
    enqueue,
    dequeue,
    reorder,
    processQueue,
    clearCompleted,
    clearQueue,
    pendingCount: queue.filter(tx => tx.status === 'pending').length,
    completedCount: queue.filter(tx => tx.status === 'completed').length,
  };
}

