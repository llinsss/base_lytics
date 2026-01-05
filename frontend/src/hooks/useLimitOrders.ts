import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface LimitOrder {
  id: string;
  type: 'limit' | 'stop_loss' | 'take_profit';
  side: 'buy' | 'sell';
  asset: string;
  amount: number;
  triggerPrice: number;
  currentPrice: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
}

export function useLimitOrders() {
  const { addNotification } = useNotifications();
  const [orders, setOrders] = useState<LimitOrder[]>([]);

  const createLimitOrder = async (
    type: LimitOrder['type'],
    side: LimitOrder['side'],
    asset: string,
    amount: number,
    triggerPrice: number
  ) => {
    try {
      addNotification({ title: 'Order', message: 'Creating limit order...', type: 'info' });
      
      const order: LimitOrder = {
        id: Date.now().toString(),
        type,
        side,
        asset,
        amount,
        triggerPrice,
        currentPrice: 2000 + Math.random() * 100, // Mock current price
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      setOrders(prev => [order, ...prev]);
      addNotification({ title: 'Success', message: 'Limit order created!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to create order', type: 'error' });
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      addNotification({ title: 'Order', message: 'Cancelling order...', type: 'info' });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order
      ));
      addNotification({ title: 'Success', message: 'Order cancelled!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to cancel order', type: 'error' });
    }
  };

  // Simulate order execution
  React.useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === 'pending') {
          const shouldFill = Math.random() < 0.1; // 10% chance to fill
          if (shouldFill) {
            return { ...order, status: 'filled' as const };
          }
        }
        return order;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { orders, createLimitOrder, cancelOrder };
}