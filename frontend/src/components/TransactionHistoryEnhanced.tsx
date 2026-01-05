import React, { useState, useMemo, useCallback } from 'react';
import { useTransactionHistory } from '../hooks/useTransactionHistory';
import { downloadCSV, formatDateForExport } from '../utils/export';
import { useDebounce } from '../hooks/useDebounce';
import { TableSkeleton } from './LoadingSkeleton';

type FilterType = 'all' | 'token_transfer' | 'nft_mint' | 'nft_transfer' | 'stake' | 'unstake';
type FilterStatus = 'all' | 'pending' | 'confirmed' | 'failed';

export function TransactionHistoryEnhanced() {
  const { transactions, loading, error } = useTransactionHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => {
        if (filterType === 'token_transfer') return tx.type === 'token_transfer';
        if (filterType === 'nft_mint') return tx.type === 'nft_mint';
        if (filterType === 'nft_transfer') return tx.type === 'token_transfer';
        if (filterType === 'stake') return tx.type === 'stake';
        if (filterType === 'unstake') return tx.type === 'unstake';
        return true;
      });
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    // Search
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.hash?.toLowerCase().includes(searchLower) ||
        tx.description?.toLowerCase().includes(searchLower) ||
        tx.from?.toLowerCase().includes(searchLower) ||
        tx.to?.toLowerCase().includes(searchLower) ||
        tx.contract?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [transactions, filterType, filterStatus, debouncedSearch]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Export to CSV
  const handleExport = useCallback(() => {
    const exportData = filteredTransactions.map(tx => ({
      Hash: tx.hash || '',
      Type: tx.type || '',
      Status: tx.status || '',
      From: tx.from || '',
      To: tx.to || '',
      Description: tx.description || '',
      Contract: tx.contract || '',
      Block: tx.blockNumber?.toString() || '',
      Timestamp: formatDateForExport(tx.timestamp),
    }));

    downloadCSV(exportData, `transactions-${Date.now()}`);
  }, [filteredTransactions]);

  const handleExportAll = useCallback(() => {
    const exportData = transactions.map(tx => ({
      Hash: tx.hash || '',
      Type: tx.type || '',
      Status: tx.status || '',
      From: tx.from || '',
      To: tx.to || '',
      Description: tx.description || '',
      Contract: tx.contract || '',
      Block: tx.blockNumber?.toString() || '',
      Timestamp: formatDateForExport(tx.timestamp),
    }));

    downloadCSV(exportData, `all-transactions-${Date.now()}`);
  }, [transactions]);

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading transactions</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold dark:text-white">Transaction History</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Filtered ({filteredTransactions.length})
          </button>
          <button
            onClick={handleExportAll}
            disabled={transactions.length === 0}
            className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export All ({transactions.length})
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by hash, address, description..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as FilterType);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="token_transfer">Token Transfer</option>
            <option value="nft_mint">NFT Mint</option>
            <option value="nft_transfer">NFT Transfer</option>
            <option value="stake">Stake</option>
            <option value="unstake">Unstake</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as FilterStatus);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        </div>
      </div>

      {/* Transaction List */}
      {paginatedTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {filteredTransactions.length === 0 && transactions.length > 0
              ? 'No transactions match your filters'
              : 'No transactions found'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Hash</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.hash || tx.timestamp}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium dark:text-white capitalize">
                        {tx.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : tx.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {tx.description || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {tx.hash ? (
                        <a
                          href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-base-600 hover:text-base-700 dark:text-base-400 dark:hover:text-base-300 font-mono"
                        >
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

