import React, { useState, useEffect } from 'react';
import { useChainId, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';

interface NetworkInfo {
  chainId: number;
  name: string;
  blockNumber: number;
  gasPrice: bigint;
  isConnected: boolean;
}

export function NetworkStatus() {
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateNetworkInfo();
  }, [chainId, blockNumber]);

  const updateNetworkInfo = async () => {
    try {
      setLoading(true);

      // Get gas price (simplified for demo)
      const gasPrice = BigInt(1000000000); // 1 gwei placeholder

      const info: NetworkInfo = {
        chainId: chainId || 0,
        name: getNetworkName(chainId || 0),
        blockNumber: Number(blockNumber || 0),
        gasPrice,
        isConnected: !!chainId,
      };

      setNetworkInfo(info);
    } catch (error) {
      console.error('Failed to fetch network info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNetworkName = (chainId: number): string => {
    const networks: Record<number, string> = {
      84532: 'Base Sepolia',
      8453: 'Base Mainnet',
      1: 'Ethereum',
      1337: 'Hardhat',
    };
    return networks[chainId] || `Unknown (${chainId})`;
  };

  const getNetworkStatus = (): 'connected' | 'disconnected' | 'wrong-network' => {
    if (!networkInfo?.isConnected) return 'disconnected';
    if (![84532, 8453].includes(networkInfo.chainId)) return 'wrong-network';
    return 'connected';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'wrong-network': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'wrong-network': return '🟡';
      case 'disconnected': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const status = getNetworkStatus();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Network Status</h2>
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon(status)}</span>
          <span className={`text-sm font-medium ${getStatusColor(status)}`}>
            {status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {networkInfo && (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Network</span>
            <span className="font-medium">{networkInfo.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Chain ID</span>
            <span className="font-mono">{networkInfo.chainId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Block Number</span>
            <span className="font-mono">{networkInfo.blockNumber.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Gas Price</span>
            <span className="font-mono">
              {parseFloat(formatEther(networkInfo.gasPrice * BigInt(1000000000))).toFixed(2)} gwei
            </span>
          </div>
        </div>
      )}

      {status === 'wrong-network' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            Please switch to Base Sepolia or Base Mainnet to use this dApp.
          </p>
        </div>
      )}

      {status === 'disconnected' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            No network connection detected. Please connect your wallet.
          </p>
        </div>
      )}
    </div>
  );
}