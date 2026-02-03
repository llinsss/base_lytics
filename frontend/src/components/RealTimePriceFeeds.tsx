import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

interface PriceFeedProps {
  symbols: string[];
  updateInterval?: number;
}

export const RealTimePriceFeeds: React.FC<PriceFeedProps> = ({ 
  symbols, 
  updateInterval = 5000 
}) => {
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
  const [priceHistory, setPriceHistory] = useState<Record<string, any[]>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://api.baselytics.com/ws/prices');
    
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ action: 'subscribe', symbols }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'price_update') {
        setPriceData(prev => ({
          ...prev,
          [data.symbol]: data
        }));
        
        setPriceHistory(prev => ({
          ...prev,
          [data.symbol]: [
            ...(prev[data.symbol] || []).slice(-50),
            { time: data.timestamp, price: data.price }
          ]
        }));
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => ws.close();
  }, [symbols]);

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);

  const formatChange = (change: number) => (
    <span className={`${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
    </span>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Real-Time Prices</h2>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {symbols.map(symbol => {
          const data = priceData[symbol];
          const history = priceHistory[symbol] || [];
          
          return (
            <div key={symbol} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg">{symbol}</span>
                {data && formatChange(data.change24h)}
              </div>
              
              <div className="text-2xl font-bold mb-2">
                {data ? formatPrice(data.price) : '--'}
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                Vol: {data ? `$${(data.volume24h / 1000000).toFixed(2)}M` : '--'}
              </div>
              
              {history.length > 1 && (
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={history}>
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={data?.change24h >= 0 ? "#10b981" : "#ef4444"}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};