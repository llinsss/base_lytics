import React, { useState } from 'react';
import { useFlashLoans } from '../hooks/useFlashLoans';

export function FlashLoans() {
  const { loans, executeFlashLoan } = useFlashLoans();
  const [asset, setAsset] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [strategy, setStrategy] = useState('arbitrage');

  const handleExecute = () => {
    if (amount) {
      executeFlashLoan(asset, Number(amount), strategy);
      setAmount('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">⚡ Flash Loans</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Execute Flash Loan</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="DAI">DAI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
              <input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="arbitrage">Arbitrage</option>
                <option value="liquidation">Liquidation</option>
                <option value="refinancing">Refinancing</option>
              </select>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg text-sm">
              <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Flash Loan Details</div>
              <div className="text-yellow-700 dark:text-yellow-300">
                <div>Fee: 0.09% ({amount ? (Number(amount) * 0.0009).toFixed(2) : '0'} {asset})</div>
                <div>Must be repaid in same transaction</div>
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={!amount}
              className="btn-primary w-full"
            >
              Execute Flash Loan
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Flash Loan History</h3>
          
          {loans.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No flash loans executed</p>
          ) : (
            <div className="space-y-3">
              {loans.slice(0, 5).map((loan) => (
                <div key={loan.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium dark:text-white">
                        {loan.amount} {loan.asset}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {loan.strategy}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${loan.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {loan.profit >= 0 ? '+' : ''}{loan.profit.toFixed(2)} {loan.asset}
                      </div>
                      <div className="text-xs text-gray-500">
                        Fee: {loan.fee.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(loan.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}