import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatGwei, parseGwei } from 'viem';

export interface GasPriceInfo {
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice: bigint;
  formatted: {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    gasPrice: string;
  };
  speed: 'slow' | 'standard' | 'fast';
}

export function useGasPrice(refetchInterval: number = 15000) {
  const publicClient = usePublicClient();
  const [gasPrice, setGasPrice] = useState<GasPriceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGasPrice = async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError(null);

      // Get current gas price
      const currentGasPrice = await publicClient.getGasPrice();

      // Estimate priority fee (EIP-1559)
      let maxFeePerGas = currentGasPrice;
      let maxPriorityFeePerGas = parseGwei('1'); // Default 1 gwei

      try {
        // Try to get fee data for EIP-1559
        const feeData = await publicClient.estimateFeesPerGas();
        if (feeData.maxFeePerGas) {
          maxFeePerGas = feeData.maxFeePerGas;
        }
        if (feeData.maxPriorityFeePerGas) {
          maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        }
      } catch (e) {
        // Fallback to legacy gas price if EIP-1559 not supported
        maxFeePerGas = currentGasPrice;
      }

      // Calculate speed tiers (approximate)
      const basePrice = Number(formatGwei(currentGasPrice));
      let speed: 'slow' | 'standard' | 'fast' = 'standard';
      
      if (basePrice < 0.5) speed = 'slow';
      else if (basePrice > 2) speed = 'fast';

      const gasPriceInfo: GasPriceInfo = {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasPrice: currentGasPrice,
        formatted: {
          maxFeePerGas: formatGwei(maxFeePerGas),
          maxPriorityFeePerGas: formatGwei(maxPriorityFeePerGas),
          gasPrice: formatGwei(currentGasPrice),
        },
        speed,
      };

      setGasPrice(gasPriceInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gas price');
      console.error('Error fetching gas price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasPrice();
    const interval = setInterval(fetchGasPrice, refetchInterval);
    return () => clearInterval(interval);
  }, [publicClient, refetchInterval]);

  return {
    gasPrice,
    loading,
    error,
    refetch: fetchGasPrice,
  };
}

/**
 * Get recommended gas prices for different speed tiers
 */
export function getGasPriceForSpeed(
  baseGasPrice: bigint,
  speed: 'slow' | 'standard' | 'fast'
): bigint {
  const multipliers = {
    slow: 0.9,      // 10% less
    standard: 1.0,  // Base price
    fast: 1.2,      // 20% more
  };

  const multiplier = multipliers[speed];
  return (baseGasPrice * BigInt(Math.round(multiplier * 100))) / BigInt(100);
}
