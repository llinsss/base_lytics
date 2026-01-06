import { useState } from 'react';

interface YieldPool {
  id: string;
  name: string;
  protocol: string;
  apy: number;
  tvl: number;
  tokens: string[];
  risk: 'low' | 'medium' | 'high';
  category: 'lending' | 'dex' | 'staking' | 'vault';
}

interface YieldCalculation {
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  yearlyYield: number;
  compoundedYearly: number;
}

export function useYieldFarming() {
  const [pools] = useState<YieldPool[]>([
    {
      id: '1',
      name: 'ETH/USDC LP',
      protocol: 'Uniswap V3',
      apy: 12.5,
      tvl: 45000000,
      tokens: ['ETH', 'USDC'],
      risk: 'medium',
      category: 'dex'
    },
    {
      id: '2',
      name: 'USDC Lending',
      protocol: 'Aave',
      apy: 8.2,
      tvl: 120000000,
      tokens: ['USDC'],
      risk: 'low',
      category: 'lending'
    },
    {
      id: '3',
      name: 'ETH Staking',
      protocol: 'Lido',
      apy: 5.8,
      tvl: 890000000,
      tokens: ['ETH'],
      risk: 'low',
      category: 'staking'
    },
    {
      id: '4',
      name: 'BTC Vault',
      protocol: 'Yearn',
      apy: 15.3,
      tvl: 25000000,
      tokens: ['WBTC'],
      risk: 'high',
      category: 'vault'
    }
  ]);

  const [selectedPool, setSelectedPool] = useState<YieldPool | null>(null);
  const [amount, setAmount] = useState<number>(1000);
  const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const calculateYield = (pool: YieldPool, principal: number): YieldCalculation => {
    const apy = pool.apy / 100;
    const dailyRate = apy / 365;
    const weeklyRate = apy / 52;
    const monthlyRate = apy / 12;

    const dailyYield = principal * dailyRate;
    const weeklyYield = principal * weeklyRate;
    const monthlyYield = principal * monthlyRate;
    const yearlyYield = principal * apy;

    // Compound calculation
    const compoundPeriods = compoundFrequency === 'daily' ? 365 : 
                           compoundFrequency === 'weekly' ? 52 : 12;
    const compoundRate = apy / compoundPeriods;
    const compoundedYearly = principal * Math.pow(1 + compoundRate, compoundPeriods) - principal;

    return {
      dailyYield,
      weeklyYield,
      monthlyYield,
      yearlyYield,
      compoundedYearly
    };
  };

  const getFilteredPools = (category?: string, risk?: string) => {
    return pools.filter(pool => 
      (!category || pool.category === category) &&
      (!risk || pool.risk === risk)
    );
  };

  const getBestPools = (limit: number = 5) => {
    return [...pools].sort((a, b) => b.apy - a.apy).slice(0, limit);
  };

  return {
    pools,
    selectedPool,
    setSelectedPool,
    amount,
    setAmount,
    compoundFrequency,
    setCompoundFrequency,
    calculateYield,
    getFilteredPools,
    getBestPools
  };
}