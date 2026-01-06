import { useState } from 'react';

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  name: string;
  values: { time: string; value: number }[];
  color: string;
}

export function useAdvancedCharts() {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | '1d'>('1h');
  const [indicators, setIndicators] = useState<string[]>(['SMA', 'RSI']);

  const [candlestickData] = useState<CandlestickData[]>(() => {
    const data = [];
    let price = 2000;
    
    for (let i = 100; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000).toISOString();
      const open = price;
      const change = (Math.random() - 0.5) * 100;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      const volume = 1000 + Math.random() * 5000;
      
      data.push({ time, open, high, low, close, volume });
      price = close;
    }
    
    return data;
  });

  const calculateSMA = (period: number): TechnicalIndicator => {
    const values = [];
    for (let i = period - 1; i < candlestickData.length; i++) {
      const sum = candlestickData.slice(i - period + 1, i + 1)
        .reduce((acc, candle) => acc + candle.close, 0);
      values.push({
        time: candlestickData[i].time,
        value: sum / period
      });
    }
    return { name: `SMA(${period})`, values, color: '#ff6b6b' };
  };

  const calculateRSI = (period: number = 14): TechnicalIndicator => {
    const values = [];
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < candlestickData.length; i++) {
      const change = candlestickData[i].close - candlestickData[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
      
      if (i >= period) {
        const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        values.push({
          time: candlestickData[i].time,
          value: rsi
        });
      }
    }
    
    return { name: 'RSI(14)', values, color: '#4ecdc4' };
  };

  const getIndicatorData = (): TechnicalIndicator[] => {
    const result = [];
    if (indicators.includes('SMA')) result.push(calculateSMA(20));
    if (indicators.includes('RSI')) result.push(calculateRSI());
    return result;
  };

  const toggleIndicator = (indicator: string) => {
    setIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  return {
    candlestickData,
    timeframe,
    setTimeframe,
    indicators,
    toggleIndicator,
    indicatorData: getIndicatorData()
  };
}