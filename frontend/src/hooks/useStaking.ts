import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useContracts } from './useContracts';
import { useNotifications } from '../contexts/NotificationContext';

export function useStaking() {
  const { address } = useAccount();
  const { addresses, abis } = useContracts();
  const { addNotification } = useNotifications();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const { data: stakedBalance, refetch } = useReadContract({
    address: addresses.BaseStaking,
    abi: abis.BaseStaking,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const stake = async (amount: bigint) => {
    try {
      addNotification('Staking tokens...', 'info');
      await writeContract({
        address: addresses.BaseStaking,
        abi: abis.BaseStaking,
        functionName: 'stake',
        args: [amount]
      });
    } catch (error) {
      addNotification('Staking failed', 'error');
    }
  };

  const unstake = async (amount: bigint) => {
    try {
      addNotification('Unstaking tokens...', 'info');
      await writeContract({
        address: addresses.BaseStaking,
        abi: abis.BaseStaking,
        functionName: 'unstake',
        args: [amount]
      });
    } catch (error) {
      addNotification('Unstaking failed', 'error');
    }
  };

  return {
    stakedBalance: stakedBalance || 0n,
    stake,
    unstake,
    isPending,
    isConfirming,
    refetch
  };
}