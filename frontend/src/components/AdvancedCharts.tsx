import React from 'react';
import { useAdvancedCharts } from '../hooks/useAdvancedCharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, CandlestickChart } from 'recharts';

export function AdvancedCharts() {
  const { candlestickData, timeframe, setTimeframe, indicators, toggleIndicator, indicatorData } = useAdvancedCharts();

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '1h', label: '1H' },
    { value: '1d', label: '1D' }
  ];

  const availableIndicators = ['SMA', 'RSI', 'MACD', 'BB'];

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Advanced Charts</h3>
        
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value as any)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === tf.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Technical Indicators:</p>
        <div className="flex gap-2 flex-wrap">
          {availableIndicators.map(indicator => (
            <button
              key={indicator}
              onClick={() => toggleIndicator(indicator)}
              className={`px-3 py-1 text-sm rounded ${
                indicators.includes(indicator)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {indicator}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={candlestickData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            {indicatorData.map(indicator => (
              <Line
                key={indicator.name}
                type="monotone"
                dataKey={() => null}
                stroke={indicator.color}
                strokeWidth={1}
                dot={false}
                data={indicator.values}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">Current Price</p>
          <p className="font-semibold dark:text-white">
            ${candlestickData[candlestickData.length - 1]?.close.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">24h High</p>
          <p className="font-semibold text-green-500">
            ${Math.max(...candlestickData.slice(-24).map(d => d.high)).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">24h Low</p>
          <p className="font-semibold text-red-500">
            ${Math.min(...candlestickData.slice(-24).map(d => d.low)).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
          <p className="text-gray-600 dark:text-gray-400">Volume</p>
          <p className="font-semibold dark:text-white">
            {(candlestickData[candlestickData.length - 1]?.volume / 1000).toFixed(1)}K
          </p>
        </div>
      </div>
    </div>
  );
}