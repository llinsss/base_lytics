import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';

interface Transaction {
  hash: string;
  timestamp: number;
  token: string;
  amount: bigint;
  price: number;
  type: 'buy' | 'sell';
}

interface TaxReport {
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  harvestOpportunities: Array<{ token: string; amount: number; savingsUSD: number }>;
}

export function useAdvancedPortfolio() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [costBasisMethod, setCostBasisMethod] = useState<'FIFO' | 'LIFO'>('FIFO');

  useEffect(() => {
    const saved = localStorage.getItem(`baselytics_txs_${address}`);
    if (saved) setTransactions(JSON.parse(saved));
  }, [address]);

  const calculateCostBasis = (token: string, amount: bigint): number => {
    const tokenTxs = transactions.filter(tx => tx.token === token && tx.type === 'buy');
    if (costBasisMethod === 'FIFO') {
      tokenTxs.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      tokenTxs.sort((a, b) => b.timestamp - a.timestamp);
    }

    let remaining = amount;
    let totalCost = 0;

    for (const tx of tokenTxs) {
      if (remaining <= 0n) break;
      const used = remaining > tx.amount ? tx.amount : remaining;
      totalCost += Number(used) * tx.price;
      remaining -= used;
    }

    return totalCost;
  };

  const generateTaxReport = (): TaxReport => {
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    
    let shortTermGains = 0;
    let longTermGains = 0;
    const harvestOpportunities: TaxReport['harvestOpportunities'] = [];

    // Calculate realized gains
    const sells = transactions.filter(tx => tx.type === 'sell');
    for (const sell of sells) {
      const costBasis = calculateCostBasis(sell.token, sell.amount);
      const proceeds = Number(sell.amount) * sell.price;
      const gain = proceeds - costBasis;
      
      if (now - sell.timestamp < oneYear) {
        shortTermGains += gain;
      } else {
        longTermGains += gain;
      }
    }

    // Find tax loss harvesting opportunities
    // (positions with unrealized losses that can offset gains)
    const positions = new Map<string, { amount: bigint; costBasis: number; currentValue: number }>();
    for (const tx of transactions) {
      const current = positions.get(tx.token) || { amount: 0n, costBasis: 0, currentValue: 0 };
      if (tx.type === 'buy') {
        positions.set(tx.token, {
          amount: current.amount + tx.amount,
          costBasis: current.costBasis + (Number(tx.amount) * tx.price),
          currentValue: current.currentValue, // Update with real-time price
        });
      }
    }

    for (const [token, pos] of positions) {
      const unrealizedLoss = pos.costBasis - pos.currentValue;
      if (unrealizedLoss > 0) {
        harvestOpportunities.push({
          token,
          amount: Number(pos.amount),
          savingsUSD: unrealizedLoss * 0.3, // Assuming 30% tax rate
        });
      }
    }

    return {
      shortTermGains,
      longTermGains,
      totalGains: shortTermGains + longTermGains,
      harvestOpportunities,
    };
  };

  const compareToBenchmark = (benchmark: 'ETH' | 'BTC') => {
    // Calculate portfolio performance vs benchmark
    // Return percentage difference
    return 0; // Placeholder
  };

  return {
    transactions,
    costBasisMethod,
    setCostBasisMethod,
    calculateCostBasis,
    generateTaxReport,
    compareToBenchmark,
  };
}
