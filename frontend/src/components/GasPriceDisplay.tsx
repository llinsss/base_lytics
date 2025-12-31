import React from 'react';
import { useGasPrice } from '../hooks/useGasPrice';
import { Skeleton } from './LoadingSkeleton';

export function GasPriceDisplay() {
  const { gasPrice, loading, error } = useGasPrice();

  if (loading) {
    return (
      <div className="card">
        <Skeleton height={24} width="40%" className="mb-2" />
        <Skeleton height={16} width="60%" />
      </div>
    );
  }

  if (error || !gasPrice) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Gas Price
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          Unable to load gas price
        </p>
      </div>
    );
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'slow':
        return 'text-green-600 dark:text-green-400';
      case 'fast':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
        Current Gas Price
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Gas Price</span>
          <span className="font-semibold dark:text-white">
            {gasPrice.formatted.gasPrice} gwei
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Max Fee</span>
          <span className="font-semibold dark:text-white">
            {gasPrice.formatted.maxFeePerGas} gwei
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Priority Fee</span>
          <span className="font-semibold dark:text-white">
            {gasPrice.formatted.maxPriorityFeePerGas} gwei
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Network Speed</span>
          <span className={`font-semibold capitalize ${getSpeedColor(gasPrice.speed)}`}>
            {gasPrice.speed}
          </span>
        </div>
      </div>
    </div>
  );
}
