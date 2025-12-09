import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { Transaction } from '../types/transactions';
import { useContractAddresses } from '../utils/contracts';

export function useTransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const contractAddresses = useContractAddresses();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      loadTransactionHistory();
    }
  }, [address]);

  const loadTransactionHistory = async () => {
    if (!address || !publicClient) return;

    try {
      setLoading(true);
      setError(null);

      // Get recent blocks to scan for transactions
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock - BigInt(1000); // Last ~1000 blocks

      const txHistory: Transaction[] = [];

      // Scan for token transfers
      try {
        const tokenLogs = await publicClient.getLogs({
          address: contractAddresses.BaseToken,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        for (const log of tokenLogs) {
          if (log.args?.from === address || log.args?.to === address) {
            txHistory.push({
              hash: log.transactionHash!,
              type: 'token_transfer',
              status: 'confirmed',
              timestamp: Date.now(),
              blockNumber: Number(log.blockNumber),
              from: log.args.from as string,
              to: log.args.to as string,
              value: log.args.value?.toString(),
              contract: 'BaseToken',
              description: `Token ${log.args.from === address ? 'sent' : 'received'}`
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load token transfers:', err);
      }

      // Scan for NFT transfers
      try {
        const nftLogs = await publicClient.getLogs({
          address: contractAddresses.BaseNFT,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true }
            ]
          },
          fromBlock,
          toBlock: 'latest'
        });

        for (const log of nftLogs) {
          if (log.args?.from === address || log.args?.to === address) {
            txHistory.push({
              hash: log.transactionHash!,
              type: 'nft_mint',
              status: 'confirmed',
              timestamp: Date.now(),
              blockNumber: Number(log.blockNumber),
              from: log.args.from as string,
              to: log.args.to as string,
              contract: 'BaseNFT',
              description: `NFT #${log.args.tokenId} ${log.args.from === address ? 'sent' : 'received'}`
            });
          }
        }
      } catch (err) {
        console.warn('Failed to load NFT transfers:', err);
      }

      // Sort by block number (most recent first)
      txHistory.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0));

      setTransactions(txHistory);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const addPendingTransaction = (tx: Omit<Transaction, 'status' | 'timestamp'>) => {
    const pendingTx: Transaction = {
      ...tx,
      status: 'pending',
      timestamp: Date.now()
    };

    setTransactions(prev => [pendingTx, ...prev]);

    // Monitor transaction status
    monitorTransaction(tx.hash);
  };

  const monitorTransaction = async (hash: string) => {
    if (!publicClient) return;

    try {
      // Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });

      // Update transaction status
      setTransactions(prev =>
        prev.map(tx =>
          tx.hash === hash
            ? {
              ...tx,
              status: receipt.status === 'success' ? 'confirmed' : 'failed',
              blockNumber: Number(receipt.blockNumber),
              gasUsed: receipt.gasUsed.toString()
            }
            : tx
        )
      );
    } catch (err) {
      // Mark as failed
      setTransactions(prev =>
        prev.map(tx =>
          tx.hash === hash ? { ...tx, status: 'failed' } : tx
        )
      );
    }
  };

  return {
    transactions,
    loading,
    error,
    reload: loadTransactionHistory,
    addPendingTransaction
  };
}