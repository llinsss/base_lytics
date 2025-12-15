import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface Option {
  id: string;
  type: 'call' | 'put';
  strike: number;
  expiry: Date;
  premium: number;
  underlying: string;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export function useOptionsTrading() {
  const { addNotification } = useNotifications();
  const [options] = useState<Option[]>([
    {
      id: '1',
      type: 'call',
      strike: 2000,
      expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      premium: 0.05,
      underlying: 'ETH',
      delta: 0.65,
      gamma: 0.02,
      theta: -0.01,
      vega: 0.15
    },
    {
      id: '2',
      type: 'put',
      strike: 1800,
      expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      premium: 0.03,
      underlying: 'ETH',
      delta: -0.35,
      gamma: 0.02,
      theta: -0.008,
      vega: 0.12
    }
  ]);

  const [positions, setPositions] = useState<any[]>([]);

  const buyOption = async (optionId: string, quantity: number) => {
    try {
      addNotification({ title: 'Buying option...', type: 'info' });
      const option = options.find(o => o.id === optionId);
      if (option) {
        const newPosition = {
          id: Date.now().toString(),
          option,
          quantity,
          side: 'long',
          entryPrice: option.premium,
          timestamp: Date.now()
        };
        setPositions(prev => [...prev, newPosition]);
        addNotification({ title: 'Option purchased successfully!', type: 'success' });
      }
    } catch (error) {
      addNotification({ title: 'Option purchase failed', type: 'error' });
    }
  };

  const sellOption = async (optionId: string, quantity: number) => {
    try {
      addNotification({ title: 'Selling option...', type: 'info' });
      const option = options.find(o => o.id === optionId);
      if (option) {
        const newPosition = {
          id: Date.now().toString(),
          option,
          quantity,
          side: 'short',
          entryPrice: option.premium,
          timestamp: Date.now()
        };
        setPositions(prev => [...prev, newPosition]);
        addNotification({ title: 'Option sold successfully!', type: 'success' });
      }
    } catch (error) {
      addNotification({ title: 'Option sale failed', type: 'error' });
    }
  };

  return { options, positions, buyOption, sellOption };
}