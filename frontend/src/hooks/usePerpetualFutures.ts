import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface PerpPosition {
  id: string;
  asset: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  leverage: number;
  pnl: number;
  fundingRate: number;
}

export function usePerpetualFutures() {
  const { addNotification } = useNotifications();
  const [positions, setPositions] = useState<PerpPosition[]>([]);
  const [leverage, setLeverage] = useState(10);

  const openPosition = async (asset: string, side: 'long' | 'short', size: number) => {
    try {
      addNotification({ title: 'Futures', message: 'Opening position...', type: 'info' });
      
      const position: PerpPosition = {
        id: Date.now().toString(),
        asset,
        side,
        size,
        entryPrice: 2000 + Math.random() * 100,
        leverage,
        pnl: 0,
        fundingRate: 0.01
      };
      
      setPositions(prev => [...prev, position]);
      addNotification({ title: 'Success', message: 'Position opened!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to open position', type: 'error' });
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      addNotification({ title: 'Futures', message: 'Closing position...', type: 'info' });
      setPositions(prev => prev.filter(p => p.id !== positionId));
      addNotification({ title: 'Success', message: 'Position closed!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to close position', type: 'error' });
    }
  };

  return { positions, leverage, setLeverage, openPosition, closePosition };
}