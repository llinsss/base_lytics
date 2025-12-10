import { useState, useEffect } from 'react';
import { useTokenBalance, useStaking } from './index';

interface RiskScore {
  score: number;
  level: 'Low' | 'Medium' | 'High';
  factors: string[];
}

interface Prediction {
  timeframe: string;
  prediction: number;
  confidence: number;
}

export function useAIAnalytics() {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { balance } = useTokenBalance();
  const { stakedBalance } = useStaking();

  useEffect(() => {
    // Mock AI analysis
    const calculateRisk = () => {
      const totalValue = Number(balance + stakedBalance);
      const stakingRatio = Number(stakedBalance) / totalValue;
      
      let score = 50;
      const factors = [];
      
      if (stakingRatio > 0.8) {
        score += 20;
        factors.push('High staking concentration');
      }
      if (totalValue < 100) {
        score -= 10;
        factors.push('Low portfolio value');
      }
      if (stakingRatio < 0.2) {
        score -= 15;
        factors.push('Underutilized staking');
      }

      const level = score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
      
      setRiskScore({ score, level, factors });
    };

    const generatePredictions = () => {
      setPredictions([
        { timeframe: '1 week', prediction: 1.05, confidence: 0.75 },
        { timeframe: '1 month', prediction: 1.15, confidence: 0.65 },
        { timeframe: '3 months', prediction: 1.35, confidence: 0.45 }
      ]);
    };

    const generateRecommendations = () => {
      const recs = [];
      const stakingRatio = Number(stakedBalance) / Number(balance + stakedBalance);
      
      if (stakingRatio < 0.3) {
        recs.push('Consider staking more tokens for higher yields');
      }
      if (Number(balance) > 1000) {
        recs.push('Diversify into NFTs for portfolio balance');
      }
      recs.push('Monitor gas fees for optimal transaction timing');
      
      setRecommendations(recs);
    };

    calculateRisk();
    generatePredictions();
    generateRecommendations();
  }, [balance, stakedBalance]);

  return { riskScore, predictions, recommendations };
}