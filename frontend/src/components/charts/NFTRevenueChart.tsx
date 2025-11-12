import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NFTRevenueChartProps {
  data: Array<{
    date: string;
    nftMinted: number;
  }>;
  mintPrice: number;
}

export function NFTRevenueChart({ data, mintPrice }: NFTRevenueChartProps) {
  const chartData = data.map(item => ({
    ...item,
    revenue: item.nftMinted * mintPrice
  }));

  const formatTooltip = (value: number, name: string) => {
    if (name === 'nftMinted') {
      return [value, 'NFTs Minted'];
    }
    if (name === 'revenue') {
      return [`${value.toFixed(4)} ETH`, 'Revenue'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">NFT Minting & Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="nftMinted" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Mint Price:</span>
          <span className="ml-2 font-medium">{mintPrice.toFixed(4)} ETH</span>
        </div>
        <div>
          <span className="text-gray-600">Total Revenue:</span>
          <span className="ml-2 font-medium">
            {(chartData.reduce((sum, item) => sum + item.revenue, 0)).toFixed(4)} ETH
          </span>
        </div>
      </div>
    </div>
  );
}