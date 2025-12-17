import React, { useState } from 'react';

export function ActivityFeed() {
  const [filter, setFilter] = useState('all');
  
  const activities = [
    { id: '1', type: 'swap', asset: 'ETH → BLT', amount: '1.5 ETH', status: 'completed', timestamp: Date.now() - 300000 },
    { id: '2', type: 'stake', asset: 'BLT', amount: '1000 BLT', status: 'completed', timestamp: Date.now() - 600000 },
    { id: '3', type: 'mint', asset: 'Base NFT #123', amount: '0.01 ETH', status: 'completed', timestamp: Date.now() - 900000 },
    { id: '4', type: 'bridge', asset: 'ETH', amount: '0.5 ETH', status: 'pending', timestamp: Date.now() - 1200000 },
    { id: '5', type: 'vote', asset: 'Proposal #2', amount: '500 BLT', status: 'completed', timestamp: Date.now() - 1800000 }
  ];

  const filteredActivities = filter === 'all' ? activities : activities.filter(a => a.type === filter);

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['all', 'swap', 'stake', 'mint', 'bridge', 'vote'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg capitalize ${filter === type ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Activity</h2>
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'swap' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'stake' ? 'bg-green-100 text-green-600' :
                  activity.type === 'mint' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'bridge' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'swap' ? '🔄' :
                   activity.type === 'stake' ? '🏦' :
                   activity.type === 'mint' ? '🎨' :
                   activity.type === 'bridge' ? '🌉' : '🗳️'}
                </div>
                <div>
                  <div className="font-medium dark:text-white capitalize">{activity.type}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{activity.asset}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium dark:text-white">{activity.amount}</div>
                <div className={`text-xs px-2 py-1 rounded ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}