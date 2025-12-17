import React, { useState } from 'react';
import { usePerpetualFutures } from '../hooks/usePerpetualFutures';

export function PerpetualFutures() {
  const { positions, leverage, setLeverage, openPosition, closePosition } = usePerpetualFutures();
  const [asset, setAsset] = useState('ETH');
  const [size, setSize] = useState('');
  const [side, setSide] = useState<'long' | 'short'>('long');

  const handleOpenPosition = () => {
    if (size) {
      openPosition(asset, side, Number(size));
      setSize('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">⚡ Perpetual Futures</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Open Position</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="ETH">ETH-PERP</option>
                <option value="BTC">BTC-PERP</option>
                <option value="SOL">SOL-PERP</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSide('long')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  side === 'long' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Long
              </button>
              <button
                onClick={() => setSide('short')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                  side === 'short' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Short
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Size (USD)</label>
              <input
                type="number"
                placeholder="1000"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Leverage: {leverage}x</label>
              <input
                type="range"
                min="1"
                max="100"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={handleOpenPosition}
              disabled={!size}
              className={`w-full py-3 rounded-lg font-medium ${
                side === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              Open {side.toUpperCase()} Position
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Open Positions</h3>
          
          {positions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No open positions</p>
          ) : (
            <div className="space-y-3">
              {positions.map((position) => (
                <div key={position.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium dark:text-white">
                        {position.asset}-PERP {position.leverage}x
                      </div>
                      <div className={`text-sm font-medium ${
                        position.side === 'long' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.side.toUpperCase()} ${position.size}
                      </div>
                    </div>
                    <button
                      onClick={() => closePosition(position.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Entry:</span>
                      <span className="ml-1 dark:text-white">${position.entryPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">PnL:</span>
                      <span className={`ml-1 ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${position.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Funding:</span>
                      <span className="ml-1 dark:text-white">{position.fundingRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}