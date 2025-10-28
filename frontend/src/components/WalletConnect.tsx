import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-gray-600">Connected:</span>
          <span className="ml-2 font-mono text-base-600">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="btn-secondary text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}

export function ConnectWalletPrompt() {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="card text-center">
      <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
      <p className="text-gray-600 mb-6">
        Connect your wallet to interact with BaseLytics contracts
      </p>
      <WalletConnect />
    </div>
  );
}