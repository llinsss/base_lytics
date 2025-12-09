import { useWatchContractEvent } from 'wagmi';
import { useContracts } from './useContracts';
import { useNotifications } from '../contexts/NotificationContext';

export function useContractEvents() {
  const { addresses, abis } = useContracts();
  const { addNotification } = useNotifications();

  // Watch token transfers
  useWatchContractEvent({
    address: addresses.BaseToken,
    abi: abis.BaseToken,
    eventName: 'Transfer',
    onLogs: (logs) => {
      logs.forEach(log => {
        addNotification({ title: `Token transfer detected`, type: 'success' });
      });
    }
  });

  // Watch NFT mints
  useWatchContractEvent({
    address: addresses.BaseNFT,
    abi: abis.BaseNFT,
    eventName: 'Transfer',
    onLogs: (logs) => {
      logs.forEach(log => {
        if ((log as any).args.from === '0x0000000000000000000000000000000000000000') {
          addNotification({ title: `NFT minted!`, type: 'success' });
        }
      });
    }
  });

  // Watch staking events
  useWatchContractEvent({
    address: addresses.BaseStaking,
    abi: abis.BaseStaking,
    eventName: 'Staked',
    onLogs: (logs) => {
      logs.forEach(log => {
        addNotification({ title: `Tokens staked`, type: 'success' });
      });
    }
  });
}