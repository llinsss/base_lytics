import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';

interface ContractConfig {
  network: string;
  chainId: number;
  contracts: Record<string, `0x${string}`>;
  timestamp: string;
  deployer?: string;
}

export function useContractLoader() {
  const [config, setConfig] = useState<ContractConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chainId = useChainId();

  useEffect(() => {
    loadContractConfig();
  }, [chainId]);

  const loadContractConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load the generated config
      try {
        const { CONTRACT_ADDRESSES } = await import('../config/contracts');

        if (chainId && CONTRACT_ADDRESSES[chainId]) {
          setConfig({
            network: 'configured',
            chainId,
            contracts: CONTRACT_ADDRESSES[chainId] as unknown as Record<string, `0x${string}`>,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Fallback to defaults handled in catch or distinct block
          throw new Error("No config for chain");
        }
      } catch (importError) {
        // Fallback to default addresses if config doesn't exist
        console.warn('Contract config not found, using defaults');
        setConfig({
          network: 'unknown',
          chainId: chainId || 84532,
          contracts: {
            BaseToken: '0x0000000000000000000000000000000000000000',
            BaseNFT: '0x0000000000000000000000000000000000000000',
            BaseStaking: '0x0000000000000000000000000000000000000000',
          },
          timestamp: new Date().toISOString(),
        });
        setError('Contract addresses not configured. Run deployment first.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const getContractAddress = (contractName: string): `0x${string}` => {
    if (!config || !config.contracts[contractName]) {
      return '0x0000000000000000000000000000000000000000';
    }
    return config.contracts[contractName] as `0x${string}`;
  };

  const isConfigured = () => {
    return config && Object.values(config.contracts).some(
      addr => addr !== '0x0000000000000000000000000000000000000000'
    );
  };

  return {
    config,
    loading,
    error,
    getContractAddress,
    isConfigured: isConfigured(),
    reload: loadContractConfig,
  };
}