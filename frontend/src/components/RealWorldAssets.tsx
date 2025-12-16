import React, { useState } from 'react';
import { useRealWorldAssets } from '../hooks/useRealWorldAssets';

export function RealWorldAssets() {
  const { assets, portfolio, investInAsset } = useRealWorldAssets();
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [shareAmount, setShareAmount] = useState('');

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'real-estate': return '🏢';
      case 'commodity': return '🥇';
      case 'carbon-credit': return '🌱';
      case 'art': return '🎨';
      default: return '📊';
    }
  };

  const handleInvest = () => {
    if (selectedAsset && shareAmount) {
      investInAsset(selectedAsset, Number(shareAmount));
      setSelectedAsset('');
      setShareAmount('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">🌍 Real World Assets</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white">Available Assets</h3>
          {assets.map((asset) => (
            <div key={asset.id} className="card">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getAssetIcon(asset.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold dark:text-white">{asset.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{asset.type.replace('-', ' ')}</p>
                  {asset.location && (
                    <p className="text-sm text-gray-500">📍 {asset.location}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Value</span>
                      <div className="font-semibold dark:text-white">${asset.value.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Yield</span>
                      <div className="font-semibold text-green-600">{asset.yield}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Price per Share</span>
                      <div className="font-semibold dark:text-white">${(asset.value / asset.totalShares).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Available</span>
                      <div className="font-semibold dark:text-white">{asset.totalShares - asset.shares}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      placeholder="Shares"
                      value={selectedAsset === asset.id ? shareAmount : ''}
                      onChange={(e) => {
                        setSelectedAsset(asset.id);
                        setShareAmount(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={handleInvest}
                      disabled={selectedAsset !== asset.id || !shareAmount}
                      className="btn-primary text-sm"
                    >
                      Invest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold dark:text-white">Your RWA Portfolio</h3>
          {portfolio.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No RWA investments yet</p>
              <p className="text-sm text-gray-400 mt-2">Start investing in tokenized real-world assets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.map((investment) => (
                <div key={investment.id} className="card">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAssetIcon(investment.asset.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium dark:text-white">{investment.asset.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {investment.shares} shares • ${investment.investmentValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+{investment.asset.yield}%</div>
                      <div className="text-xs text-gray-500">Annual Yield</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="card bg-blue-50 dark:bg-blue-900">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${portfolio.reduce((sum, inv) => sum + inv.investmentValue, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total RWA Portfolio Value</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}