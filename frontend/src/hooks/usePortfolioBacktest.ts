import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface BacktestResult {
  id: string;
  strategy: string;
  period: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}

export function usePortfolioBacktest() {
  const { addNotification } = useNotifications();
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runBacktest = async (strategy: string, period: string, allocation: any) => {
    setIsRunning(true);
    try {
      addNotification({ title: 'Backtest', message: 'Running backtest...', type: 'info' });
      
      // Simulate backtest
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result: BacktestResult = {
        id: Date.now().toString(),
        strategy,
        period,
        totalReturn: Math.random() * 200 - 50, // -50% to +150%
        sharpeRatio: Math.random() * 3,
        maxDrawdown: Math.random() * -30,
        winRate: 50 + Math.random() * 40, // 50-90%
        trades: Math.floor(Math.random() * 100) + 10
      };
      
      setResults(prev => [result, ...prev]);
      addNotification({ title: 'Success', message: 'Backtest completed!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Backtest failed', type: 'error' });
    } finally {
      setIsRunning(false);
    }
  };

  return { results, isRunning, runBacktest };
}