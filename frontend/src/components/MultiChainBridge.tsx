import React, { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';

export function MultiChainBridge() {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { addNotification } = useNotifications();
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('base');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('ETH');

  const chains = [
    { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
    { id: 'base', name: 'Base', icon: '🔵' },
    { id: 'polygon', name: 'Polygon', icon: '🟣' },
    { id: 'arbitrum', name: 'Arbitrum', icon: '🔷' },
    { id: 'optimism', name: 'Optimism', icon: '🔴' }
  ];

  const bridgeTokens = async () => {
    if (!amount) return;

    addNotification({
      title: 'Bridge Transaction Started',
      message: `Bridging ${amount} ${token} from ${fromChain} to ${toChain}`,
      type: 'info'
    });

    // Simulate bridge process
    setTimeout(() => {
      addNotification({
        title: 'Bridge Complete',
        message: `Successfully bridged ${amount} ${token}`,
        type: 'success'
      });
    }, 3000);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">🌉 Cross-Chain Bridge</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">From</label>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="input w-full"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">To</label>
            <select
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
              className="input w-full"
            >
              {chains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Token</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="input w-full"
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="DAI">DAI</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
              placeholder="0.0"
            />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚡ Estimated time: 2-5 minutes • Fee: ~$2.50
          </p>
        </div>

        <button
          onClick={bridgeTokens}
          disabled={!amount}
          className="btn-primary w-full"
        >
          🌉 Bridge {amount} {token}
        </button>
      </div>
    </div>
  );
}