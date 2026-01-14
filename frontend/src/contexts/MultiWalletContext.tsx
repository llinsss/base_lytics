import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletInfo {
  address: string;
  label: string;
  connector: string;
  isActive: boolean;
}

interface MultiWalletContextType {
  wallets: WalletInfo[];
  activeWallet: string | null;
  addWallet: (wallet: WalletInfo) => void;
  removeWallet: (address: string) => void;
  switchWallet: (address: string) => void;
  updateLabel: (address: string, label: string) => void;
}

const MultiWalletContext = createContext<MultiWalletContextType | undefined>(undefined);

export function MultiWalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<WalletInfo[]>(() => {
    const saved = localStorage.getItem('baselytics_multi_wallets');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeWallet, setActiveWallet] = useState<string | null>(() => {
    return localStorage.getItem('baselytics_active_wallet');
  });

  useEffect(() => {
    localStorage.setItem('baselytics_multi_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    if (activeWallet) {
      localStorage.setItem('baselytics_active_wallet', activeWallet);
    }
  }, [activeWallet]);

  const addWallet = (wallet: WalletInfo) => {
    setWallets(prev => {
      const exists = prev.find(w => w.address === wallet.address);
      if (exists) return prev;
      return [...prev, wallet];
    });
    if (!activeWallet) setActiveWallet(wallet.address);
  };

  const removeWallet = (address: string) => {
    setWallets(prev => prev.filter(w => w.address !== address));
    if (activeWallet === address) {
      const remaining = wallets.filter(w => w.address !== address);
      setActiveWallet(remaining[0]?.address || null);
    }
  };

  const switchWallet = (address: string) => {
    setActiveWallet(address);
  };

  const updateLabel = (address: string, label: string) => {
    setWallets(prev => prev.map(w => w.address === address ? { ...w, label } : w));
  };

  return (
    <MultiWalletContext.Provider value={{ wallets, activeWallet, addWallet, removeWallet, switchWallet, updateLabel }}>
      {children}
    </MultiWalletContext.Provider>
  );
}

export const useMultiWallet = () => {
  const context = useContext(MultiWalletContext);
  if (!context) throw new Error('useMultiWallet must be used within MultiWalletProvider');
  return context;
};
