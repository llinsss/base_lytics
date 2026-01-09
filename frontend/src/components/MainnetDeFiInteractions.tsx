import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useNotifications } from '../contexts/NotificationContext';

const UNISWAP_V3_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481'; // Base mainnet
const AAVE_POOL = '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5'; // Base mainnet
const COMPOUND_CUSDC = '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf'; // Base mainnet

const SWAP_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{
      name: 'params',
      type: 'tuple',
      components: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'fee', type: 'uint24' },
        { name: 'recipient', type: 'address' },
        { name: 'deadline', type: 'uint256' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOutMinimum', type: 'uint256' },
        { name: 'sqrtPriceLimitX96', type: 'uint160' }
      ]
    }],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  }
] as const;

const AAVE_ABI = [
  {
    name: 'supply',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' }
    ]
  }
] as const;

export function MainnetDeFiInteractions() {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const [amount, setAmount] = useState('0.01');
  const [protocol, setProtocol] = useState('uniswap');

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

  React.useEffect(() => {
    if (isSuccess) {
      addNotification({
        title: '✅ DeFi Transaction Confirmed',
        message: 'Your mainnet DeFi transaction was successful!',
        type: 'success'
      });
    }
  }, [isSuccess, addNotification]);

  const swapOnUniswap = async () => {
    if (!address || !amount) return;

    try {
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
      
      await writeContract({
        address: UNISWAP_V3_ROUTER,
        abi: SWAP_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: WETH_ADDRESS,
          tokenOut: USDC_ADDRESS,
          fee: 3000, // 0.3%
          recipient: address,
          deadline: BigInt(deadline),
          amountIn: parseEther(amount),
          amountOutMinimum: BigInt(0),
          sqrtPriceLimitX96: BigInt(0)
        }],
        value: parseEther(amount)
      });

      addNotification({
        title: '🦄 Uniswap Swap Submitted',
        message: `Swapping ${amount} ETH for USDC on Uniswap V3`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Swap Failed',
        message: error.message || 'Failed to execute swap',
        type: 'error'
      });
    }
  };

  const supplyToAave = async () => {
    if (!address || !amount) return;

    try {
      await writeContract({
        address: AAVE_POOL,
        abi: AAVE_ABI,
        functionName: 'supply',
        args: [
          USDC_ADDRESS,
          parseUnits(amount, 6), // USDC has 6 decimals
          address,
          0
        ]
      });

      addNotification({
        title: '🏦 Aave Supply Submitted',
        message: `Supplying ${amount} USDC to Aave lending pool`,
        type: 'info'
      });
    } catch (error: any) {
      addNotification({
        title: 'Supply Failed',
        message: error.message || 'Failed to supply to Aave',
        type: 'error'
      });
    }
  };

  const executeProtocolAction = () => {
    switch (protocol) {
      case 'uniswap':
        return swapOnUniswap();
      case 'aave':
        return supplyToAave();
      default:
        return;
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 dark:text-white">🏦 Mainnet DeFi Protocols</h3>
      
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <h4 className="font-semibold text-red-700 dark:text-red-300">Mainnet Warning</h4>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            These are REAL mainnet transactions with REAL money and gas fees. 
            Only proceed if you understand the risks and costs involved.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">Protocol</label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="input w-full"
          >
            <option value="uniswap">🦄 Uniswap V3 - ETH → USDC Swap</option>
            <option value="aave">🏦 Aave - Supply USDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-white">
            Amount ({protocol === 'uniswap' ? 'ETH' : 'USDC'})
          </label>
          <input
            type="number"
            step="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input w-full"
            placeholder="0.01"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 dark:text-white">Transaction Details</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Protocol:</span>
              <span className="dark:text-white">
                {protocol === 'uniswap' ? 'Uniswap V3' : 'Aave V3'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Network:</span>
              <span className="text-blue-500 font-medium">Base Mainnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Est. Gas:</span>
              <span className="text-orange-500">~$2-5</span>
            </div>
          </div>
        </div>

        <button
          onClick={executeProtocolAction}
          disabled={isPending || isConfirming || !amount}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isPending || isConfirming ? 'Executing...' : 
           protocol === 'uniswap' ? `Swap ${amount} ETH` : `Supply ${amount} USDC`}
        </button>

        {hash && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
              Mainnet Transaction Submitted
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
                ⏳ Confirming on mainnet...
              </p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                ✅ Mainnet transaction confirmed!
              </p>
            )}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 dark:text-white">Available Protocols</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🦄 Uniswap V3</span>
              <span className="text-green-500">Active</span>
            </div>
            <div className="flex justify-between">
              <span>🏦 Aave V3</span>
              <span className="text-green-500">Active</span>
            </div>
            <div className="flex justify-between">
              <span>📈 Compound</span>
              <span className="text-yellow-500">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}