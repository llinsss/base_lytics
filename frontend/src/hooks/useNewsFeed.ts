import { useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
}

export function useNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Base Network Sees Record TVL Growth',
      summary: 'Total value locked on Base reaches new all-time high as DeFi adoption accelerates.',
      url: '#',
      source: 'CoinDesk',
      publishedAt: new Date(Date.now() - 1000 * 60 * 30),
      sentiment: 'positive',
      tags: ['Base', 'DeFi', 'TVL']
    },
    {
      id: '2',
      title: 'Ethereum Layer 2 Solutions Gain Momentum',
      summary: 'Layer 2 networks including Base show significant transaction volume increases.',
      url: '#',
      source: 'The Block',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      sentiment: 'positive',
      tags: ['Ethereum', 'Layer2', 'Scaling']
    },
    {
      id: '3',
      title: 'DeFi Yields Remain Attractive Despite Market Volatility',
      summary: 'Staking and liquidity provision continue to offer competitive returns.',
      url: '#',
      source: 'DeFi Pulse',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      sentiment: 'neutral',
      tags: ['DeFi', 'Yields', 'Staking']
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filteredNews = news.filter(item => 
    filter === 'all' || item.tags.some(tag => 
      tag.toLowerCase().includes(filter.toLowerCase())
    )
  );

  const refreshNews = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return { news: filteredNews, filter, setFilter, loading, refreshNews };
}