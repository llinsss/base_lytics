import React, { useState } from 'react';
import { PriceAlerts } from '../components/PriceAlerts';
import { PortfolioPerformance } from '../components/PortfolioPerformance';
import { NewsFeed } from '../components/NewsFeed';
import { AdvancedCharts } from '../components/AdvancedCharts';
import { YieldFarmingCalculator } from '../components/YieldFarmingCalculator';
import { GasTracker } from '../components/GasTracker';
import { TokenScreener } from '../components/TokenScreener';
import { AIRiskManager } from '../components/AIRiskManager';
import { SocialTradingHub } from '../components/SocialTradingHub';
import { AdvancedOptions } from '../components/AdvancedOptions';
import { MarketIntelligence } from '../components/MarketIntelligence';
import { DeFiProtocols } from '../components/DeFiProtocols';

export function Tools() {
  const [activeTab, setActiveTab] = useState('alerts');

  const tools = [
    { id: 'alerts', label: '🚨 Price Alerts', component: PriceAlerts },
    { id: 'performance', label: '📊 Portfolio Analytics', component: PortfolioPerformance },
    { id: 'news', label: '📰 News Feed', component: NewsFeed },
    { id: 'charts', label: '📈 Advanced Charts', component: AdvancedCharts },
    { id: 'yield', label: '🌾 Yield Calculator', component: YieldFarmingCalculator },
    { id: 'gas', label: '⛽ Gas Tracker', component: GasTracker },
    { id: 'screener', label: '🔍 Token Screener', component: TokenScreener },
    { id: 'defi', label: '🏦 DeFi Protocols', component: DeFiProtocols },
    { id: 'risk', label: '🛡️ AI Risk Manager', component: AIRiskManager },
    { id: 'social', label: '👥 Social Trading', component: SocialTradingHub },
    { id: 'options', label: '📊 Options Trading', component: AdvancedOptions },
    { id: 'intelligence', label: '🧠 Market Intel', component: MarketIntelligence }
  ];

  const ActiveComponent = tools.find(tool => tool.id === activeTab)?.component || PriceAlerts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Professional Trading Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced analytics, alerts, and DeFi integration tools for professional traders
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card p-4">
              <nav className="space-y-2">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tool.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="card p-4 mt-4">
              <h3 className="font-semibold mb-3 dark:text-white">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Gas Price</span>
                  <span className="font-medium dark:text-white">25 gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ETH Price</span>
                  <span className="font-medium text-green-500">$2,045</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fear & Greed</span>
                  <span className="font-medium text-yellow-500">Neutral</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">DeFi TVL</span>
                  <span className="font-medium dark:text-white">$45.2B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ActiveComponent />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🚨</div>
              <h3 className="font-semibold mb-2 dark:text-white">Smart Alerts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time price alerts with advanced conditions
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Professional portfolio performance tracking
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-semibold mb-2 dark:text-white">Discovery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced token screening and filtering
              </p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🏦</div>
              <h3 className="font-semibold mb-2 dark:text-white">DeFi</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Direct protocol integration and yield optimization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}