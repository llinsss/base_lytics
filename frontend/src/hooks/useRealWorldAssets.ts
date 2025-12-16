import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface RWAAsset {
  id: string;
  name: string;
  type: 'real-estate' | 'commodity' | 'carbon-credit' | 'art';
  value: number;
  shares: number;
  totalShares: number;
  yield: number;
  location?: string;
}

export function useRealWorldAssets() {
  const { addNotification } = useNotifications();
  const [assets] = useState<RWAAsset[]>([
    {
      id: '1',
      name: 'Manhattan Office Building',
      type: 'real-estate',
      value: 2500000,
      shares: 0,
      totalShares: 10000,
      yield: 8.5,
      location: 'New York, NY'
    },
    {
      id: '2',
      name: 'Gold Reserves',
      type: 'commodity',
      value: 50000,
      shares: 0,
      totalShares: 1000,
      yield: 3.2,
      location: 'Swiss Vault'
    },
    {
      id: '3',
      name: 'Carbon Credits 2024',
      type: 'carbon-credit',
      value: 15,
      shares: 0,
      totalShares: 100000,
      yield: 12.0,
      location: 'Amazon Rainforest'
    }
  ]);

  const [portfolio, setPortfolio] = useState<any[]>([]);

  const investInAsset = async (assetId: string, shareAmount: number) => {
    try {
      addNotification({ title: 'RWA Investment', message: 'Processing RWA investment...', type: 'info' });
      const asset = assets.find(a => a.id === assetId);
      if (asset) {
        const investment = {
          id: Date.now().toString(),
          asset,
          shares: shareAmount,
          investmentValue: (asset.value / asset.totalShares) * shareAmount,
          timestamp: Date.now()
        };
        setPortfolio(prev => [...prev, investment]);
        addNotification({ title: 'Success', message: 'RWA investment successful!', type: 'success' });
      }
    } catch (error) {
      addNotification({ title: 'Error', message: 'RWA investment failed', type: 'error' });
    }
  };

  return { assets, portfolio, investInAsset };
}