import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Transaction {
  hash: string;
  type: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: string;
}

export function LiveTransactionMonitor() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Simulate live transaction monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random transaction activity
      if (Math.random() < 0.3) {
        const newTx: Transaction = {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          type: ['Mint', 'Transfer', 'Stake', 'Swap'][Math.floor(Math.random() * 4)],
          amount: (Math.random() * 100).toFixed(2),
          status: Math.random() < 0.8 ? 'confirmed' : 'pending',
          timestamp: new Date(),
          gasUsed: (Math.random() * 50000 + 21000).toFixed(0)
        };

        setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Mint': return '🪙';
      case 'Transfer': return '📤';
      case 'Stake': return '🥩';
      case 'Swap': return '🔄';
      default: return '📋';
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Live Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">Monitoring for activity...</p>
          </div>
        ) : (
          transactions.map(tx => (
            <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getTypeIcon(tx.type)}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium dark:text-white">{tx.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tx.amount} BLT • {tx.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-mono text-gray-500">
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                </p>
                {tx.gasUsed && (
                  <p className="text-xs text-gray-400">
                    Gas: {parseInt(tx.gasUsed).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-semibold text-green-500">
                {transactions.filter(tx => tx.status === 'confirmed').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Confirmed</p>
            </div>
            <div>
              <p className="font-semibold text-yellow-500">
                {transactions.filter(tx => tx.status === 'pending').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div>
              <p className="font-semibold dark:text-white">
                {transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toFixed(2)}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Volume</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}