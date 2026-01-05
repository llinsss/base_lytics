import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface RebalanceStrategy {
  id: string;
  name: string;
  allocations: { [asset: string]: number };
  frequency: 'daily' | 'weekly' | 'monthly';
  threshold: number; // Percentage deviation to trigger rebalance
  active: boolean;
  lastRebalance?: Date;
  nextRebalance?: Date;
}

interface PortfolioAsset {
  symbol: string;
  balance: number;
  value: number;
  targetAllocation: number;
  currentAllocation: number;
  deviation: number;
}

export function usePortfolioRebalancing() {
  const { addNotification } = useNotifications();
  const [strategies, setStrategies] = useState<RebalanceStrategy[]>([
    {
      id: '1',
      name: 'Conservative Mix',
      allocations: { ETH: 40, BTC: 30, USDC: 30 },
      frequency: 'weekly',
      threshold: 5,
      active: true,
      lastRebalance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextRebalance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [currentPortfolio] = useState<PortfolioAsset[]>([
    { symbol: 'ETH', balance: 2.5, value: 5000, targetAllocation: 40, currentAllocation: 45, deviation: 5 },
    { symbol: 'BTC', balance: 0.1, value: 3000, targetAllocation: 30, currentAllocation: 27, deviation: -3 },
    { symbol: 'USDC', balance: 3100, value: 3100, targetAllocation: 30, currentAllocation: 28, deviation: -2 }
  ]);

  const createStrategy = async (
    name: string,
    allocations: { [asset: string]: number },
    frequency: RebalanceStrategy['frequency'],
    threshold: number
  ) => {
    try {
      addNotification({ title: 'Rebalancing', message: 'Creating strategy...', type: 'info' });
      
      const strategy: RebalanceStrategy = {
        id: Date.now().toString(),
        name,
        allocations,
        frequency,
        threshold,
        active: false
      };
      
      setStrategies(prev => [...prev, strategy]);
      addNotification({ title: 'Success', message: 'Rebalancing strategy created!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to create strategy', type: 'error' });
    }
  };

  const executeRebalance = async (strategyId: string) => {
    try {
      addNotification({ title: 'Rebalancing', message: 'Executing rebalance...', type: 'info' });
      
      // Simulate rebalancing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setStrategies(prev => prev.map(strategy =>
        strategy.id === strategyId
          ? { ...strategy, lastRebalance: new Date() }
          : strategy
      ));
      
      addNotification({ title: 'Success', message: 'Portfolio rebalanced successfully!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Rebalancing failed', type: 'error' });
    }
  };

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(strategy =>
      strategy.id === strategyId
        ? { ...strategy, active: !strategy.active }
        : strategy
    ));
  };

  return {
    strategies,
    currentPortfolio,
    createStrategy,
    executeRebalance,
    toggleStrategy
  };
}