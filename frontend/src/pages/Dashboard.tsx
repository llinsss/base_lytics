import React from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { TokenCard } from '../components/TokenCard';
import { NFTCard } from '../components/NFTCard';
import { StakingCard } from '../components/StakingCard';

export function Dashboard() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BaseLytics Dashboard</h1>
        <p className="text-gray-600">Manage your tokens, NFTs, and staking positions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <TokenCard />
        <NFTCard />
        <StakingCard />
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">🪙</p>
            <p className="text-sm text-gray-600">BaseToken</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">🎨</p>
            <p className="text-sm text-gray-600">BaseNFT</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">🏦</p>
            <p className="text-sm text-gray-600">Staking</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-base-600">📊</p>
            <p className="text-sm text-gray-600">Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}