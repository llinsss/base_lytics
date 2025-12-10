import React, { useState } from 'react';
import { useCrossChainBridge } from '../hooks/useCrossChainBridge';

export function CrossChainBridge() {
  const { chains, bridge, transactions, isPending } = useCrossChainBridge();
  const [fromChain, setFromChain] = useState(chains[0]);
  const [toChain, setToChain] = useState(chains[1]);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('ETH');

  const handleBridge = () => {
    if (amount && fromChain.id !== toChain.id) {
      bridge(fromChain, toChain, amount, token);
      setAmount('');
    }
  };

  const swapChains = () => {
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">🌉 Cross-Chain Bridge</h2>
      
      <div className="card">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">From Chain</label>
            <select
              value={fromChain.id}
              onChange={(e) => setFromChain(chains.find(c => c.id === Number(e.target.value))!)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swapChains}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ↕️
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">To Chain</label>
            <select
              value={toChain.id}
              onChange={(e) => setToChain(chains.find(c => c.id === Number(e.target.value))!)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="ETH">ETH</option>
                <option value="BLT">BLT</option>
                <option value="USDC">USDC</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800 dark:text-blue-200">Bridge Fee:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">0.1%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-800 dark:text-blue-200">Estimated Time:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">5-10 minutes</span>
            </div>
          </div>

          <button
            onClick={handleBridge}
            disabled={isPending || !amount || fromChain.id === toChain.id}
            className="btn-primary w-full"
          >
            {isPending ? 'Bridging...' : 'Bridge Assets'}
          </button>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Bridge History</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium dark:text-white">
                    {tx.amount} {tx.token}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {tx.fromChain.icon} {tx.fromChain.name} → {tx.toChain.icon} {tx.toChain.name}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  tx.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}