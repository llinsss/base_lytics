import { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface TransactionState {
  hash?: string;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function useTransactionNotifications(
  transaction: TransactionState,
  options: {
    pendingTitle?: string;
    successTitle?: string;
    errorTitle?: string;
    onSuccess?: () => void;
  } = {}
) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (transaction.isPending && transaction.hash) {
      addNotification({
        type: 'info',
        title: options.pendingTitle || 'Transaction Submitted',
        message: 'Please wait for confirmation...',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'View on Explorer',
          onClick: () => window.open(`https://sepolia.basescan.org/tx/${transaction.hash}`, '_blank')
        }
      });
    }
  }, [transaction.isPending, transaction.hash, addNotification, options.pendingTitle]);

  useEffect(() => {
    if (transaction.isConfirming) {
      addNotification({
        type: 'warning',
        title: 'Confirming Transaction',
        message: 'Waiting for block confirmation...',
        duration: 3000
      });
    }
  }, [transaction.isConfirming, addNotification]);

  useEffect(() => {
    if (transaction.isSuccess) {
      addNotification({
        type: 'success',
        title: options.successTitle || 'Transaction Successful',
        message: 'Your transaction has been confirmed!',
        duration: 5000,
        action: transaction.hash ? {
          label: 'View Transaction',
          onClick: () => window.open(`https://sepolia.basescan.org/tx/${transaction.hash}`, '_blank')
        } : undefined
      });

      if (options.onSuccess) {
        options.onSuccess();
      }
    }
  }, [transaction.isSuccess, transaction.hash, addNotification, options]);

  useEffect(() => {
    if (transaction.error) {
      addNotification({
        type: 'error',
        title: options.errorTitle || 'Transaction Failed',
        message: transaction.error.message || 'An error occurred during the transaction',
        duration: 8000
      });
    }
  }, [transaction.error, addNotification, options.errorTitle]);
}