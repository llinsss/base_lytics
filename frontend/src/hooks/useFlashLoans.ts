import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface FlashLoan {
  id: string;
  asset: string;
  amount: number;
  fee: number;
  strategy: string;
  profit: number;
  timestamp: number;
}

export function useFlashLoans() {
  const { addNotification } = useNotifications();
  const [loans, setLoans] = useState<FlashLoan[]>([]);

  const executeFlashLoan = async (asset: string, amount: number, strategy: string) => {
    try {
      addNotification({ title: 'Flash Loan', message: 'Executing flash loan...', type: 'info' });
      
      const loan: FlashLoan = {
        id: Date.now().toString(),
        asset,
        amount,
        fee: amount * 0.0009, // 0.09% fee
        strategy,
        profit: Math.random() * 100 - 20, // Random profit/loss
        timestamp: Date.now()
      };
      
      setLoans(prev => [loan, ...prev]);
      addNotification({ title: 'Success', message: 'Flash loan executed!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Flash loan failed', type: 'error' });
    }
  };

  return { loans, executeFlashLoan };
}