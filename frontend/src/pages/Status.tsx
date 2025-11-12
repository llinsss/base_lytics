import React from 'react';
import { ContractStatus } from '../components/ContractStatus';
import { SystemHealth } from '../components/SystemHealth';
import { NetworkStatus } from '../components/NetworkStatus';

export function Status() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-gray-600">Monitor contract deployment, system health, and network status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SystemHealth />
        <NetworkStatus />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ContractStatus />
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="btn-secondary text-center p-4">
            <div className="text-2xl mb-2">🔄</div>
            <div className="text-sm">Refresh All</div>
          </button>
          <button className="btn-secondary text-center p-4">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">View Analytics</div>
          </button>
          <button className="btn-secondary text-center p-4">
            <div className="text-2xl mb-2">⚙️</div>
            <div className="text-sm">Settings</div>
          </button>
          <button className="btn-secondary text-center p-4">
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">Export Report</div>
          </button>
        </div>
      </div>
    </div>
  );
}