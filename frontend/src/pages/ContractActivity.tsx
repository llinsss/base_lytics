import React from 'react';
import { useAccount } from 'wagmi';
import { ContractDemo } from '../components/ContractDemo';
import { LiveTransactionMonitor } from '../components/LiveTransactionMonitor';
import { RewardsShowcase } from '../components/RewardsShowcase';
import { TokenCard } from '../components/TokenCard';
import { StakingCard } from '../components/StakingCard';
import { AutoTradingBot } from '../components/AutoTradingBot';
import { MultiChainBridge } from '../components/MultiChainBridge';
import { OnChainInteractions } from '../components/OnChainInteractions';
import { AdvancedPortfolioAnalytics } from '../components/AdvancedPortfolioAnalytics';
import { NFTCard } from '../components/NFTCard';

export function ContractActivity() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Connect MetaMask to interact with BaseLytics contracts and see live activity
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contract Activity Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interact with smart contracts and monitor live blockchain activity
        </p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            🔗 Connected: <code className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</code>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OnChainInteractions />
        <LiveTransactionMonitor />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AutoTradingBot />
        <MultiChainBridge />
      </div>

      <div className="mb-8">
        <AdvancedPortfolioAnalytics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ContractDemo />
        <LiveTransactionMonitor />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TokenCard />
        <StakingCard />
        <NFTCard />
      </div>

      <div className="mb-8">
        <RewardsShowcase />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">What You Can Do</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl mb-2">🪙</div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">Mint Tokens</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Create new BLT tokens and add them to your wallet
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl mb-2">🥩</div>
            <h4 className="font-semibold text-green-700 dark:text-green-300">Stake & Earn</h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              Stake tokens to earn rewards and unlock achievements
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-300">Earn Rewards</h4>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Collect NFT badges based on your trading activity
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-orange-700 dark:text-orange-300">Monitor Activity</h4>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Watch live transactions and contract interactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}