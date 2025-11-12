import React from 'react';
import { Transaction } from '../types/transactions';
import { formatEther } from 'viem';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'token_transfer': return '🪙';
      case 'nft_mint': return '🎨';
      case 'stake': return '🔒';
      case 'unstake': return '🔓';
      case 'claim': return '💰';
      case 'approve': return '✓';
      default: return '📝';
    }
  };

  const formatValue = (value?: string) => {
    if (!value) return '';
    try {
      return parseFloat(formatEther(BigInt(value))).toFixed(4);
    } catch {
      return value;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getExplorerUrl = (hash: string) => {
    // Base Sepolia explorer
    return `https://sepolia.basescan.org/tx/${hash}`;
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTypeIcon(transaction.type)}</span>
          <span className="text-lg">{getStatusIcon(transaction.status)}</span>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{transaction.description}</h3>
            <span className={`text-sm ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Contract: {transaction.contract}</p>
            {transaction.blockNumber && (
              <p>Block: {transaction.blockNumber.toLocaleString()}</p>
            )}
            <p>{formatTimestamp(transaction.timestamp)}</p>
          </div>
        </div>
      </div>

      <div className="text-right">
        {transaction.value && (
          <p className="font-mono text-sm mb-1">
            {formatValue(transaction.value)} tokens
          </p>
        )}
        
        {transaction.gasUsed && (
          <p className="text-xs text-gray-500">
            Gas: {parseInt(transaction.gasUsed).toLocaleString()}
          </p>
        )}
        
        <a
          href={getExplorerUrl(transaction.hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-base-600 hover:text-base-700 underline"
        >
          View on Explorer
        </a>
      </div>
    </div>
  );
}