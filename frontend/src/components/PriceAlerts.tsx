import React, { useState } from 'react';
import { usePriceAlerts } from '../hooks/usePriceAlerts';

export function PriceAlerts() {
  const { alerts, createAlert, removeAlert } = usePriceAlerts();
  const [showForm, setShowForm] = useState(false);
  const [asset, setAsset] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (asset && targetPrice) {
      createAlert(asset, parseFloat(targetPrice), condition);
      setAsset('');
      setTargetPrice('');
      setShowForm(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Price Alerts</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm"
        >
          + Add Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Asset (e.g., ETH)"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Target Price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="input flex-1"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No alerts set</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <span className="font-medium dark:text-white">{alert.asset}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                  {alert.condition} ${alert.targetPrice}
                </span>
                {!alert.isActive && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Triggered
                  </span>
                )}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}