import React from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useNFTInfo, useNFTBalance, useContractWrite } from '../hooks/useContracts';
import { useContractAddresses } from '../utils/contracts';
import { BASE_NFT_ABI } from '../utils/contracts';
import { useTransactionNotifications } from '../hooks/useTransactionNotifications';

export function NFTCard() {
  const { address } = useAccount();
  const contractAddresses = useContractAddresses();
  const nftInfo = useNFTInfo();
  const balance = useNFTBalance(address);
  const { writeContract, isPending, isConfirming, isSuccess, hash, error } = useContractWrite();

  useTransactionNotifications(
    { hash, isPending, isConfirming, isSuccess, error },
    {
      pendingTitle: 'NFT Mint Submitted',
      successTitle: 'NFT Minted Successfully',
      errorTitle: 'NFT Mint Failed'
    }
  );

  const handleMint = () => {
    writeContract({
      address: contractAddresses.BaseNFT,
      abi: BASE_NFT_ABI,
      functionName: 'mint',
      value: nftInfo.price,
    });
  };

  const canMint = nftInfo.mintingEnabled && !nftInfo.paused;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">BaseNFT</h2>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            canMint ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {canMint ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Your NFTs</p>
          <p className="text-2xl font-bold text-base-600">{balance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Minted</p>
          <p className="text-lg font-semibold">{nftInfo.totalSupply}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Mint Price</span>
          <span className="font-semibold">
            {nftInfo.price ? formatEther(nftInfo.price) : '0'} ETH
          </span>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Mint NFT</h3>
        {!canMint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              {nftInfo.paused ? 'Minting is paused' : 'Minting is disabled'}
            </p>
          </div>
        )}
        <button
          onClick={handleMint}
          disabled={!canMint || isPending || isConfirming}
          className="btn-primary w-full"
        >
          {isPending || isConfirming 
            ? 'Minting...' 
            : `Mint NFT (${nftInfo.price ? formatEther(nftInfo.price) : '0'} ETH)`
          }
        </button>

      </div>
    </div>
  );
}