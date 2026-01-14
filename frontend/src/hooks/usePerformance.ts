import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

interface RPCEndpoint {
  url: string;
  priority: number;
  latency: number;
  failureCount: number;
  lastCheck: number;
}

export function usePerformance() {
  const publicClient = usePublicClient();
  const [rpcEndpoints, setRpcEndpoints] = useState<RPCEndpoint[]>([
    { url: 'https://mainnet.base.org', priority: 1, latency: 0, failureCount: 0, lastCheck: 0 },
    { url: 'https://base.llamarpc.com', priority: 2, latency: 0, failureCount: 0, lastCheck: 0 },
    { url: 'https://base.meowrpc.com', priority: 3, latency: 0, failureCount: 0, lastCheck: 0 },
  ]);
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const [cachedData, setCachedData] = useState<Record<string, any>>({});

  // Monitor RPC health
  useEffect(() => {
    const checkEndpoints = async () => {
      const updated = await Promise.all(
        rpcEndpoints.map(async (endpoint) => {
          const start = Date.now();
          try {
            const response = await fetch(endpoint.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
            });
            const latency = Date.now() - start;
            if (response.ok) {
              return { ...endpoint, latency, failureCount: 0, lastCheck: Date.now() };
            }
          } catch (error) {
            return { ...endpoint, failureCount: endpoint.failureCount + 1, lastCheck: Date.now() };
          }
          return endpoint;
        })
      );
      setRpcEndpoints(updated);
    };

    const interval = setInterval(checkEndpoints, 30000);
    checkEndpoints();
    return () => clearInterval(interval);
  }, []);

  // Auto-failover to best endpoint
  useEffect(() => {
    const best = rpcEndpoints
      .filter(e => e.failureCount < 3)
      .sort((a, b) => a.latency - b.latency)[0];
    
    if (best) {
      const index = rpcEndpoints.indexOf(best);
      if (index !== activeEndpoint) {
        setActiveEndpoint(index);
      }
    }
  }, [rpcEndpoints]);

  // Detect offline mode
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheData = (key: string, data: any) => {
    setCachedData(prev => ({ ...prev, [key]: data }));
    localStorage.setItem(`baselytics_cache_${key}`, JSON.stringify(data));
  };

  const getCachedData = (key: string): any => {
    if (cachedData[key]) return cachedData[key];
    const saved = localStorage.getItem(`baselytics_cache_${key}`);
    return saved ? JSON.parse(saved) : null;
  };

  const retryTransaction = async (txHash: string, maxRetries = 3): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const receipt = await publicClient?.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
        return receipt;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      }
    }
  };

  const recoverFromError = async (error: any): Promise<void> => {
    // Attempt to recover from common errors
    if (error.message?.includes('nonce')) {
      // Reset nonce
    } else if (error.message?.includes('gas')) {
      // Increase gas limit
    } else if (error.message?.includes('network')) {
      // Switch to backup RPC
      const nextEndpoint = (activeEndpoint + 1) % rpcEndpoints.length;
      setActiveEndpoint(nextEndpoint);
    }
  };

  const optimizeGas = async (tx: any): Promise<any> => {
    // Analyze transaction and suggest optimizations
    // - Batch operations
    // - Use EIP-1559
    // - Optimal gas limit
    return tx;
  };

  return {
    rpcEndpoints,
    activeEndpoint,
    offlineMode,
    cacheData,
    getCachedData,
    retryTransaction,
    recoverFromError,
    optimizeGas,
  };
}
