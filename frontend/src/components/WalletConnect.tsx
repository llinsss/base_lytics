import React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useWalletPersistence } from '../hooks/useWalletPersistence';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  useWalletPersistence();

  const supportedChains = [base, baseSepolia];
  const currentChain = supportedChains.find(chain => chain.id === chainId);
  const isWrongNetwork = isConnected && !currentChain;

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Connected:</span>
          <span className="ml-2 font-mono text-base-600 dark:text-base-400">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        
        {isWrongNetwork ? (
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm">Wrong Network</span>
            <select
              onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
              className="text-sm px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Switch Network</option>
              {supportedChains.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-green-600 text-sm">{currentChain?.name}</span>
        )}
        
        <button
          onClick={() => {
            disconnect();
            localStorage.removeItem('baselytics_wallet_connected');
          }}
          className="btn-secondary text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="btn-primary"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

export function ConnectWalletPrompt() {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="card text-center">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Connect Your Wallet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect your wallet to interact with BaseLytics contracts
      </p>
      <WalletConnect />
    </div>
  );
}