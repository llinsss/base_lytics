import React, { useState, useEffect } from 'react';
import { useContractLoader } from '../hooks/useContractLoader';
import { useTokenInfo, useNFTInfo, useStakingInfo } from '../hooks/useContracts';
import { useAccount } from 'wagmi';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  value?: string;
}

export function SystemHealth() {
  const { isConfigured, config } = useContractLoader();
  const { address } = useAccount();
  const tokenInfo = useTokenInfo();
  const nftInfo = useNFTInfo();
  const stakingInfo = useStakingInfo(address);
  
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    calculateHealth();
  }, [isConfigured, tokenInfo, nftInfo, stakingInfo]);

  const calculateHealth = () => {
    const metrics: HealthMetric[] = [];

    // Contract deployment health
    if (!isConfigured) {
      metrics.push({
        name: 'Contract Deployment',
        status: 'error',
        message: 'Contracts not properly deployed or configured'
      });
    } else {
      metrics.push({
        name: 'Contract Deployment',
        status: 'healthy',
        message: 'All contracts deployed successfully'
      });
    }

    // Token supply health
    if (tokenInfo.totalSupply && tokenInfo.maxSupply) {
      const utilization = Number((tokenInfo.totalSupply * 100n) / tokenInfo.maxSupply);
      if (utilization > 90) {
        metrics.push({
          name: 'Token Supply',
          status: 'warning',
          message: 'Token supply utilization high',
          value: `${utilization.toFixed(1)}%`
        });
      } else {
        metrics.push({
          name: 'Token Supply',
          status: 'healthy',
          message: 'Token supply within normal range',
          value: `${utilization.toFixed(1)}%`
        });
      }
    }

    // NFT minting health
    if (nftInfo.paused) {
      metrics.push({
        name: 'NFT Minting',
        status: 'warning',
        message: 'NFT contract is paused'
      });
    } else if (!nftInfo.mintingEnabled) {
      metrics.push({
        name: 'NFT Minting',
        status: 'warning',
        message: 'NFT minting is disabled'
      });
    } else {
      metrics.push({
        name: 'NFT Minting',
        status: 'healthy',
        message: 'NFT minting is active'
      });
    }

    // Staking health
    if (stakingInfo.rewardRate < 50) {
      metrics.push({
        name: 'Staking Rewards',
        status: 'warning',
        message: 'Low staking reward rate',
        value: `${stakingInfo.apy.toFixed(2)}% APY`
      });
    } else {
      metrics.push({
        name: 'Staking Rewards',
        status: 'healthy',
        message: 'Staking rewards active',
        value: `${stakingInfo.apy.toFixed(2)}% APY`
      });
    }

    setHealthMetrics(metrics);

    // Calculate overall health
    const errorCount = metrics.filter(m => m.status === 'error').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;

    if (errorCount > 0) {
      setOverallHealth('error');
    } else if (warningCount > 0) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('healthy');
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  };

  const getHealthColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
    }
  };

  const healthScore = Math.round(
    (healthMetrics.filter(m => m.status === 'healthy').length / healthMetrics.length) * 100
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">System Health</h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getHealthIcon(overallHealth)}</span>
          <span className={`font-bold ${getHealthColor(overallHealth)}`}>
            {healthScore}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getHealthIcon(metric.status)}</span>
              <div>
                <h3 className="font-medium">{metric.name}</h3>
                <p className="text-sm text-gray-600">{metric.message}</p>
              </div>
            </div>
            {metric.value && (
              <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                {metric.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {config && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Network</p>
              <p className="font-medium">{config.network}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Check</p>
              <p className="font-medium">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}