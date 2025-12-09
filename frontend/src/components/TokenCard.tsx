import React, { useState } from 'react';
import { useTokenBalance, useTokenTransfer } from '../hooks';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';

export function TokenCard() {
  const { address } = useAccount();
  const { balance, isLoading } = useTokenBalance();
  const { transfer, isPending } = useTokenTransfer();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = () => {
    if (recipient && amount) {
      transfer(recipient, parseEther(amount));
      setRecipient('');
      setAmount('');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Base Token</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
        <p className="text-2xl font-bold dark:text-white">
          {isLoading ? '...' : formatEther(balance as bigint)} BLT
        </p>
      </div>

      {address && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleTransfer}
            disabled={isPending || !recipient || !amount}
            className="btn-primary w-full"
          >
            {isPending ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      )}
    </div>
  );
}