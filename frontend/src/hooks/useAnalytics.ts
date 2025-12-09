import { useState, useEffect } from 'react';
import { useTokenInfo, useNFTInfo, useStakingInfo } from './useContracts';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

export interface AnalyticsData {
  tokenSupply: {
    current: number;
    max: number;
    utilization: number;
  };
  nftMetrics: {
    totalMinted: number;
    revenue: number;
    mintPrice: number;
  };
  stakingMetrics: {
    totalStaked: number;
    apy: number;
    participants: number;
  };
  timeSeriesData: {
    date: string;
    tokenSupply: number;
    nftMinted: number;
    stakingTVL: number;
  }[];
}

export function useAnalytics() {
  const { address } = useAccount();
  const tokenInfo = useTokenInfo();
  const nftInfo = useNFTInfo();
  const stakingInfo = useStakingInfo();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAnalytics();
  }, [tokenInfo, nftInfo, stakingInfo]);

  const generateAnalytics = () => {
    try {
      setLoading(true);

      // Generate mock time series data for demonstration
      const timeSeriesData = generateMockTimeSeriesData();

      const analyticsData: AnalyticsData = {
        tokenSupply: {
          current: tokenInfo.totalSupply ? Number(formatEther(tokenInfo.totalSupply)) : 0,
          max: tokenInfo.maxSupply ? Number(formatEther(tokenInfo.maxSupply)) : 0,
          utilization: tokenInfo.maxSupply > BigInt(0)
            ? Number((tokenInfo.totalSupply * BigInt(100)) / tokenInfo.maxSupply)
            : 0
        },
        nftMetrics: {
          totalMinted: Number(nftInfo.totalSupply || 0),
          revenue: nftInfo.price && nftInfo.totalSupply
            ? Number(formatEther(nftInfo.price)) * Number(nftInfo.totalSupply)
            : 0,
          mintPrice: nftInfo.price ? Number(formatEther(nftInfo.price)) : 0
        },
        stakingMetrics: {
          totalStaked: stakingInfo.totalStaked ? Number(formatEther(stakingInfo.totalStaked)) : 0,
          apy: Number(stakingInfo.rewardRate) || 0,
          participants: 1 // Simplified - would need to track actual participants
        },
        timeSeriesData
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to generate analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTimeSeriesData = () => {
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate realistic mock data with growth trends
      const baseTokenSupply = 800000 + (29 - i) * 5000 + Math.random() * 10000;
      const baseNFTMinted = Math.floor((29 - i) * 2.5 + Math.random() * 5);
      const baseStakingTVL = 50000 + (29 - i) * 2000 + Math.random() * 5000;

      data.push({
        date: date.toISOString().split('T')[0],
        tokenSupply: Math.floor(baseTokenSupply),
        nftMinted: baseNFTMinted,
        stakingTVL: Math.floor(baseStakingTVL)
      });
    }

    return data;
  };

  return {
    analytics,
    loading,
    refresh: generateAnalytics
  };
}