import { useState } from 'react';

interface PortfolioMetrics {
  totalValue: number;
  totalPnL: number;
  pnlPercentage: number;
  dayChange: number;
  weekChange: number;
  monthChange: number;
  bestPerformer: { asset: string; change: number };
  worstPerformer: { asset: string; change: number };
}

interface PerformanceData {
  date: string;
  value: number;
  pnl: number;
}

export function usePortfolioPerformance() {
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 10000,
    totalPnL: 1250,
    pnlPercentage: 14.3,
    dayChange: 2.1,
    weekChange: 8.7,
    monthChange: 14.3,
    bestPerformer: { asset: 'ETH', change: 23.5 },
    worstPerformer: { asset: 'BTC', change: -5.2 }
  });

  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>(() => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: 8750 + Math.random() * 2500,
        pnl: -250 + Math.random() * 1500
      });
    }
    return data;
  });

  const calculateSharpeRatio = () => {
    const returns = performanceHistory.map(d => d.pnl / d.value);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    return avgReturn / Math.sqrt(variance);
  };

  const getDrawdown = () => {
    let maxValue = 0;
    let maxDrawdown = 0;
    
    performanceHistory.forEach(data => {
      if (data.value > maxValue) maxValue = data.value;
      const drawdown = (maxValue - data.value) / maxValue;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return maxDrawdown * 100;
  };

  return {
    metrics,
    performanceHistory,
    sharpeRatio: calculateSharpeRatio(),
    maxDrawdown: getDrawdown()
  };
}