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
      addNotification({ title: 'Staking tokens...', type: 'info' });
      await writeContract({
        address: addresses.BaseStaking,
        abi: abis.BaseStaking,
        functionName: 'stake',
        args: [amount]
      });
    } catch (error) {
      addNotification({ title: 'Staking failed', type: 'error' });
    }
  };

  const unstake = async (amount: bigint) => {
    try {
      addNotification({ title: 'Unstaking tokens...', type: 'info' });
      await writeContract({
        address: addresses.BaseStaking,
        abi: abis.BaseStaking,
        functionName: 'unstake',
        args: [amount]
      });
    } catch (error) {
      addNotification({ title: 'Unstaking failed', type: 'error' });
    }
  };

  return {
    stakedBalance: stakedBalance || BigInt(0),
    stake,
    unstake,
    isPending,
    isConfirming,
    refetch
  };
}