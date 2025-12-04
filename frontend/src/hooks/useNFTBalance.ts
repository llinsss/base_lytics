import { useReadContract, useAccount } from 'wagmi';
import { useContracts } from './useContracts';

export function useNFTBalance() {
  const { address } = useAccount();
  const { addresses, abis } = useContracts();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: addresses.BaseNFT,
    abi: abis.BaseNFT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  return {
    balance: balance || 0n,
    isLoading,
    refetch
  };
}