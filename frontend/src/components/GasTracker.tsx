import React, { useState } from 'react';
import { useGasTracker } from '../hooks/useGasTracker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GasTracker() {
  const { gasData, gasHistory, alerts, estimateTransactionCost, getOptimalGasPrice, setGasAlert } = useGasTracker();
  const [gasLimit, setGasLimit] = useState(21000);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(alerts.threshold);

  const gasOptimality = getOptimalGasPrice();
  
  const getOptimalityColor = (optimality: string) => {
    switch (optimality) {
      case 'low': return 'text-green-500';
      case 'high': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getOptimalityMessage = (optimality: string) => {
    switch (optimality) {
      case 'low': return 'Great time to transact!';
      case 'high': return 'Consider waiting for lower fees';
      default: return 'Normal gas prices';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Gas Tracker</h3>
          <div className={`px-3 py-1 rounded text-sm font-medium ${getOptimalityColor(gasOptimality)}`}>
            {getOptimalityMessage(gasOptimality)}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Slow</p>
            <p className="text-lg font-bold dark:text-white">{gasData.slow}</p>
            <p className="text-xs text-gray-500">gwei</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Standard</p>
            <p className="text-lg font-bold text-blue-600">{gasData.standard}</p>
            <p className="text-xs text-gray-500">gwei</p>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Fast</p>
            <p className="text-lg font-bold text-orange-600">{gasData.fast}</p>
            <p className="text-xs text-gray-500">gwei</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Instant</p>
            <p className="text-lg font-bold text-red-600">{gasData.instant}</p>
            <p className="text-xs text-gray-500">gwei</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Base Fee</p>
            <p className="text-xl font-semibold dark:text-white">{gasData.baseFee} gwei</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Priority Fee</p>
            <p className="text-xl font-semibold dark:text-white">{gasData.priorityFee} gwei</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="btn-secondary text-sm mb-3"
          >
            {alerts.enabled ? '🔔' : '🔕'} Gas Alerts
          </button>
          
          {showAlertForm && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1 dark:text-white">
                    Alert when gas drops below (gwei)
                  </label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="input w-full"
                  />
                </div>
                <button
                  onClick={() => {
                    setGasAlert(alertThreshold, !alerts.enabled);
                    setShowAlertForm(false);
                  }}
                  className="btn-primary"
                >
                  {alerts.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Transaction Cost Calculator</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-white">Gas Limit</label>
          <input
            type="number"
            value={gasLimit}
            onChange={(e) => setGasLimit(Number(e.target.value))}
            className="input w-full"
            placeholder="21000"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['slow', 'standard', 'fast', 'instant'] as const).map(speed => {
            const cost = estimateTransactionCost(gasLimit, speed);
            return (
              <div key={speed} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{speed}</p>
                <p className="font-semibold dark:text-white">${cost.usd.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{cost.eth.toFixed(6)} ETH</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Gas Price History (24h)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gasHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}