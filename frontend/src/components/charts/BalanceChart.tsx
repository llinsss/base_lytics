import React, { useMemo } from 'react';

interface BalanceChartProps {
  data: { date: string; balance: number }[];
}

export const BalanceChart = React.memo(function BalanceChart({ data }: BalanceChartProps) {
  const maxBalance = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.balance), 1);
  }, [data]);

  const chartBars = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      height: (point.balance / maxBalance) * 100,
      index,
    }));
  }, [data, maxBalance]);
  
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Balance History</h3>
      <div className="h-48 flex items-end justify-between gap-1">
        {chartBars.map((bar) => (
          <div
            key={bar.index}
            className="bg-base-500 rounded-t flex-1 min-w-0"
            style={{ height: `${bar.height}%` }}
            title={`${bar.date}: ${bar.balance}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
});