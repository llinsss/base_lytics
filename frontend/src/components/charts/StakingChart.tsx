import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StakingChartProps {
  data: Array<{
    date: string;
    stakingTVL: number;
  }>;
  apy: number;
}

export function StakingChart({ data, apy }: StakingChartProps) {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'stakingTVL') {
      return [value.toLocaleString(), 'Total Value Locked'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Staking Analytics</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
            <Area 
              type="monotone" 
              dataKey="stakingTVL" 
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Current APY:</span>
          <span className="ml-2 font-medium text-green-600">{apy.toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-gray-600">Current TVL:</span>
          <span className="ml-2 font-medium">
            {data.length > 0 ? data[data.length - 1].stakingTVL.toLocaleString() : 0} tokens
          </span>
        </div>
      </div>
    </div>
  );
}