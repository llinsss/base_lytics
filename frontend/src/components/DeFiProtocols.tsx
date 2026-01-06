import React, { useState } from 'react';
import { useDeFiProtocols } from '../hooks/useDeFiProtocols';

export function DeFiProtocols() {
  const { 
    protocols, 
    loading, 
    getProtocolsByCategory, 
    getBestYields, 
    swapTokens, 
    lendToken, 
    stakeToken 
  } = useDeFiProtocols();

  const [activeTab, setActiveTab] = useState<'swap' | 'lend' | 'stake'>('swap');
  const [swapForm, setSwapForm] = useState({ from: 'ETH', to: 'USDC', amount: '' });
  const [lendForm, setLendForm] = useState({ token: 'USDC', amount: '', protocol: 'Aave' });
  const [stakeForm, setStakeForm] = useState({ token: 'ETH', amount: '', protocol: 'Lido' });

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (swapForm.amount) {
      await swapTokens(swapForm.from, swapForm.to, Number(swapForm.amount));
      setSwapForm({ ...swapForm, amount: '' });
    }
  };

  const handleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lendForm.amount) {
      await lendToken(lendForm.token, Number(lendForm.amount), lendForm.protocol);
      setLendForm({ ...lendForm, amount: '' });
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stakeForm.amount) {
      await stakeToken(stakeForm.token, Number(stakeForm.amount), stakeForm.protocol);
      setStakeForm({ ...stakeForm, amount: '' });
    }
  };

  const tabs = [
    { id: 'swap', label: '🔄 Swap', icon: '🔄' },
    { id: 'lend', label: '💰 Lend', icon: '💰' },
    { id: 'stake', label: '🥩 Stake', icon: '🥩' }
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">DeFi Protocols</h3>
        
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'swap' && (
          <form onSubmit={handleSwap} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">From</label>
                <select
                  value={swapForm.from}
                  onChange={(e) => setSwapForm({ ...swapForm, from: e.target.value })}
                  className="input w-full"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">To</label>
                <select
                  value={swapForm.to}
                  onChange={(e) => setSwapForm({ ...swapForm, to: e.target.value })}
                  className="input w-full"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDT">USDT</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
              <input
                type="number"
                step="any"
                value={swapForm.amount}
                onChange={(e) => setSwapForm({ ...swapForm, amount: e.target.value })}
                className="input w-full"
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !swapForm.amount}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Swapping...' : 'Swap Tokens'}
            </button>
          </form>
        )}

        {activeTab === 'lend' && (
          <form onSubmit={handleLend} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Token</label>
                <select
                  value={lendForm.token}
                  onChange={(e) => setLendForm({ ...lendForm, token: e.target.value })}
                  className="input w-full"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="DAI">DAI</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Protocol</label>
                <select
                  value={lendForm.protocol}
                  onChange={(e) => setLendForm({ ...lendForm, protocol: e.target.value })}
                  className="input w-full"
                >
                  <option value="Aave">Aave</option>
                  <option value="Compound">Compound</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
              <input
                type="number"
                step="any"
                value={lendForm.amount}
                onChange={(e) => setLendForm({ ...lendForm, amount: e.target.value })}
                className="input w-full"
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !lendForm.amount}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Lending...' : 'Lend Tokens'}
            </button>
          </form>
        )}

        {activeTab === 'stake' && (
          <form onSubmit={handleStake} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Token</label>
                <select
                  value={stakeForm.token}
                  onChange={(e) => setStakeForm({ ...stakeForm, token: e.target.value })}
                  className="input w-full"
                >
                  <option value="ETH">ETH</option>
                  <option value="MATIC">MATIC</option>
                  <option value="DOT">DOT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Protocol</label>
                <select
                  value={stakeForm.protocol}
                  onChange={(e) => setStakeForm({ ...stakeForm, protocol: e.target.value })}
                  className="input w-full"
                >
                  <option value="Lido">Lido</option>
                  <option value="Rocket Pool">Rocket Pool</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
              <input
                type="number"
                step="any"
                value={stakeForm.amount}
                onChange={(e) => setStakeForm({ ...stakeForm, amount: e.target.value })}
                className="input w-full"
                placeholder="0.0"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !stakeForm.amount}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Staking...' : 'Stake Tokens'}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Protocol TVL</h3>
          <div className="space-y-3">
            {protocols.map(protocol => (
              <div key={protocol.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="font-medium dark:text-white">{protocol.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 capitalize">
                    {protocol.category}
                  </span>
                </div>
                <span className="font-semibold dark:text-white">
                  ${(protocol.tvl / 1000000000).toFixed(1)}B
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Best Yields</h3>
          <div className="space-y-3">
            {getBestYields().map(protocol => (
              <div key={protocol.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium dark:text-white">{protocol.name}</span>
                <span className="font-semibold text-green-500">{protocol.apy}% APY</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}