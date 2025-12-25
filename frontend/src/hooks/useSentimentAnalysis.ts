import { useState, useEffect } from 'react';

export interface SentimentData {
    score: number; // 0-100
    label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
    trend: 'bullish' | 'bearish' | 'neutral';
    socialVolume: { time: string; volume: number }[];
    marketMomentum: number; // -100 to 100
    dominance: {
        btc: number;
        eth: number;
        others: number;
    };
}

export interface TrendingTopic {
    word: string;
    volume: number; // 1-100 scale
    sentiment: 'positive' | 'negative' | 'neutral';
}

export function useSentimentAnalysis() {
    const [sentiment, setSentiment] = useState<SentimentData | null>(null);
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data generation
    useEffect(() => {
        const generateData = () => {
            const score = Math.floor(Math.random() * (85 - 35) + 35); // Random score between 35 and 85

            let label: SentimentData['label'] = 'Neutral';
            if (score < 25) label = 'Extreme Fear';
            else if (score < 45) label = 'Fear';
            else if (score > 75) label = 'Extreme Greed';
            else if (score > 55) label = 'Greed';

            const mockVolume = Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                volume: Math.floor(Math.random() * 1000) + 500
            }));

            setSentiment({
                score,
                label,
                trend: score > 50 ? 'bullish' : 'bearish',
                socialVolume: mockVolume,
                marketMomentum: Math.floor(Math.random() * 200 - 100),
                dominance: {
                    btc: 52.4,
                    eth: 18.2,
                    others: 29.4
                }
            });

            setTrendingTopics([
                { word: 'Base', volume: 95, sentiment: 'positive' },
                { word: 'Layer2', volume: 88, sentiment: 'positive' },
                { word: 'Airdrop', volume: 76, sentiment: 'neutral' },
                { word: 'Fees', volume: 45, sentiment: 'negative' },
                { word: 'NFT', volume: 60, sentiment: 'neutral' },
                { word: 'Yield', volume: 82, sentiment: 'positive' },
            ]);

            setLoading(false);
        };

        generateData();
        // Refresh every 30s to simulate live feed
        const interval = setInterval(generateData, 30000);
        return () => clearInterval(interval);
    }, []);

    return { sentiment, trendingTopics, loading };
}
