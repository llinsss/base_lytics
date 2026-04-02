import { useEffect, useState } from 'react';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    const miniPay = typeof window !== 'undefined' && (window as any).ethereum?.isMiniPay;
    setIsMiniPay(!!miniPay);

    if (miniPay && !isConnected) {
      connect({ connector: injected() });
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (isMiniPay) {
      switchChain({ chainId: celo.id });
    }
  }, [isMiniPay, switchChain]);

  return { isMiniPay };
}
