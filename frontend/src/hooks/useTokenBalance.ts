import { useReadContract, useAccount } from 'wagmi';
import { useContracts } from './useContracts';

export function useTokenBalance() {
  const { address } = useAccount();
  const { addresses, abis } = useContracts();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: addresses.BaseToken,
    abi: abis.BaseToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  return {
    balance: balance || BigInt(0),
    isLoading,
    refetch
  };
}