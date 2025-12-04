import React from 'react';

interface BalanceChartProps {
  data: { date: string; balance: number }[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  const maxBalance = Math.max(...data.map(d => d.balance));
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Balance History</h3>
      <div className="h-48 flex items-end justify-between gap-1">
        {data.map((point, index) => (
          <div
            key={index}
            className="bg-base-500 rounded-t flex-1 min-w-0"
            style={{ height: `${(point.balance / maxBalance) * 100}%` }}
            title={`${point.date}: ${point.balance}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}