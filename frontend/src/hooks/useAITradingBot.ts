import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface TradingStrategy {
  id: string;
  name: string;
  type: 'dca' | 'momentum' | 'arbitrage' | 'grid';
  active: boolean;
  profit: number;
  trades: number;
}

export function useAITradingBot() {
  const { addNotification } = useNotifications();
  const [strategies, setStrategies] = useState<TradingStrategy[]>([
    { id: '1', name: 'DCA ETH/BLT', type: 'dca', active: true, profit: 12.5, trades: 24 },
    { id: '2', name: 'Momentum Scanner', type: 'momentum', active: false, profit: 8.3, trades: 15 },
    { id: '3', name: 'Grid Trading', type: 'grid', active: true, profit: 15.7, trades: 45 }
  ]);

  const [botStatus, setBotStatus] = useState<'running' | 'paused' | 'stopped'>('running');

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
    addNotification({ title: 'Strategy updated', type: 'success' });
  };

  const createStrategy = (name: string, type: TradingStrategy['type']) => {
    const newStrategy: TradingStrategy = {
      id: Date.now().toString(),
      name,
      type,
      active: false,
      profit: 0,
      trades: 0
    };
    setStrategies(prev => [...prev, newStrategy]);
    addNotification({ title: 'Strategy created', type: 'success' });
  };

  return { strategies, botStatus, setBotStatus, toggleStrategy, createStrategy };
}