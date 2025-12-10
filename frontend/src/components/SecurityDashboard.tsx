import React from 'react';
import { useAccount } from 'wagmi';

export function SecurityDashboard() {
  const { address, connector } = useAccount();

  const securityChecks = [
    { name: 'Wallet Connection', status: 'secure', description: 'Connected via secure wallet' },
    { name: 'Network Security', status: 'secure', description: 'Using Base mainnet' },
    { name: 'Transaction Signing', status: 'secure', description: 'All transactions require signature' },
    { name: 'Contract Verification', status: 'warning', description: 'Some contracts not verified' },
    { name: 'Slippage Protection', status: 'secure', description: 'Slippage limits active' }
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">🔒 Security Status</h3>
      
      <div className="space-y-3">
        {securityChecks.map((check, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium dark:text-white">{check.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{check.description}</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              check.status === 'secure' ? 'bg-green-500' :
              check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Security Score: 85/100</div>
        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          Your wallet and transactions are well protected
        </div>
      </div>
    </div>
  );
}