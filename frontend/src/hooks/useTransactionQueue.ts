import { useState, useCallback, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';
import { parseTransactionError } from '../utils/transactionErrors';

export interface QueuedTransaction {
  id: string;
  type: string;
  description: string;
  to?: `0x${string}`;
  data?: `0x${string}`;
  value?: bigint;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  status: 'queued' | 'pending' | 'confirming' | 'success' | 'failed';
  hash?: `0x${string}`;
  error?: string;
  timestamp: number;
  priority: number; // Higher = higher priority
}

interface TransactionQueueOptions {
  executeOnAdd?: boolean;
  autoExecute?: boolean;
  maxConcurrent?: number;
}

export function useTransactionQueue(options: TransactionQueueOptions = {}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { addNotification } = useNotifications();
  const [queue, setQueue] = useState<QueuedTransaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    executeOnAdd = false,
    autoExecute = true,
    maxConcurrent = 1,
  } = options;

  /**
   * Add transaction to queue
   */
  const addToQueue = useCallback((
    tx: Omit<QueuedTransaction, 'id' | 'status' | 'timestamp'>
  ) => {
    const queuedTx: QueuedTransaction = {
      ...tx,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'queued',
      timestamp: Date.now(),
    };

    setQueue(prev => {
      const newQueue = [...prev, queuedTx];
      // Sort by priority (higher first), then by timestamp
      return newQueue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });
    });

    addNotification({
      type: 'info',
      title: 'Transaction Queued',
      message: tx.description,
      duration: 3000,
    });

    if (executeOnAdd) {
      processQueue();
    }

    return queuedTx.id;
  }, [executeOnAdd, addNotification]);

  /**
   * Remove transaction from queue
   */
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(tx => tx.id !== id));
  }, []);

  /**
   * Update transaction status
   */
  const updateTransaction = useCallback((
    id: string,
    updates: Partial<QueuedTransaction>
  ) => {
    setQueue(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  /**
   * Reorder queue
   */
  const reorderQueue = useCallback((ids: string[]) => {
    setQueue(prev => {
      const txMap = new Map(prev.map(tx => [tx.id, tx]));
      const reordered = ids.map(id => txMap.get(id)).filter(Boolean) as QueuedTransaction[];
      const remaining = prev.filter(tx => !ids.includes(tx.id));
      return [...reordered, ...remaining];
    });
  }, []);

  /**
   * Process next transaction in queue
   */
  const processNext = useCallback(async () => {
    if (!address || !publicClient || isProcessing) return;

    const queuedTx = queue.find(tx => tx.status === 'queued');
    if (!queuedTx) return;

    setIsProcessing(true);
    updateTransaction(queuedTx.id, { status: 'pending' });

    try {
      // Here you would use your wallet provider to send the transaction
      // This is a placeholder - you'd integrate with wagmi's useWriteContract or similar
      addNotification({
        type: 'info',
        title: 'Executing Transaction',
        message: queuedTx.description,
        duration: 3000,
      });

      // Simulate transaction execution
      // In real implementation, you'd call your contract write function here
      // const hash = await writeContract(...);
      
      // updateTransaction(queuedTx.id, {
      //   status: 'confirming',
      //   hash,
      // });

      // For now, mark as success after a delay (simulation)
      setTimeout(() => {
        updateTransaction(queuedTx.id, {
          status: 'success',
        });
        setIsProcessing(false);
        if (autoExecute) {
          processNext();
        }
      }, 2000);
    } catch (error: any) {
      const parsedError = parseTransactionError(error);
      updateTransaction(queuedTx.id, {
        status: 'failed',
        error: parsedError.message,
      });
      addNotification({
        type: 'error',
        title: 'Transaction Failed',
        message: parsedError.message,
        duration: 5000,
      });
      setIsProcessing(false);
      if (autoExecute) {
        processNext();
      }
    }
  }, [queue, address, publicClient, isProcessing, updateTransaction, addNotification, autoExecute]);

  /**
   * Process entire queue
   */
  const processQueue = useCallback(() => {
    if (!isProcessing && autoExecute) {
      processNext();
    }
  }, [isProcessing, autoExecute, processNext]);

  /**
   * Clear completed transactions
   */
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(tx =>
      tx.status !== 'success' && tx.status !== 'failed'
    ));
  }, []);

  /**
   * Clear all transactions
   */
  const clearAll = useCallback(() => {
    setQueue([]);
  }, []);

  // Auto-process queue when transactions are added
  useEffect(() => {
    if (autoExecute && !isProcessing && queue.some(tx => tx.status === 'queued')) {
      processNext();
    }
  }, [queue, autoExecute, isProcessing, processNext]);

  return {
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    updateTransaction,
    reorderQueue,
    processQueue,
    processNext,
    clearCompleted,
    clearAll,
    queuedCount: queue.filter(tx => tx.status === 'queued').length,
    pendingCount: queue.filter(tx => tx.status === 'pending' || tx.status === 'confirming').length,
  };
}
