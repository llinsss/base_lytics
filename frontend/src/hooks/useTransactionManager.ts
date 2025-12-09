import { useState, useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';

interface Transaction {
  hash: `0x${string}`;
  type: string;
  status: 'pending' | 'confirming' | 'success' | 'error';
  timestamp: number;
}

export function useTransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { addNotification } = useNotifications();

  const addTransaction = (hash: `0x${string}`, type: string) => {
    const tx: Transaction = {
      hash,
      type,
      status: 'pending',
      timestamp: Date.now()
    };
    setTransactions(prev => [tx, ...prev]);
    addNotification({ title: `${type} transaction submitted`, type: 'info' });
  };

  const updateTransactionStatus = (hash: `0x${string}`, status: Transaction['status']) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.hash === hash ? { ...tx, status } : tx
      )
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransactionStatus
  };
}