import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  token?: string;
  type: 'send' | 'receive' | 'swap' | 'approve' | 'stake' | 'unstake';
  status: 'pending' | 'success' | 'failed';
}

interface Favorite {
  type: 'token' | 'contract' | 'address';
  address: string;
  label: string;
  addedAt: number;
}

interface DashboardLayout {
  widgets: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
  }>;
}

export function useUXEnhancements() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [layout, setLayout] = useState<DashboardLayout>({ widgets: [] });

  useEffect(() => {
    const saved = localStorage.getItem(`baselytics_favorites_${address}`);
    if (saved) setFavorites(JSON.parse(saved));
  }, [address]);

  useEffect(() => {
    const saved = localStorage.getItem(`baselytics_layout_${address}`);
    if (saved) setLayout(JSON.parse(saved));
  }, [address]);

  const fetchTransactionHistory = async (filters?: {
    type?: string;
    startDate?: number;
    endDate?: number;
    minValue?: number;
  }): Promise<Transaction[]> => {
    // Fetch from Basescan API or subgraph
    // Apply filters
    return [];
  };

  const searchTransactions = (query: string): Transaction[] => {
    return transactions.filter(tx => 
      tx.hash.toLowerCase().includes(query.toLowerCase()) ||
      tx.to.toLowerCase().includes(query.toLowerCase()) ||
      tx.from.toLowerCase().includes(query.toLowerCase())
    );
  };

  const addFavorite = (favorite: Omit<Favorite, 'addedAt'>) => {
    const newFav = { ...favorite, addedAt: Date.now() };
    setFavorites(prev => {
      const updated = [...prev, newFav];
      localStorage.setItem(`baselytics_favorites_${address}`, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (address: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.address !== address);
      localStorage.setItem(`baselytics_favorites_${address}`, JSON.stringify(updated));
      return updated;
    });
  };

  const updateLayout = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    localStorage.setItem(`baselytics_layout_${address}`, JSON.stringify(newLayout));
  };

  const exportTransactions = (format: 'csv' | 'json'): Blob => {
    if (format === 'csv') {
      const csv = 'Hash,Timestamp,From,To,Value,Type,Status\n' +
        transactions.map(tx => 
          `${tx.hash},${tx.timestamp},${tx.from},${tx.to},${tx.value},${tx.type},${tx.status}`
        ).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }
    return new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k': // Cmd+K: Quick search
            e.preventDefault();
            // Open search modal
            break;
          case 's': // Cmd+S: Quick swap
            e.preventDefault();
            // Open swap modal
            break;
          case 'w': // Cmd+W: Wallet menu
            e.preventDefault();
            // Toggle wallet menu
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    transactions,
    favorites,
    layout,
    fetchTransactionHistory,
    searchTransactions,
    addFavorite,
    removeFavorite,
    updateLayout,
    exportTransactions,
  };
}
