import React, { useState, useMemo, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { downloadCSV, formatDateForExport } from '../utils/export';
import { useDebounce } from '../hooks/useDebounce';
import { VirtualList } from './VirtualList';
import { TableSkeleton } from './LoadingSkeleton';
import { formatAddress } from '../utils/validation';

type TransactionFilter = 'all' | 'pending' | 'confirmed' | 'failed';
type TransactionType = 'all' | 'transfer' | 'mint' | 'stake' | 'nft' | 'swap';

export function EnhancedTransactionHistory() {
  const { address } = useAccount();
  const { transactions, loading, error, reload } = useTransactionHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [dateRange, setDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => {
        const txType = tx.type?.toLowerCase() || '';
        return txType.includes(typeFilter);
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - ranges[dateRange];
      filtered = filtered.filter(tx => tx.timestamp >= cutoff);
    }

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(tx => {
        return (
          tx.hash?.toLowerCase().includes(search) ||
          tx.type?.toLowerCase().includes(search) ||
          tx.description?.toLowerCase().includes(search) ||
          tx.from?.toLowerCase().includes(search) ||
          tx.to?.toLowerCase().includes(search) ||
          tx.contract?.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }, [transactions, statusFilter, typeFilter, dateRange, debouncedSearch]);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = filteredTransactions.map(tx => ({
      Hash: tx.hash || '',
      Type: tx.type || '',
      Status: tx.status || '',
      From: tx.from || '',
      To: tx.to || '',
      Amount: tx.value ? formatEther(BigInt(tx.value)) : '',
      Contract: tx.contract || '',
      Description: tx.description || '',
      Block: tx.blockNumber || '',
      Timestamp: formatDateForExport(tx.timestamp),
      Date: new Date(tx.timestamp).toLocaleString(),
    }));

    downloadCSV(exportData, `transactions-${Date.now()}`);
  }, [filteredTransactions]);

  if (!address) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Connect your wallet to view transaction history
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-white mb-1">Transaction History</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reload}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search transactions (hash, address, type...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionFilter)}
              className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
              className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All</option>
              <option value="transfer">Transfer</option>
              <option value="mint">Mint</option>
              <option value="stake">Stake</option>
              <option value="nft">NFT</option>
              <option value="swap">Swap</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Period:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="text-center py-8 text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
          {filteredTransactions.length > 50 ? (
            <VirtualList
              items={filteredTransactions}
              itemHeight={80}
              containerHeight={600}
              renderItem={(tx, index) => (
                <TransactionRow key={tx.hash || index} transaction={tx} />
              )}
            />
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((tx, index) => (
                <TransactionRow key={tx.hash || index} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Transaction Row Component
function TransactionRow({ transaction }: { transaction: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
            <span className="text-sm font-medium dark:text-white">
              {transaction.type || 'Transaction'}
            </span>
          </div>
          {transaction.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {transaction.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
            {transaction.hash && (
              <span className="font-mono">
                {formatAddress(transaction.hash, 8, 6)}
              </span>
            )}
            {transaction.from && (
              <span>
                From: <span className="font-mono">{formatAddress(transaction.from)}</span>
              </span>
            )}
            {transaction.to && (
              <span>
                To: <span className="font-mono">{formatAddress(transaction.to)}</span>
              </span>
            )}
            {transaction.blockNumber && (
              <span>Block: {transaction.blockNumber}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {transaction.amount && (
            <div className="text-right">
              <div className="font-semibold dark:text-white">
                {formatEther(transaction.amount as bigint)} ETH
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(transaction.timestamp).toLocaleString()}
          </div>
          {transaction.hash && (
            <a
              href={`https://basescan.org/tx/${transaction.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-base-600 hover:text-base-700 dark:text-base-400 dark:hover:text-base-300"
            >
              View on Explorer →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


