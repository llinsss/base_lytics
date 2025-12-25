import React from 'react';
import { useSentimentAnalysis, SentimentData, TrendingTopic } from '../hooks/useSentimentAnalysis';

export function SentimentDashboard() {
    const { sentiment, trendingTopics, loading } = useSentimentAnalysis();

    if (loading || !sentiment) {
        return <div className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 1. Fear & Greed Meter */}
            <FearAndGreedCard sentiment={sentiment} />

            {/* 2. Sentiment Trend Chart */}
            <SentimentChartCard data={sentiment.socialVolume} />

            {/* 3. Trending Topics (Word Cloud alternative) */}
            <TrendingTopicsCard topics={trendingTopics} />
        </div>
    );
}

// Sub-component: Fear & Greed
function FearAndGreedCard({ sentiment }: { sentiment: SentimentData }) {
    const getGradient = (score: number) => {
        // Simple logic: Red (0) -> Yellow (50) -> Green (100)
        // We can just use a fixed background gradient and move a marker
        return 'linear-gradient(90deg, #ef4444 0%, #eab308 50%, #22c55e 100%)';
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">😨 Fear & Greed Index</h3>
            <div className="flex flex-col items-center justify-center py-4">
                <div className="text-4xl font-bold mb-2 dark:text-white">{sentiment.score}</div>
                <div className={`text-lg font-medium mb-4 ${sentiment.score < 40 ? 'text-red-500' :
                        sentiment.score > 60 ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                    {sentiment.label}
                </div>

                {/* Meter Bar */}
                <div className="w-full h-4 rounded-full relative overflow-hidden" style={{ background: getGradient(sentiment.score) }}>
                    {/* Indicator Line */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white border border-gray-400 shadow-md transform -translate-x-1/2 transition-all duration-500 ease-out"
                        style={{ left: `${sentiment.score}%` }}
                    />
                </div>
                <div className="w-full flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fear (0)</span>
                    <span>Greed (100)</span>
                </div>
            </div>
        </div>
    );
}

// Sub-component: Sentiment Chart (Simple SVG Line Chart)
function SentimentChartCard({ data }: { data: SentimentData['socialVolume'] }) {
    if (!data?.length) return null;

    const height = 120;
    const width = 300; // viewBox width
    const maxVal = Math.max(...data.map(d => d.volume));
    const minVal = Math.min(...data.map(d => d.volume));
    const range = maxVal - minVal || 1;

    // Generate path
    // X step
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
        const x = i * stepX;
        // Normalize Y (flip because SVG 0 is top)
        const yNormalized = (d.volume - minVal) / range;
        const y = height - (yNormalized * height);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">📊 Social Volume Trend</h3>
            <div className="w-full h-40 flex items-center justify-center">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area under curve (make a closed path) */}
                    <path
                        d={`M 0,${height} ${points} L ${width},${height} Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Line */}
                    <path
                        d={`M ${points}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
                Last 24 Hours
            </div>
        </div>
    );
}

// Sub-component: Trending Topics
function TrendingTopicsCard({ topics }: { topics: TrendingTopic[] }) {
    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">🔥 Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
                {topics.map((t, i) => (
                    <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-default ${t.sentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' :
                                t.sentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' :
                                    'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                            }`}
                    >
                        {t.word}
                        {t.sentiment === 'positive' && ' ↗'}
                        {t.sentiment === 'negative' && ' ↘'}
                    </span>
                ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
                AI-analyzed keywords from social media.
            </div>
        </div>
    );
}
