import React, { useCallback } from 'react';
import { useNFTBalance, useNFTMint } from '../hooks';
import { useAccount } from 'wagmi';
import { Skeleton } from './LoadingSkeleton';

export const NFTCard = React.memo(function NFTCard() {
  const { address } = useAccount();
  const { balance, isLoading } = useNFTBalance();
  const { mint, isPending } = useNFTMint();

  const handleMint = useCallback(() => {
    if (address) {
      mint(address);
    }
  }, [address, mint]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Base NFT</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Owned NFTs</p>
        {isLoading ? (
          <Skeleton height={32} width="40%" className="mt-2" />
        ) : (
          <p className="text-2xl font-bold dark:text-white">
            {(balance as bigint).toString()}
          </p>
        )}
      </div>

      {address && (
        <div className="space-y-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mint Price</p>
            <p className="font-semibold dark:text-white">0.01 ETH</p>
          </div>
          <button
            onClick={handleMint}
            disabled={isPending}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      )}
    </div>
  );
});