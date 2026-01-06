import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface Protocol {
  id: string;
  name: string;
  category: 'dex' | 'lending' | 'staking' | 'yield';
  tvl: number;
  apy?: number;
  supported: boolean;
}

interface ProtocolAction {
  protocol: string;
  action: 'swap' | 'lend' | 'borrow' | 'stake' | 'unstake';
  amount: number;
  token: string;
}

export function useDeFiProtocols() {
  const { addNotification } = useNotifications();
  
  const [protocols] = useState<Protocol[]>([
    {
      id: 'uniswap',
      name: 'Uniswap V3',
      category: 'dex',
      tvl: 4500000000,
      supported: true
    },
    {
      id: 'aave',
      name: 'Aave',
      category: 'lending',
      tvl: 12000000000,
      apy: 8.5,
      supported: true
    },
    {
      id: 'compound',
      name: 'Compound',
      category: 'lending',
      tvl: 8500000000,
      apy: 6.2,
      supported: true
    },
    {
      id: 'lido',
      name: 'Lido',
      category: 'staking',
      tvl: 25000000000,
      apy: 5.8,
      supported: true
    }
  ]);

  const [loading, setLoading] = useState(false);

  const executeAction = async (action: ProtocolAction) => {
    setLoading(true);
    
    try {
      addNotification({
        title: 'Transaction Initiated',
        message: `${action.action} ${action.amount} ${action.token} on ${action.protocol}`,
        type: 'info'
      });

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      addNotification({
        title: 'Transaction Successful',
        message: `Successfully executed ${action.action} on ${action.protocol}`,
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Transaction Failed',
        message: 'Failed to execute DeFi action',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getProtocolsByCategory = (category: Protocol['category']) => {
    return protocols.filter(p => p.category === category && p.supported);
  };

  const getBestYields = () => {
    return protocols
      .filter(p => p.apy && p.supported)
      .sort((a, b) => (b.apy || 0) - (a.apy || 0))
      .slice(0, 5);
  };

  const swapTokens = async (fromToken: string, toToken: string, amount: number) => {
    await executeAction({
      protocol: 'Uniswap V3',
      action: 'swap',
      amount,
      token: `${fromToken}→${toToken}`
    });
  };

  const lendToken = async (token: string, amount: number, protocol: string = 'Aave') => {
    await executeAction({
      protocol,
      action: 'lend',
      amount,
      token
    });
  };

  const stakeToken = async (token: string, amount: number, protocol: string = 'Lido') => {
    await executeAction({
      protocol,
      action: 'stake',
      amount,
      token
    });
  };

  return {
    protocols,
    loading,
    executeAction,
    getProtocolsByCategory,
    getBestYields,
    swapTokens,
    lendToken,
    stakeToken
  };
}