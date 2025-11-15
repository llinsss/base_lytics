import React from 'react';
import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';

const SUPPORTED_CHAINS = [base, baseSepolia];

export function NetworkSwitcher() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  const isWrongNetwork = !currentChain;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-red-500' : 'bg-green-500'}`} />
      
      <select
        value={chainId}
        onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
        disabled={isPending}
        className="text-sm px-2 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        {!currentChain && <option value={chainId}>Unknown Network</option>}
        {SUPPORTED_CHAINS.map(chain => (
          <option key={chain.id} value={chain.id}>
            {chain.name}
          </option>
        ))}
      </select>
      
      {isPending && <span className="text-xs text-gray-500">Switching...</span>}
    </div>
  );
}

export function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  if (!isConnected) return null;

  const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  const isWrongNetwork = !currentChain;

  return (
    <div className={`text-xs px-2 py-1 rounded ${
      isWrongNetwork 
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`}>
      {isWrongNetwork ? 'Unsupported Network' : currentChain?.name}
    </div>
  );
}