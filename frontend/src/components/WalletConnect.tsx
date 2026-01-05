import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance, useEnsName } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { useWalletPersistence } from '../hooks/useWalletPersistence';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useNotifications } from '../contexts/NotificationContext';

export function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const { data: ensName } = useEnsName({ address, chainId: 1 }); // Check ENS on mainnet
  const { copy, copied } = useCopyToClipboard();
  const { addNotification } = useNotifications();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  useWalletPersistence();

  const supportedChains = [base, baseSepolia];
  const currentChain = supportedChains.find(chain => chain.id === chainId);
  const isWrongNetwork = isConnected && !currentChain;

  // Note: Auto-switching networks can be intrusive, so we'll just show a warning
  // Users can manually switch using the dropdown in the account menu

  // Handle connection errors
  React.useEffect(() => {
    if (connectError) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: connectError.message || 'Failed to connect wallet',
        duration: 5000, 
      });
    }
  }, [connectError, addNotification]);

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copy(address);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Address Copied',
          message: 'Wallet address copied to clipboard',
          duration: 2000,
        });
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem('baselytics_wallet_connected');
    setShowAccountMenu(false);
    addNotification({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'You have been disconnected',
      duration: 3000,
    });
  };

  const getConnectorIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) return '🦊';
    if (name.includes('coinbase')) return '🔷';
    if (name.includes('walletconnect')) return '🔗';
    if (name.includes('injected')) return '💼';
    return '🔐';
  };

  const getConnectorDisplayName = (connector: any) => {
    if (connector.name === 'Injected') {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum;
        if (provider.isMetaMask) return 'MetaMask';
        if (provider.isCoinbaseWallet) return 'Coinbase Wallet';
        return 'Injected Wallet';
      }
      return 'Browser Wallet';
    }
    return connector.name;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-100 hover:bg-base-200 dark:bg-base-700 dark:hover:bg-base-600 transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-base-700 dark:text-white">
              {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
            {balance && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </span>
            )}
          </div>
          {isWrongNetwork && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
              Wrong Network
            </span>
          )}
        </button>

        {showAccountMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowAccountMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Connected Wallet
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {connector?.name || 'Unknown'}
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {address}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy address"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              {isWrongNetwork && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Wrong Network
                  </div>
                  <select
                    onChange={(e) => {
                      const chainId = Number(e.target.value);
                      if (chainId) {
                        switchChain({ chainId });
                      }
                    }}
                    disabled={isSwitching}
                    className="w-full text-sm px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Network</option>
                    {supportedChains.map(chain => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                  </select>
                  {isSwitching && (
                    <div className="mt-2 text-xs text-gray-500">Switching...</div>
                  )}
                </div>
              )}

              {balance && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Balance
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                  </div>
                </div>
              )}

              <div className="p-2">
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowWalletModal(true)}
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Connect Wallet
              </h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Connect your wallet to interact with BaseLytics contracts
            </p>

            <div className="space-y-2">
              {connectors.map((connector) => {
                const isReady = connector.uid !== 'injected' || (typeof window !== 'undefined' && (window as any).ethereum);
                const displayName = getConnectorDisplayName(connector);
                
                return (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      setShowWalletModal(false);
                    }}
                    disabled={!isReady || isPending}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-base-500 dark:hover:border-base-500 hover:bg-base-50 dark:hover:bg-base-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{getConnectorIcon(connector.name)}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {connector.name === 'Injected' 
                          ? 'Connect using your browser wallet'
                          : 'Connect using WalletConnect'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By connecting, you agree to BaseLytics Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ConnectWalletPrompt() {
  const { isConnected } = useAccount();

  if (isConnected) return null;

  return (
    <div className="card text-center">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Connect Your Wallet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Connect your wallet to interact with BaseLytics contracts
      </p>
      <WalletConnect />
    </div>
  );
}
