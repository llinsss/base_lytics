import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TokenSupplyChartProps {
  data: Array<{
    date: string;
    tokenSupply: number;
  }>;
}

export function TokenSupplyChart({ data }: TokenSupplyChartProps) {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'tokenSupply') {
      return [value.toLocaleString(), 'Token Supply'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Token Supply Growth</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxisLabel}
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
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
            <Line 
              type="monotone" 
              dataKey="tokenSupply" 
              stroke="#0284c7" 
              strokeWidth={2}
              dot={{ fill: '#0284c7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0284c7', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}