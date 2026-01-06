import { useState } from 'react';

interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders: number;
  age: number; // days
  verified: boolean;
  risk: 'low' | 'medium' | 'high';
}

interface ScreenerFilters {
  minPrice?: number;
  maxPrice?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minVolume?: number;
  minLiquidity?: number;
  minHolders?: number;
  maxAge?: number;
  verifiedOnly?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export function useTokenScreener() {
  const [tokens] = useState<Token[]>([
    {
      id: '1',
      symbol: 'NEWCOIN',
      name: 'New Coin',
      price: 0.45,
      change24h: 125.5,
      volume24h: 2500000,
      marketCap: 4500000,
      liquidity: 850000,
      holders: 1250,
      age: 7,
      verified: false,
      risk: 'high'
    },
    {
      id: '2',
      symbol: 'STABLE',
      name: 'Stable Token',
      price: 12.50,
      change24h: 8.2,
      volume24h: 1200000,
      marketCap: 25000000,
      liquidity: 5000000,
      holders: 5600,
      age: 180,
      verified: true,
      risk: 'low'
    },
    {
      id: '3',
      symbol: 'GROWTH',
      name: 'Growth Token',
      price: 2.85,
      change24h: 45.8,
      volume24h: 8500000,
      marketCap: 142000000,
      liquidity: 12000000,
      holders: 15000,
      age: 90,
      verified: true,
      risk: 'medium'
    }
  ]);

  const [filters, setFilters] = useState<ScreenerFilters>({});
  const [sortBy, setSortBy] = useState<keyof Token>('change24h');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const applyFilters = (tokens: Token[], filters: ScreenerFilters): Token[] => {
    return tokens.filter(token => {
      if (filters.minPrice && token.price < filters.minPrice) return false;
      if (filters.maxPrice && token.price > filters.maxPrice) return false;
      if (filters.minMarketCap && token.marketCap < filters.minMarketCap) return false;
      if (filters.maxMarketCap && token.marketCap > filters.maxMarketCap) return false;
      if (filters.minVolume && token.volume24h < filters.minVolume) return false;
      if (filters.minLiquidity && token.liquidity < filters.minLiquidity) return false;
      if (filters.minHolders && token.holders < filters.minHolders) return false;
      if (filters.maxAge && token.age > filters.maxAge) return false;
      if (filters.verifiedOnly && !token.verified) return false;
      if (filters.riskLevel && token.risk !== filters.riskLevel) return false;
      
      return true;
    });
  };

  const sortTokens = (tokens: Token[], sortBy: keyof Token, order: 'asc' | 'desc'): Token[] => {
    return [...tokens].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return order === 'asc' ? 
        String(aVal).localeCompare(String(bVal)) :
        String(bVal).localeCompare(String(aVal));
    });
  };

  const getFilteredTokens = () => {
    const filtered = applyFilters(tokens, filters);
    return sortTokens(filtered, sortBy, sortOrder);
  };

  const getTrendingTokens = () => {
    return tokens
      .filter(token => token.change24h > 20)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 10);
  };

  const getNewTokens = () => {
    return tokens
      .filter(token => token.age <= 30)
      .sort((a, b) => a.age - b.age)
      .slice(0, 10);
  };

  return {
    tokens: getFilteredTokens(),
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    getTrendingTokens,
    getNewTokens
  };
}