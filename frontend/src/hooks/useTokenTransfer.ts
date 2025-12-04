import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useContracts } from './useContracts';
import { useNotifications } from '../contexts/NotificationContext';

export function useTokenTransfer() {
  const { addresses, abis } = useContracts();
  const { addNotification } = useNotifications();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const transfer = async (to: string, amount: bigint) => {
    try {
      addNotification('Transaction pending...', 'info');
      await writeContract({
        address: addresses.BaseToken,
        abi: abis.BaseToken,
        functionName: 'transfer',
        args: [to, amount]
      });
    } catch (error) {
      addNotification('Transfer failed', 'error');
    }
  };

  return { transfer, isPending, isConfirming };
}