import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletPrompt } from '../components/WalletConnect';
import { AITradingBot } from '../components/AITradingBot';
import { CrossChainBridge } from '../components/CrossChainBridge';
import { OptionsTrading } from '../components/OptionsTrading';
import { SocialTrading } from '../components/SocialTrading';
import { GameFi } from '../components/GameFi';
import { PrivacyPanel } from '../components/PrivacyPanel';
import { RealWorldAssets } from '../components/RealWorldAssets';
import { PerpetualFutures } from '../components/PerpetualFutures';
import { FlashLoans } from '../components/FlashLoans';
import { PortfolioBacktest } from '../components/PortfolioBacktest';
import { UserProfile } from '../components/UserProfile';
import { LimitOrders } from '../components/LimitOrders';
import { PortfolioRebalancing } from '../components/PortfolioRebalancing';
import { ChatSystem } from '../components/ChatSystem';

export function Advanced() {
  const { isConnected } = useAccount();
  const [activeFeature, setActiveFeature] = useState('ai-bot');

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <ConnectWalletPrompt />
      </div>
    );
  }

  const features = [
    { id: 'ai-bot', name: 'AI Trading Bot', icon: '🤖' },
    { id: 'bridge', name: 'Cross-Chain Bridge', icon: '🌉' },
    { id: 'options', name: 'Options Trading', icon: '📊' },
    { id: 'social', name: 'Social Trading', icon: '👥' },
    { id: 'gamefi', name: 'GameFi Hub', icon: '🎮' },
    { id: 'privacy', name: 'Privacy & Security', icon: '🔒' },
    { id: 'rwa', name: 'Real World Assets', icon: '🌍' },
    { id: 'futures', name: 'Perpetual Futures', icon: '⚡' },
    { id: 'flash', name: 'Flash Loans', icon: '⚡' },
    { id: 'backtest', name: 'Portfolio Backtest', icon: '📊' },
    { id: 'profile', name: 'User Profile', icon: '👤' },
    { id: 'orders', name: 'Limit Orders', icon: '📋' },
    { id: 'rebalance', name: 'Auto Rebalancing', icon: '⚖️' },
    { id: 'chat', name: 'Community Chat', icon: '💬' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Advanced Features</h1>
        <p className="text-gray-600 dark:text-gray-400">Next-generation DeFi tools and AI-powered trading</p>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              activeFeature === feature.id 
                ? 'bg-base-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <span>{feature.icon}</span>
            <span>{feature.name}</span>
          </button>
        ))}
      </div>

      <div className="min-h-screen">
        {activeFeature === 'ai-bot' && <AITradingBot />}
        {activeFeature === 'bridge' && <CrossChainBridge />}
        {activeFeature === 'options' && <OptionsTrading />}
        {activeFeature === 'social' && <SocialTrading />}
        {activeFeature === 'gamefi' && <GameFi />}
        {activeFeature === 'privacy' && <PrivacyPanel />}
        {activeFeature === 'rwa' && <RealWorldAssets />}
        {activeFeature === 'futures' && <PerpetualFutures />}
        {activeFeature === 'flash' && <FlashLoans />}
        {activeFeature === 'backtest' && <PortfolioBacktest />}
        {activeFeature === 'profile' && <UserProfile />}
        {activeFeature === 'orders' && <LimitOrders />}
        {activeFeature === 'rebalance' && <PortfolioRebalancing />}
        {activeFeature === 'chat' && <ChatSystem />}
      </div>
    </div>
  );
}