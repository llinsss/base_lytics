import React, { useState } from 'react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { TransactionItem } from './TransactionItem';
import { ActivityFilter } from '../types/transactions';

export function ActivityFeed() {
  const { transactions, loading, error, reload } = useTransactionHistory();
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = transactions.filter(tx => {
    if (filter.type && tx.type !== filter.type) return false;
    if (filter.status && tx.status !== filter.status) return false;
    return true;
  });

  const exportTransactions = () => {
    const csvContent = [
      'Hash,Type,Status,Description,Contract,Block,Timestamp,Value,Gas Used',
      ...filteredTransactions.map(tx => [
        tx.hash,
        tx.type,
        tx.status,
        tx.description,
        tx.contract,
        tx.blockNumber || '',
        new Date(tx.timestamp).toISOString(),
        tx.value || '',
        tx.gasUsed || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baselytics-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Activity Feed</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-sm"
          >
            Filters
          </button>
          <button
            onClick={reload}
            className="btn-secondary text-sm"
          >
            Refresh
          </button>
          {filteredTransactions.length > 0 && (
            <button
              onClick={exportTransactions}
              className="btn-primary text-sm"
            >
              Export
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={filter.type || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="token_transfer">Token Transfer</option>
                <option value="nft_mint">NFT Mint</option>
                <option value="stake">Stake</option>
                <option value="unstake">Unstake</option>
                <option value="claim">Claim</option>
                <option value="approve">Approve</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value || undefined }))}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {transactions.length === 0 
                ? "Start interacting with contracts to see your activity here"
                : "No transactions match your current filters"
              }
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            {filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.hash}
                transaction={transaction}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}