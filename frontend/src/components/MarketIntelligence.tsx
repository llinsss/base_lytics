import React, { useState, useEffect } from 'react';

export function MarketIntelligence() {
  const [sentiment, setSentiment] = useState(72);
  const [whaleActivity, setWhaleActivity] = useState<any[]>([]);
  const [marketSignals, setMarketSignals] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment(Math.floor(Math.random() * 100));
      
      setWhaleActivity([
        { type: 'Buy', amount: '1,250 ETH', price: '$2,045', time: '2m ago' },
        { type: 'Sell', amount: '890 BTC', price: '$43,210', time: '5m ago' },
        { type: 'Buy', amount: '50,000 USDC', price: '$1.00', time: '8m ago' }
      ]);

      setMarketSignals([
        { signal: 'Golden Cross', asset: 'ETH', strength: 'Strong', confidence: 85 },
        { signal: 'RSI Oversold', asset: 'BTC', strength: 'Medium', confidence: 72 },
        { signal: 'Volume Spike', asset: 'BASE', strength: 'Weak', confidence: 45 }
      ]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (score: number) => {
    if (score > 70) return 'text-green-500';
    if (score > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 80) return 'Extreme Greed';
    if (score > 60) return 'Greed';
    if (score > 40) return 'Neutral';
    if (score > 20) return 'Fear';
    return 'Extreme Fear';
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">🧠 Market Intelligence</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`text-3xl font-bold ${getSentimentColor(sentiment)}`}>
              {sentiment}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fear & Greed</p>
            <p className={`text-xs font-medium ${getSentimentColor(sentiment)}`}>
              {getSentimentLabel(sentiment)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-blue-500">24</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Signals</p>
            <p className="text-xs text-blue-500 font-medium">+3 from yesterday</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-purple-500">89%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI Confidence</p>
            <p className="text-xs text-purple-500 font-medium">High accuracy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h4 className="font-semibold mb-4 dark:text-white">🐋 Whale Activity</h4>
          <div className="space-y-3">
            {whaleActivity.map((activity, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <span className={`font-medium ${
                    activity.type === 'Buy' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {activity.type}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.amount} at {activity.price}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h4 className="font-semibold mb-4 dark:text-white">📊 Trading Signals</h4>
          <div className="space-y-3">
            {marketSignals.map((signal, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="font-medium dark:text-white">{signal.signal}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{signal.asset}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    signal.strength === 'Strong' ? 'text-green-500' :
                    signal.strength === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {signal.strength}
                  </p>
                  <p className="text-xs text-gray-500">{signal.confidence}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}