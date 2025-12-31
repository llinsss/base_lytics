import React, { useState, useMemo, useCallback } from 'react';
import { useTokenBalance, useTokenTransfer } from '../hooks';
import { formatEther, parseEther, isAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Skeleton } from './LoadingSkeleton';
import { useNotifications } from '../contexts/NotificationContext';

export const TokenCard = React.memo(function TokenCard() {
  const { address } = useAccount();
  const { balance, isLoading } = useTokenBalance();
  const { transfer, isPending } = useTokenTransfer();
  const { addNotification } = useNotifications();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const isValidAddress = useMemo(() => recipient ? isAddress(recipient) : true, [recipient]);
  const isValidAmount = useMemo(() => amount ? parseFloat(amount) > 0 : true, [amount]);

  const handleTransfer = useCallback(() => {
    if (!recipient || !amount) {
      addNotification({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please fill in all fields',
        duration: 3000,
      });
      return;
    }

    if (!isValidAddress) {
      addNotification({
        type: 'error',
        title: 'Invalid Address',
        message: 'Please enter a valid Ethereum address',
        duration: 3000,
      });
      return;
    }

    if (!isValidAmount) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Amount must be greater than 0',
        duration: 3000,
      });
      return;
    }

    try {
      transfer(recipient, parseEther(amount));
      setRecipient('');
      setAmount('');
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Transfer Failed',
        message: error.message || 'Failed to initiate transfer',
        duration: 5000,
      });
    }
  }, [recipient, amount, isValidAddress, isValidAmount, transfer, addNotification]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Base Token</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
        {isLoading ? (
          <Skeleton height={32} width="60%" className="mt-2" />
        ) : (
          <p className="text-2xl font-bold dark:text-white">
            {formatEther(balance as bigint)} BLT
          </p>
        )}
      </div>

      {address && (
        <div className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Recipient address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                recipient && !isValidAddress ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {recipient && !isValidAddress && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Invalid address format
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                amount && !isValidAmount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {amount && !isValidAmount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Amount must be greater than 0
              </p>
            )}
          </div>
          <button
            onClick={handleTransfer}
            disabled={isPending || !recipient || !amount || !isValidAddress || !isValidAmount}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      )}
    </div>
  );
}););