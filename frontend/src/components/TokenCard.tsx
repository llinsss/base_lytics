import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useTokenInfo, useTokenBalance, useContractWrite } from '../hooks/useContracts';
import { CONTRACT_ADDRESSES, BASE_TOKEN_ABI } from '../utils/contracts';

export function TokenCard() {
  const { address } = useAccount();
  const tokenInfo = useTokenInfo();
  const balance = useTokenBalance(address);
  const { writeContract, isPending, isConfirming, isSuccess } = useContractWrite();
  
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const handleTransfer = () => {
    if (!transferTo || !transferAmount) return;
    
    writeContract({
      address: CONTRACT_ADDRESSES.BaseToken,
      abi: BASE_TOKEN_ABI,
      functionName: 'transfer',
      args: [transferTo as `0x${string}`, parseEther(transferAmount)],
    });
  };

  const supplyUtilization = tokenInfo.maxSupply > 0n 
    ? Number((tokenInfo.totalSupply * 100n) / tokenInfo.maxSupply)
    : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">BaseToken</h2>
        <span className="text-sm text-gray-500">{tokenInfo.symbol}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-2xl font-bold text-base-600">
            {balance ? formatEther(balance) : '0'} {tokenInfo.symbol}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Supply</p>
          <p className="text-lg font-semibold">
            {tokenInfo.totalSupply ? formatEther(tokenInfo.totalSupply) : '0'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Supply Utilization</span>
          <span>{supplyUtilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-base-600 h-2 rounded-full transition-all"
            style={{ width: `${supplyUtilization}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Transfer Tokens</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Recipient address (0x...)"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleTransfer}
            disabled={isPending || isConfirming || !transferTo || !transferAmount}
            className="btn-primary w-full"
          >
            {isPending || isConfirming ? 'Processing...' : 'Transfer'}
          </button>
          {isSuccess && (
            <p className="text-green-600 text-sm">Transfer successful!</p>
          )}
        </div>
      </div>
    </div>
  );
}