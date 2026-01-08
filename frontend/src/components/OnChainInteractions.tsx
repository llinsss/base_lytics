import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useNotifications } from '../contexts/NotificationContext';

// Real contract ABIs for on-chain interactions
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

const FAUCET_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  }
] as const;

export function OnChainInteractions() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Base mainnet contracts (real addresses)
  const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet USDC
  const WETH_CONTRACT = '0x4200000000000000000000000000000000000006'; // Base mainnet WETH

  // Read user's USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_CONTRACT,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  React.useEffect(() => {
    if (isSuccess) {
      addNotification({
        title: '✅ Transaction Confirmed',
        message: 'Your on-chain transaction was successful!',
        type: 'success'
      });
    }
  }, [isSuccess, addNotification]);

  const wrapETH = async () => {
    if (!amount) return;

    try {
      await writeContract({
        address: WETH_CONTRACT,
        abi: [{
          name: 'deposit',
          type: 'function',
          stateMutability: 'payable',
          inputs: []
        }],
        functionName: 'deposit',
        value: parseEther(amount)
      });

      addNotification({
        title: '🔄 WETH Wrap Submitted',
        message: `Wrapping ${amount} ETH to WETH`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Wrap Failed',
        message: error.message || 'Failed to wrap ETH',
        type: 'error'
      });
    }
  };

  const transferUSDC = async () => {
    if (!recipient || !amount) {
      addNotification({
        title: 'Invalid Input',
        message: 'Please enter recipient and amount',
        type: 'error'
      });
      return;
    }

    try {
      await writeContract({
        address: USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseEther(amount)]
      });

      addNotification({
        title: '💸 USDC Transfer Submitted',
        message: `Transferring ${amount} USDC to ${recipient.slice(0, 6)}...`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Transfer Failed',
        message: error.message || 'Failed to transfer USDC',
        type: 'error'
      });
    }
  };

  const approveUSDC = async () => {
    if (!amount) return;

    try {
      await writeContract({
        address: USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [WETH_CONTRACT, parseEther(amount)]
      });

      addNotification({
        title: '✅ USDC Approval Submitted',
        message: `Approving ${amount} USDC for contract use`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Approval Failed',
        message: error.message || 'Failed to approve USDC',
        type: 'error'
      });
    }
  };

  const sendETH = async () => {
    if (!recipient || !amount) return;

    try {
      await writeContract({
        address: recipient as `0x${string}`,
        abi: [],
        functionName: 'fallback',
        value: parseEther(amount)
      });

      addNotification({
        title: '⚡ ETH Transfer Submitted',
        message: `Sending ${amount} ETH to ${recipient.slice(0, 6)}...`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'ETH Transfer Failed',
        message: error.message || 'Failed to send ETH',
        type: 'error'
      });
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 dark:text-white">⛓️ Base Mainnet Interactions</h3>
      
      <div className="space-y-6">
        {/* Balance Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 dark:text-white">Your Balances</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">USDC Balance</p>
              <p className="font-bold dark:text-white">
                {usdcBalance ? formatEther(usdcBalance as bigint) : '0.00'} USDC
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Network</p>
              <p className="font-bold text-blue-500">Base Mainnet</p>
            </div>
          </div>
        </div>

        {/* WETH Wrapping Section */}
        <div>
          <h4 className="font-semibold mb-3 dark:text-white">🔄 Wrap ETH to WETH</h4>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              placeholder="ETH amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input flex-1"
            />
            <button
              onClick={wrapETH}
              disabled={isPending || isConfirming || !amount}
              className="btn-primary disabled:opacity-50"
            >
              {isPending || isConfirming ? 'Wrapping...' : 'Wrap ETH'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Convert ETH to WETH (Wrapped Ethereum) for DeFi use
          </p>
        </div>

        {/* Transfer Section */}
        <div>
          <h4 className="font-semibold mb-3 dark:text-white">💸 Transfer Tokens</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Recipient address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input w-full"
            />
            <input
              type="number"
              step="0.001"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={transferUSDC}
                disabled={isPending || isConfirming || !recipient || !amount}
                className="btn-primary disabled:opacity-50"
              >
                Transfer USDC
              </button>
              <button
                onClick={sendETH}
                disabled={isPending || isConfirming || !recipient || !amount}
                className="btn-secondary disabled:opacity-50"
              >
                Send ETH
              </button>
            </div>
          </div>
        </div>

        {/* Approval Section */}
        <div>
          <h4 className="font-semibold mb-3 dark:text-white">✅ Token Approvals</h4>
          <button
            onClick={approveUSDC}
            disabled={isPending || isConfirming || !amount}
            className="btn-secondary w-full disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Approving...' : `Approve ${amount} USDC`}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Approve contract to spend your USDC tokens
          </p>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
              Transaction Submitted
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400 mb-2">
              Hash: <code className="text-xs break-all">{hash}</code>
            </p>
            <a
              href={`https://basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View on BaseScan →
            </a>
            {isConfirming && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                ⏳ Waiting for confirmation...
              </p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✅ Transaction confirmed!
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 dark:text-white">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => setRecipient(address || '')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Self Transfer
            </button>
            <button
              onClick={() => setAmount('0.001')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Set 0.001
            </button>
            <button
              onClick={() => setRecipient('0x742d35Cc6634C0532925a3b8D0C9e3e0C0e0e0e0')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Test Address
            </button>
            <button
              onClick={() => setAmount('0.01')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Set 0.01
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}