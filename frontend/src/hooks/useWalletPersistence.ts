import { useEffect } from 'react';
import { useAccount, useReconnect } from 'wagmi';

const WALLET_STORAGE_KEY = 'baselytics_wallet_connected';

export function useWalletPersistence() {
  const { isConnected, address } = useAccount();
  const { reconnect } = useReconnect();

  // Save connection state
  useEffect(() => {
    if (isConnected && address) {
      localStorage.setItem(WALLET_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [isConnected, address]);

  // Auto-reconnect on app load
  useEffect(() => {
    const wasConnected = localStorage.getItem(WALLET_STORAGE_KEY);
    if (wasConnected && !isConnected) {
      reconnect();
    }
  }, []);

  return { isConnected, address };
}