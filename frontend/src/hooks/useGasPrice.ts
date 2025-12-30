import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';

export interface GasPriceData {
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  formatted: {
    gwei: string;
    usd?: string;
  };
}

/**
 * Hook to fetch current gas prices
 */
export function useGasPrice() {
  const publicClient = usePublicClient();
  const [gasPrice, setGasPrice] = useState<GasPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasPrice = async () => {
      if (!publicClient) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch gas price (legacy) or fee data (EIP-1559)
        const feeData = await publicClient.estimateFeesPerGas();
        
        const gasPriceValue = feeData.gasPrice || feeData.maxFeePerGas || BigInt(0);
        const gwei = Number(gasPriceValue) / 1e9;

        setGasPrice({
          gasPrice: gasPriceValue,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          formatted: {
            gwei: gwei.toFixed(2),
          },
        });
      } catch (err) {
        console.error('Failed to fetch gas price:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch gas price');
      } finally {
        setLoading(false);
      }
    };

    fetchGasPrice();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchGasPrice, 30000);
    return () => clearInterval(interval);
  }, [publicClient]);

  // Calculate USD cost (rough estimate, would need price oracle for accurate)
  const estimateUSD = (gasLimit: bigint): string => {
    if (!gasPrice) return 'N/A';
    // Rough estimate: 1 ETH = $2000, adjust as needed
    const ethPrice = 2000;
    const totalWei = gasPrice.gasPrice * gasLimit;
    const totalEth = Number(totalWei) / 1e18;
    const totalUSD = totalEth * ethPrice;
    return `$${totalUSD.toFixed(2)}`;
  };

  return {
    gasPrice,
    loading,
    error,
    estimateUSD,
  };
}

/**
 * Gas price tiers for user selection
 */
export const GAS_PRICE_TIERS = {
  slow: { label: 'Slow', multiplier: 0.9 },
  standard: { label: 'Standard', multiplier: 1.0 },
  fast: { label: 'Fast', multiplier: 1.2 },
  instant: { label: 'Instant', multiplier: 1.5 },
} as const;

export type GasTier = keyof typeof GAS_PRICE_TIERS;

/**
 * Calculate gas price for a specific tier
 */
export function calculateGasPriceForTier(baseGasPrice: bigint, tier: GasTier): bigint {
  const multiplier = GAS_PRICE_TIERS[tier].multiplier;
  return (baseGasPrice * BigInt(Math.floor(multiplier * 100))) / BigInt(100);
}

