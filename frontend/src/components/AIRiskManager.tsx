import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export function AIRiskManager() {
  const { addNotification } = useNotifications();
  const [riskScore, setRiskScore] = useState(65);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [autoProtection, setAutoProtection] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const newScore = Math.floor(Math.random() * 100);
      setRiskScore(newScore);
      
      if (newScore > 80) {
        setAlerts(prev => [...prev.slice(-2), 'High volatility detected']);
        if (autoProtection) {
          addNotification({
            title: '🛡️ Auto-Protection Activated',
            message: 'Reducing position sizes due to high risk',
            type: 'warning'
          });
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoProtection, addNotification]);

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">🤖 AI Risk Manager</h3>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getRiskColor(riskScore)}`}>
            {riskScore}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              riskScore < 30 ? 'bg-green-500' : 
              riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm dark:text-white">Auto-Protection</span>
          <button
            onClick={() => setAutoProtection(!autoProtection)}
            className={`w-12 h-6 rounded-full transition-colors ${
              autoProtection ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              autoProtection ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium dark:text-white">Recent Alerts</h4>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500">No alerts</p>
          ) : (
            alerts.map((alert, i) => (
              <div key={i} className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                ⚠️ {alert}
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <p className="text-gray-600 dark:text-gray-400">Max Drawdown</p>
            <p className="font-semibold dark:text-white">-5.2%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <p className="text-gray-600 dark:text-gray-400">VaR (95%)</p>
            <p className="font-semibold dark:text-white">$1,250</p>
          </div>
        </div>
      </div>
    </div>
  );
}