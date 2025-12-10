import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { NFTMarketplace } from '../components/NFTMarketplace';

export function Marketplace() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <ConnectWalletPrompt />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NFTMarketplace />
    </div>
  );
}