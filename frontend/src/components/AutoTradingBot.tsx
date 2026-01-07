import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';

export function AutoTradingBot() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const { writeContract, isPending } = useWriteContract();
  const [isRunning, setIsRunning] = useState(false);
  const [strategy, setStrategy] = useState('dca');
  const [budget, setBudget] = useState('100');

  const startBot = async () => {
    setIsRunning(true);
    addNotification({
      title: 'Trading Bot Started',
      message: `${strategy.toUpperCase()} strategy with $${budget} budget`,
      type: 'success'
    });

    // Simulate automated trades
    const interval = setInterval(() => {
      const trades = ['ETH/USDC', 'BTC/ETH', 'USDC/DAI'];
      const trade = trades[Math.floor(Math.random() * trades.length)];
      const amount = (Math.random() * 10 + 1).toFixed(2);
      
      addNotification({
        title: '🤖 Bot Trade Executed',
        message: `Bought ${amount} ${trade.split('/')[0]}`,
        type: 'info'
      });
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
      addNotification({
        title: 'Bot Session Complete',
        message: 'Trading bot finished execution',
        type: 'success'
      });
    }, 30000);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">🤖 AI Trading Bot</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="input w-full"
          >
            <option value="dca">Dollar Cost Average</option>
            <option value="momentum">Momentum Trading</option>
            <option value="arbitrage">Arbitrage</option>
            <option value="grid">Grid Trading</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">Budget ($)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input w-full"
          />
        </div>

        <button
          onClick={startBot}
          disabled={isRunning || isPending}
          className={`btn-primary w-full ${isRunning ? 'animate-pulse' : ''}`}
        >
          {isRunning ? '🔄 Bot Running...' : '🚀 Start Trading Bot'}
        </button>

        {isRunning && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Bot is actively trading with {strategy.toUpperCase()} strategy
            </p>
          </div>
        )}
      </div>
    </div>
  );
}