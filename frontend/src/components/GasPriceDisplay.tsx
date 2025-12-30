import React from 'react';
import { useGasPrice, GAS_PRICE_TIERS, GasTier } from '../hooks/useGasPrice';
import { Skeleton } from './LoadingSkeleton';

interface GasPriceDisplayProps {
  gasLimit?: bigint;
  onTierSelect?: (tier: GasTier) => void;
  selectedTier?: GasTier;
}

export function GasPriceDisplay({ gasLimit, onTierSelect, selectedTier }: GasPriceDisplayProps) {
  const { gasPrice, loading, error, estimateUSD } = useGasPrice();

  if (loading) {
    return (
      <div className="card">
        <Skeleton height={24} width="40%" className="mb-4" />
        <Skeleton height={16} width="100%" />
      </div>
    );
  }

  if (error || !gasPrice) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Gas Price</h3>
        <p className="text-sm text-red-600 dark:text-red-400">Unable to fetch gas price</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Gas Price</h3>
      
      <div className="space-y-4">
        {/* Current Gas Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current</span>
            <span className="text-lg font-bold dark:text-white">{gasPrice.formatted.gwei} Gwei</span>
          </div>
          {gasLimit && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Estimated cost: {estimateUSD(gasLimit)}
            </div>
          )}
        </div>

        {/* Gas Price Tiers */}
        {onTierSelect && (
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Transaction Speed
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(GAS_PRICE_TIERS).map(([tier, config]) => {
                const tierGasPrice = gasPrice.gasPrice * BigInt(Math.floor(config.multiplier * 100)) / BigInt(100);
                const tierGwei = (Number(tierGasPrice) / 1e9).toFixed(2);
                const isSelected = selectedTier === tier;

                return (
                  <button
                    key={tier}
                    onClick={() => onTierSelect(tier as GasTier)}
                    className={`
                      px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                      ${isSelected
                        ? 'border-base-600 bg-base-50 dark:bg-base-900/20 dark:border-base-500 text-base-700 dark:text-base-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="font-semibold dark:text-white">{config.label}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{tierGwei} Gwei</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Info */}
        {gasPrice.maxFeePerGas && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Max Fee: {(Number(gasPrice.maxFeePerGas) / 1e9).toFixed(2)} Gwei</div>
            {gasPrice.maxPriorityFeePerGas && (
              <div>Priority Fee: {(Number(gasPrice.maxPriorityFeePerGas) / 1e9).toFixed(2)} Gwei</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

