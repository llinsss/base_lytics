import React, { useState } from 'react';
import { useMultiWallet } from '../contexts/MultiWalletContext';
import { useTransactionSimulation } from '../hooks/useTransactionSimulation';
import { useSmartNotifications } from '../hooks/useSmartNotifications';
import { useAdvancedPortfolio } from '../hooks/useAdvancedPortfolio';
import { useAIFeatures } from '../hooks/useAIFeatures';
import { useSocialTrading } from '../hooks/useSocialTrading';
import { useAdvancedTrading } from '../hooks/useAdvancedTrading';
import { useInstitutional } from '../hooks/useInstitutional';
import { useGaslessTransactions } from '../hooks/useGaslessTransactions';
import { useCrossChain } from '../hooks/useCrossChain';
import { useDeFiAutomation } from '../hooks/useDeFiAutomation';
import { useNFTIntegration } from '../hooks/useNFTIntegration';
import { useUXEnhancements } from '../hooks/useUXEnhancements';
import { useDataAnalytics } from '../hooks/useDataAnalytics';
import { useOnboarding } from '../hooks/useOnboarding';
import { useCustomization } from '../hooks/useCustomization';
import { usePerformance } from '../hooks/usePerformance';

export function AdvancedFeaturesDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const multiWallet = useMultiWallet();
  const { simulate, simulating } = useTransactionSimulation();
  const notifications = useSmartNotifications();
  const portfolio = useAdvancedPortfolio();
  const ai = useAIFeatures();
  const social = useSocialTrading();
  const trading = useAdvancedTrading();
  const institutional = useInstitutional();
  const gasless = useGaslessTransactions();
  const crossChain = useCrossChain();
  const automation = useDeFiAutomation();
  const nft = useNFTIntegration();
  const ux = useUXEnhancements();
  const analytics = useDataAnalytics();
  const onboarding = useOnboarding();
  const customization = useCustomization();
  const performance = usePerformance();

  const features = [
    { id: 'multi-wallet', name: 'Multi-Wallet', icon: '👛', count: multiWallet.wallets.length },
    { id: 'simulation', name: 'TX Simulation', icon: '🔮', active: simulating },
    { id: 'notifications', name: 'Smart Alerts', icon: '🔔', count: notifications.rules.length },
    { id: 'portfolio', name: 'Tax Reports', icon: '📊', method: portfolio.costBasisMethod },
    { id: 'ai', name: 'AI Assistant', icon: '🤖', analyzing: ai.analyzing },
    { id: 'social', name: 'Copy Trading', icon: '👥', count: social.following.length },
    { id: 'trading', name: 'Advanced Trading', icon: '📈', count: trading.limitOrders.length },
    { id: 'institutional', name: 'Team & API', icon: '🏢', count: institutional.team.length },
    { id: 'gasless', name: 'Gasless TX', icon: '⚡', relaying: gasless.relaying },
    { id: 'cross-chain', name: 'Cross-Chain', icon: '🌉', scanning: crossChain.scanning },
    { id: 'automation', name: 'DeFi Automation', icon: '🤖', count: automation.compounders.length },
    { id: 'nft', name: 'NFT Suite', icon: '🖼️', count: nft.portfolio.length },
    { id: 'analytics', name: 'Analytics', icon: '📉', analyzing: analytics.analyzing },
    { id: 'favorites', name: 'Favorites', icon: '⭐', count: ux.favorites.length },
    { id: 'onboarding', name: 'Tutorials', icon: '🎓', count: onboarding.completed.length },
    { id: 'themes', name: 'Themes', icon: '🎨', current: customization.theme.name },
    { id: 'performance', name: 'Performance', icon: '⚡', offline: performance.offlineMode },
    { id: 'pwa', name: 'Mobile App', icon: '📱', status: 'Ready' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 Advanced Features Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            All 18 feature categories - Professional DeFi super-app
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeTab === feature.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {feature.name}
              </div>
              {feature.count !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {feature.count} items
                </div>
              )}
              {feature.active && (
                <div className="text-xs text-green-500">Active</div>
              )}
            </button>
          ))}
        </div>

        {/* Feature Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Feature Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🎯 High-Value Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ Multi-wallet management with aggregated portfolio</li>
                    <li>✅ Transaction simulation before execution</li>
                    <li>✅ Smart notifications with webhooks</li>
                    <li>✅ Tax reporting with FIFO/LIFO</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🚀 Competitive Edge</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ AI-powered contract analysis</li>
                    <li>✅ Copy trading with leaderboard</li>
                    <li>✅ Advanced trading bots (DCA, Grid, Arbitrage)</li>
                    <li>✅ Institutional features (Multi-sig, API)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">💡 Innovation</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ Gasless transactions with relayer</li>
                    <li>✅ Cross-chain intelligence</li>
                    <li>✅ DeFi automation hub</li>
                    <li>✅ NFT suite with lending</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">🔥 Polish</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ PWA with offline support</li>
                    <li>✅ Interactive tutorials</li>
                    <li>✅ 5 custom themes + i18n</li>
                    <li>✅ RPC failover & retry logic</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'multi-wallet' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                👛 Multi-Wallet Management
              </h2>
              <div className="space-y-4">
                {multiWallet.wallets.map((wallet) => (
                  <div
                    key={wallet.address}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {wallet.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                        </div>
                      </div>
                      {wallet.isActive && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <button className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600">
                  + Add Wallet
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                🔔 Smart Notifications
              </h2>
              <div className="space-y-4">
                {notifications.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {rule.type.toUpperCase()} Alert
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Channels: {rule.channels.join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => notifications.toggleRule(rule.id)}
                      className={`px-3 py-1 rounded ${
                        rule.enabled
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {rule.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                📈 Advanced Trading
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium text-gray-900 dark:text-white">Limit Orders</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {trading.limitOrders.filter(o => o.status === 'pending').length}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">🤖</div>
                  <div className="font-medium text-gray-900 dark:text-white">DCA Bots</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {trading.dcaConfigs.length}
                  </div>
                  <div className="text-xs text-gray-500">Running</div>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-2xl mb-2">📐</div>
                  <div className="font-medium text-gray-900 dark:text-white">Grid Bots</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {trading.gridBots.filter(b => b.active).length}
                  </div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </div>
            </div>
          )}

          {/* Add more tab content as needed */}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Total Features</div>
            <div className="text-3xl font-bold">18</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Active Automations</div>
            <div className="text-3xl font-bold">
              {automation.compounders.filter(c => c.enabled).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Wallets Connected</div>
            <div className="text-3xl font-bold">{multiWallet.wallets.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="text-sm opacity-90">Tutorials Completed</div>
            <div className="text-3xl font-bold">{onboarding.completed.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
