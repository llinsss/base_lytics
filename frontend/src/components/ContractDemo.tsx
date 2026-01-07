import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useNotifications } from '../contexts/NotificationContext';

export function ContractDemo() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const [amount, setAmount] = useState('1');
  const [recipient, setRecipient] = useState('');

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  // Mock contract addresses for demo
  const TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890';
  const STAKING_ADDRESS = '0x2345678901234567890123456789012345678901';

  const mintTokens = async () => {
    try {
      await writeContract({
        address: TOKEN_ADDRESS,
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ]
          }
        ],
        functionName: 'mint',
        args: [address!, parseEther(amount)]
      });

      addNotification({
        title: 'Transaction Submitted',
        message: `Minting ${amount} BLT tokens`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Transaction Failed',
        message: error.message || 'Failed to mint tokens',
        type: 'error'
      });
    }
  };

  const stakeTokens = async () => {
    try {
      await writeContract({
        address: STAKING_ADDRESS,
        abi: [
          {
            name: 'stake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'amount', type: 'uint256' }]
          }
        ],
        functionName: 'stake',
        args: [parseEther(amount)]
      });

      addNotification({
        title: 'Staking Transaction Submitted',
        message: `Staking ${amount} BLT tokens`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Staking Failed',
        message: error.message || 'Failed to stake tokens',
        type: 'error'
      });
    }
  };

  const transferTokens = async () => {
    if (!recipient) {
      addNotification({
        title: 'Invalid Input',
        message: 'Please enter recipient address',
        type: 'error'
      });
      return;
    }

    try {
      await writeContract({
        address: TOKEN_ADDRESS,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ]
          }
        ],
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseEther(amount)]
      });

      addNotification({
        title: 'Transfer Submitted',
        message: `Transferring ${amount} BLT to ${recipient.slice(0, 6)}...`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Transfer Failed',
        message: error.message || 'Failed to transfer tokens',
        type: 'error'
      });
    }
  };

  const simulateTrading = async () => {
    // Simulate multiple trading transactions
    const trades = [
      { tokenA: 'ETH', tokenB: 'USDC', amountA: '0.1', amountB: '200' },
      { tokenA: 'USDC', tokenB: 'DAI', amountA: '100', amountB: '100' },
      { tokenA: 'DAI', tokenB: 'ETH', amountA: '50', amountB: '0.025' }
    ];

    for (const trade of trades) {
      try {
        // Simulate trading contract call
        addNotification({
          title: 'Trade Executed',
          message: `Swapped ${trade.amountA} ${trade.tokenA} for ${trade.amountB} ${trade.tokenB}`,
          type: 'success'
        });
        
        // Small delay between trades
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Trade simulation error:', error);
      }
    }

    addNotification({
      title: 'Trading Session Complete',
      message: 'Completed 3 trades - check your rewards!',
      type: 'success'
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 dark:text-white">Contract Interactions</h3>
      
      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input w-full"
            placeholder="1.0"
          />
        </div>

        {/* Token Operations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={mintTokens}
            disabled={isPending || isConfirming}
            className="btn-primary disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Minting...' : 'Mint BLT Tokens'}
          </button>
          
          <button
            onClick={stakeTokens}
            disabled={isPending || isConfirming}
            className="btn-primary disabled:opacity-50"
          >
            {isPending || isConfirming ? 'Staking...' : 'Stake Tokens'}
          </button>
        </div>

        {/* Transfer Section */}
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">Transfer To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="input flex-1"
              placeholder="0x..."
            />
            <button
              onClick={transferTokens}
              disabled={isPending || isConfirming || !recipient}
              className="btn-primary disabled:opacity-50"
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Trading Simulation */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 dark:text-white">Trading Simulation</h4>
          <button
            onClick={simulateTrading}
            className="btn-secondary w-full"
          >
            🚀 Simulate Trading Activity
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Simulates multiple trades to trigger reward system
          </p>
        </div>

        {/* Transaction Status */}
        {hash && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Transaction Hash:
            </p>
            <code className="text-xs text-blue-600 dark:text-blue-400 break-all">
              {hash}
            </code>
            {isConfirming && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                ⏳ Waiting for confirmation...
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 dark:text-white">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              onClick={() => setAmount('10')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Set 10 BLT
            </button>
            <button
              onClick={() => setAmount('100')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Set 100 BLT
            </button>
            <button
              onClick={() => setRecipient(address || '')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Self Transfer
            </button>
            <button
              onClick={() => setRecipient('0x742d35Cc6634C0532925a3b8D0C9e3e0C0e0e0e0')}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Test Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}