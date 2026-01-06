import React, { useState } from 'react';

interface GasData {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  baseFee: number;
  priorityFee: number;
}

interface GasHistory {
  timestamp: Date;
  price: number;
}

export function useGasTracker() {
  const [gasData, setGasData] = useState<GasData>({
    slow: 15,
    standard: 25,
    fast: 35,
    instant: 50,
    baseFee: 12,
    priorityFee: 2
  });

  const [gasHistory, setGasHistory] = useState<GasHistory[]>(() => {
    const history = [];
    for (let i = 24; i >= 0; i--) {
      history.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        price: 20 + Math.random() * 30
      });
    }
    return history;
  });

  const [alerts, setAlerts] = useState<{ threshold: number; enabled: boolean }>({
    threshold: 20,
    enabled: false
  });

  // Simulate real-time gas price updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      const basePrice = 20 + Math.random() * 30;
      setGasData({
        slow: Math.round(basePrice * 0.8),
        standard: Math.round(basePrice),
        fast: Math.round(basePrice * 1.3),
        instant: Math.round(basePrice * 1.8),
        baseFee: Math.round(basePrice * 0.7),
        priorityFee: Math.round(basePrice * 0.2)
      });

      setGasHistory(prev => [
        ...prev.slice(-23),
        { timestamp: new Date(), price: basePrice }
      ]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const estimateTransactionCost = (gasLimit: number, speed: keyof GasData) => {
    const gasPrice = gasData[speed];
    const costInGwei = gasLimit * gasPrice;
    const costInEth = costInGwei / 1e9;
    const costInUsd = costInEth * 2000; // Assume ETH = $2000
    
    return {
      gwei: costInGwei,
      eth: costInEth,
      usd: costInUsd
    };
  };

  const getOptimalGasPrice = () => {
    const current = gasData.standard;
    const avg24h = gasHistory.reduce((sum, h) => sum + h.price, 0) / gasHistory.length;
    
    if (current < avg24h * 0.8) return 'low';
    if (current > avg24h * 1.2) return 'high';
    return 'normal';
  };

  const setGasAlert = (threshold: number, enabled: boolean) => {
    setAlerts({ threshold, enabled });
  };

  return {
    gasData,
    gasHistory,
    alerts,
    estimateTransactionCost,
    getOptimalGasPrice,
    setGasAlert
  };
}