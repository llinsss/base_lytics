import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useContracts } from './useContracts';
import { useNotifications } from '../contexts/NotificationContext';
import { parseEther } from 'viem';

export function useNFTMint() {
  const { addresses, abis } = useContracts();
  const { addNotification } = useNotifications();
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const mint = async (to: string) => {
    try {
      addNotification('Minting NFT...', 'info');
      await writeContract({
        address: addresses.BaseNFT,
        abi: abis.BaseNFT,
        functionName: 'mint',
        args: [to],
        value: parseEther('0.01') // 0.01 ETH mint price
      });
    } catch (error) {
      addNotification('Mint failed', 'error');
    }
  };

  return { mint, isPending, isConfirming };
}