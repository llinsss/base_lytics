import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { useContractAddresses, BASE_TOKEN_ABI, BASE_NFT_ABI, BASE_STAKING_ABI } from '../utils/contracts';
import { useReadContract } from 'wagmi';

export interface AnalyticsDataPoint {
  date: string;
  tokenSupply: number;
  nftMinted: number;
  totalStaked: number;
  revenue: number;
}

export function useRealTimeAnalytics(days: number = 30) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const contracts = useContractAddresses();
  const [data, setData] = useState<AnalyticsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current values
  const { data: tokenSupply, isLoading: tokenSupplyLoading } = useReadContract({
    address: contracts.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const { data: nftTotalSupply, isLoading: nftLoading } = useReadContract({
    address: contracts.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'getCurrentTokenId',
    query: {
      refetchInterval: 30000,
    },
  });

  const { data: totalStaked, isLoading: stakingLoading } = useReadContract({
    address: contracts.BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'totalStaked',
    query: {
      refetchInterval: 30000,
    },
  });

  // Generate historical data from current values and events
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!publicClient || !contracts.BaseToken) return;

      try {
        setLoading(true);
        setError(null);

        const currentTokenSupply = tokenSupply ? parseFloat(formatEther(tokenSupply as bigint)) : 0;
        const currentNFTCount = nftTotalSupply ? Number(nftTotalSupply) : 0;
        const currentStaked = totalStaked ? parseFloat(formatEther(totalStaked as bigint)) : 0;

        // Get recent blocks to analyze
        const latestBlock = await publicClient.getBlockNumber();
        const blocksPerDay = 7200; // Approximate blocks per day on Base
        const fromBlock = latestBlock - BigInt(days * blocksPerDay);

        // Fetch token transfer events
        const tokenTransfers = await publicClient.getLogs({
          address: contracts.BaseToken,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'value', type: 'uint256', indexed: false },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch NFT mint events
        const nftMints = await publicClient.getLogs({
          address: contracts.BaseNFT,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        });

        // Fetch staking events
        const stakingEvents = await publicClient.getLogs({
          address: contracts.BaseStaking,
          event: {
            type: 'event',
            name: 'Staked',
            inputs: [
              { name: 'user', type: 'address', indexed: true },
              { name: 'amount', type: 'uint256', indexed: false },
            ],
          },
          fromBlock,
          toBlock: 'latest',
        });

        // Group events by day and build time series
        const dataMap = new Map<string, AnalyticsDataPoint>();
        const today = new Date();
        
        // Initialize data points for the past N days
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          dataMap.set(dateKey, {
            date: dateKey,
            tokenSupply: 0,
            nftMinted: 0,
            totalStaked: 0,
            revenue: 0,
          });
        }

        // Process token transfers (mints add to supply)
        let runningSupply = currentTokenSupply;
        for (const log of tokenTransfers.reverse()) {
          if (log.args?.from === '0x0000000000000000000000000000000000000000') {
            // Mint event
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const dateKey = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
            const point = dataMap.get(dateKey);
            if (point) {
              const amount = parseFloat(formatEther((log.args?.value as bigint) || BigInt(0)));
              runningSupply -= amount; // Backtrack
              point.tokenSupply = Math.max(0, runningSupply);
            }
          }
        }

        // Process NFT mints
        let runningNFTCount = currentNFTCount;
        const nftPrice = 0.01; // ETH
        for (const log of nftMints.reverse()) {
          if (log.args?.from === '0x0000000000000000000000000000000000000000') {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const dateKey = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
            const point = dataMap.get(dateKey);
            if (point) {
              runningNFTCount--;
              point.nftMinted = Math.max(0, runningNFTCount);
              point.revenue = point.nftMinted * nftPrice;
            }
          }
        }

        // Process staking events
        let runningStaked = currentStaked;
        for (const log of stakingEvents.reverse()) {
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
          const dateKey = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
          const point = dataMap.get(dateKey);
          if (point) {
            const amount = parseFloat(formatEther((log.args?.amount as bigint) || BigInt(0)));
            runningStaked -= amount;
            point.totalStaked = Math.max(0, runningStaked);
          }
        }

        // Set final values for all days
        const finalData = Array.from(dataMap.values()).map((point, index) => {
          // Interpolate values forward from events
          return {
            ...point,
            tokenSupply: index === dataMap.size - 1 ? currentTokenSupply : point.tokenSupply || 0,
            nftMinted: index === dataMap.size - 1 ? currentNFTCount : point.nftMinted || 0,
            totalStaked: index === dataMap.size - 1 ? currentStaked : point.totalStaked || 0,
            revenue: point.revenue || 0,
          };
        });

        setData(finalData);
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        
        // Fallback to current values only
        const currentData: AnalyticsDataPoint = {
          date: new Date().toISOString().split('T')[0],
          tokenSupply: tokenSupply ? parseFloat(formatEther(tokenSupply as bigint)) : 0,
          nftMinted: nftTotalSupply ? Number(nftTotalSupply) : 0,
          totalStaked: totalStaked ? parseFloat(formatEther(totalStaked as bigint)) : 0,
          revenue: 0,
        };
        setData([currentData]);
      } finally {
        setLoading(false);
      }
    };

    if (!tokenSupplyLoading && !nftLoading && !stakingLoading) {
      loadAnalyticsData();
    }
  }, [publicClient, contracts, days, tokenSupply, nftTotalSupply, totalStaked, tokenSupplyLoading, nftLoading, stakingLoading]);

  return {
    data,
    loading: loading || tokenSupplyLoading || nftLoading || stakingLoading,
    error,
    currentValues: {
      tokenSupply: tokenSupply ? parseFloat(formatEther(tokenSupply as bigint)) : 0,
      nftMinted: nftTotalSupply ? Number(nftTotalSupply) : 0,
      totalStaked: totalStaked ? parseFloat(formatEther(totalStaked as bigint)) : 0,
    },
  };
}

