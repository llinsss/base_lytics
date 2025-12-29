import { useState } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { Address } from 'viem';

interface SimulationResult {
  success: boolean;
  error?: string;
  gasEstimate?: bigint;
  revertReason?: string;
}

/**
 * Hook to simulate transactions before execution
 * Helps prevent failed transactions and provides better error messages
 */
export function useTransactionSimulation() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateTransaction = async (
    to: Address,
    data: `0x${string}`,
    value?: bigint
  ): Promise<SimulationResult> => {
    if (!publicClient || !address) {
      return {
        success: false,
        error: 'Wallet not connected or public client not available',
      };
    }

    setIsSimulating(true);

    try {
      // Simulate the transaction using eth_call
      const result = await publicClient.call({
        to,
        data,
        value,
        account: address,
      });

      // If call succeeds, estimate gas
      try {
        const gasEstimate = await publicClient.estimateGas({
          to,
          data,
          value,
          account: address,
        });

        return {
          success: true,
          gasEstimate,
        };
      } catch (gasError: any) {
        return {
          success: false,
          error: 'Gas estimation failed',
          revertReason: extractRevertReason(gasError),
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: 'Transaction simulation failed',
        revertReason: extractRevertReason(error),
      };
    } finally {
      setIsSimulating(false);
    }
  };

  /**
   * Extract revert reason from error
   */
  const extractRevertReason = (error: any): string => {
    if (!error) return 'Unknown error';

    const errorMessage = error.message || error.toString();

    // Check for common revert reasons
    if (errorMessage.includes('insufficient funds')) {
      return 'Insufficient balance for transaction';
    }
    if (errorMessage.includes('execution reverted')) {
      // Try to extract the revert reason
      const match = errorMessage.match(/execution reverted: (.+)/i);
      if (match) return match[1];
      return 'Transaction would revert';
    }
    if (errorMessage.includes('user rejected')) {
      return 'Transaction rejected by user';
    }
    if (errorMessage.includes('nonce')) {
      return 'Nonce too high. Please wait for previous transactions.';
    }
    if (errorMessage.includes('gas')) {
      return 'Insufficient gas or gas price too low';
    }

    return errorMessage.length > 200
      ? errorMessage.substring(0, 200) + '...'
      : errorMessage;
  };

  return {
    simulateTransaction,
    isSimulating,
  };
}

