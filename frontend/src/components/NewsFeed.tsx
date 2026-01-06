import React from 'react';
import { useNewsFeed } from '../hooks/useNewsFeed';

export function NewsFeed() {
  const { news, filter, setFilter, loading, refreshNews } = useNewsFeed();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold dark:text-white">Crypto News</h3>
        <button
          onClick={refreshNews}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          {loading ? '⟳' : '🔄'} Refresh
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-full"
        >
          <option value="all">All News</option>
          <option value="base">Base Network</option>
          <option value="defi">DeFi</option>
          <option value="ethereum">Ethereum</option>
          <option value="staking">Staking</option>
        </select>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {news.map(item => (
          <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium dark:text-white text-sm leading-tight">
                {item.title}
              </h4>
              <span className={`text-lg ${getSentimentColor(item.sentiment)}`}>
                {getSentimentIcon(item.sentiment)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {item.summary}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.publishedAt.toLocaleTimeString()}</span>
              </div>
              <div className="flex gap-1">
                {item.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}