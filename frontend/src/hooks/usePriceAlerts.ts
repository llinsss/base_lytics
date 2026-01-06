import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface PriceAlert {
  id: string;
  asset: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

export function usePriceAlerts() {
  const { addNotification } = useNotifications();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  const createAlert = (asset: string, targetPrice: number, condition: 'above' | 'below') => {
    const alert: PriceAlert = {
      id: Date.now().toString(),
      asset,
      targetPrice,
      condition,
      isActive: true,
      createdAt: new Date()
    };
    setAlerts(prev => [...prev, alert]);
    addNotification({ title: 'Alert Created', message: `Price alert set for ${asset}`, type: 'success' });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Simulate price checking
  React.useEffect(() => {
    const interval = setInterval(() => {
      alerts.forEach(alert => {
        if (alert.isActive) {
          const currentPrice = 2000 + Math.random() * 100;
          const triggered = alert.condition === 'above' ? 
            currentPrice > alert.targetPrice : 
            currentPrice < alert.targetPrice;
          
          if (triggered) {
            addNotification({
              title: 'Price Alert!',
              message: `${alert.asset} hit $${currentPrice.toFixed(2)}`,
              type: 'warning'
            });
            setAlerts(prev => prev.map(a => 
              a.id === alert.id ? { ...a, isActive: false } : a
            ));
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [alerts, addNotification]);

  return { alerts, createAlert, removeAlert };
}