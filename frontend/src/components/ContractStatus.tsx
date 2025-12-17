import React from 'react';
import { useChainId } from 'wagmi';
import { useContracts } from '../hooks/useContracts';

export function ContractStatus() {
  const { addresses } = useContracts();
  const chainId = useChainId();

  const contracts = [
    { name: 'BaseToken', address: addresses.BaseToken, status: 'deployed' },
    { name: 'BaseNFT', address: addresses.BaseNFT, status: 'deployed' },
    { name: 'BaseStaking', address: addresses.BaseStaking, status: 'deployed' }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Contract Status</h2>
      <div className="space-y-3">
        {contracts.map((contract) => (
          <div key={contract.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium dark:text-white">{contract.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {contract.address}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 capitalize">{contract.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Chain ID: {chainId}
      </div>
    </div>
  );
}