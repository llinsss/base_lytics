import React from 'react';
import { useContractLoader } from '../hooks/useContractLoader';
import { useChainId } from 'wagmi';

interface ContractStatusProps {
  contractName: string;
  address: `0x${string}`;
}

function ContractStatusItem({ contractName, address }: ContractStatusProps) {
  const isDeployed = address !== '0x0000000000000000000000000000000000000000';
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isDeployed ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <h3 className="font-medium">{contractName}</h3>
          <p className="text-sm text-gray-500 font-mono">
            {isDeployed ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not deployed'}
          </p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs ${
        isDeployed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isDeployed ? 'Active' : 'Missing'}
      </span>
    </div>
  );
}

export function ContractStatus() {
  const { config, loading, error, isConfigured, reload } = useContractLoader();
  const chainId = useChainId();

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      84532: 'Base Sepolia',
      8453: 'Base Mainnet',
      1337: 'Hardhat',
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  const deployedCount = config ? Object.values(config.contracts).filter(
    addr => addr !== '0x0000000000000000000000000000000000000000'
  ).length : 0;

  const totalContracts = config ? Object.keys(config.contracts).length : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Contract Status</h2>
        <button
          onClick={reload}
          className="btn-secondary text-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-base-600">{deployedCount}/{totalContracts}</p>
          <p className="text-sm text-gray-600">Deployed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{getNetworkName(chainId || 84532)}</p>
          <p className="text-sm text-gray-600">Network</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${isConfigured ? 'text-green-600' : 'text-red-600'}`}>
            {isConfigured ? '✓' : '✗'}
          </p>
          <p className="text-sm text-gray-600">Status</p>
        </div>
      </div>

      {config && (
        <div className="space-y-3">
          {Object.entries(config.contracts).map(([name, address]) => (
            <ContractStatusItem
              key={name}
              contractName={name}
              address={address as `0x${string}`}
            />
          ))}
        </div>
      )}

      {config && (
        <div className="mt-6 pt-6 border-t text-sm text-gray-500">
          <p>Last updated: {new Date(config.timestamp).toLocaleString()}</p>
          {config.deployer && (
            <p>Deployed by: {config.deployer.slice(0, 10)}...{config.deployer.slice(-8)}</p>
          )}
        </div>
      )}
    </div>
  );
}