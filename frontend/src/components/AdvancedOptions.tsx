import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export function AdvancedOptions() {
  const { addNotification } = useNotifications();
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [strike, setStrike] = useState('2100');
  const [expiry, setExpiry] = useState('7d');
  const [premium, setPremium] = useState('45.50');

  const strategies = [
    { name: 'Covered Call', risk: 'Low', reward: 'Limited', description: 'Own stock + sell call' },
    { name: 'Iron Condor', risk: 'Medium', reward: 'Limited', description: 'Profit from low volatility' },
    { name: 'Straddle', risk: 'High', reward: 'Unlimited', description: 'Profit from high volatility' },
    { name: 'Butterfly', risk: 'Low', reward: 'Limited', description: 'Profit from specific price' }
  ];

  const executeOption = () => {
    addNotification({
      title: 'Option Order Placed',
      message: `${optionType.toUpperCase()} option at $${strike} strike`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">📊 Options Trading</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOptionType('call')}
                className={`flex-1 py-2 px-4 rounded ${
                  optionType === 'call' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                CALL
              </button>
              <button
                onClick={() => setOptionType('put')}
                className={`flex-1 py-2 px-4 rounded ${
                  optionType === 'put' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                PUT
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Strike Price</label>
            <input
              type="number"
              value={strike}
              onChange={(e) => setStrike(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Expiry</label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="input w-full"
            >
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Premium</label>
            <input
              type="number"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
              className="input w-full"
              step="0.01"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Break Even</p>
              <p className="font-semibold dark:text-white">
                ${(parseFloat(strike) + parseFloat(premium)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Max Profit</p>
              <p className="font-semibold text-green-500">Unlimited</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Max Loss</p>
              <p className="font-semibold text-red-500">${premium}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">IV</p>
              <p className="font-semibold dark:text-white">45.2%</p>
            </div>
          </div>
        </div>

        <button
          onClick={executeOption}
          className="btn-primary w-full"
        >
          Buy {optionType.toUpperCase()} Option
        </button>
      </div>

      <div className="card">
        <h4 className="font-semibold mb-4 dark:text-white">Option Strategies</h4>
        <div className="space-y-3">
          {strategies.map((strategy, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <p className="font-medium dark:text-white">{strategy.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.description}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${
                  strategy.risk === 'Low' ? 'text-green-500' :
                  strategy.risk === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {strategy.risk} Risk
                </p>
                <p className="text-xs text-gray-500">{strategy.reward} Reward</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}