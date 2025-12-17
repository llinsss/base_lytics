import React from 'react';

export function SystemHealth() {
  const healthMetrics = [
    { name: 'API Response Time', value: '45ms', status: 'good' },
    { name: 'Database Connection', value: '99.9%', status: 'good' },
    { name: 'Memory Usage', value: '67%', status: 'warning' },
    { name: 'CPU Usage', value: '23%', status: 'good' }
  ];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 dark:text-white">System Health</h2>
      <div className="space-y-3">
        {healthMetrics.map((metric) => (
          <div key={metric.name} className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">{metric.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium dark:text-white">{metric.value}</span>
              <div className={`w-3 h-3 rounded-full ${
                metric.status === 'good' ? 'bg-green-500' :
                metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}