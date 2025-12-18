import React from 'react';
import { useChainId } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

export function NetworkStatus() {
  const chainId = useChainId();
  const currentChain = chainId === base.id ? base : baseSepolia;

  const networkStats = [
    { name: 'Block Height', value: '12,345,678' },
    { name: 'Gas Price', value: '0.5 gwei' },
    { name: 'TPS', value: '2,500' },
    { name: 'Finality', value: '2s' }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Network Status</h2>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium dark:text-white">{currentChain.name}</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Chain ID: {currentChain.id}
        </div>
      </div>
      <div className="space-y-3">
        {networkStats.map((stat) => (
          <div key={stat.name} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{stat.name}</span>
            <span className="font-medium dark:text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}