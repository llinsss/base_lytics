import React, { useState } from 'react';
import { useOptionsTrading } from '../hooks/useOptionsTrading';

export function OptionsTrading() {
  const { options, positions, buyOption, sellOption } = useOptionsTrading();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState('1');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">📊 Options Trading</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Available Options</h3>
          <div className="space-y-4">
            {options.map((option) => (
              <div key={option.id} className="border rounded-lg p-4 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold dark:text-white">
                      {option.underlying} ${option.strike} {option.type.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expires: {option.expiry.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg dark:text-white">{option.premium} ETH</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Premium</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                  <div className="text-center">
                    <div className="font-medium dark:text-white">Δ {option.delta}</div>
                    <div className="text-gray-500">Delta</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">Γ {option.gamma}</div>
                    <div className="text-gray-500">Gamma</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">Θ {option.theta}</div>
                    <div className="text-gray-500">Theta</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium dark:text-white">ν {option.vega}</div>
                    <div className="text-gray-500">Vega</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => buyOption(option.id, Number(quantity))}
                    className="btn-primary flex-1 text-sm"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => sellOption(option.id, Number(quantity))}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Your Positions</h3>
          {positions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No positions yet</p>
          ) : (
            <div className="space-y-3">
              {positions.map((position) => (
                <div key={position.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium dark:text-white">
                        {position.side.toUpperCase()} {position.option.underlying} ${position.option.strike} {position.option.type.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {position.quantity} | Entry: {position.entryPrice} ETH
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${position.side === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                        {position.side === 'long' ? '+' : '-'}5.2%
                      </div>
                      <div className="text-xs text-gray-500">P&L</div>
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