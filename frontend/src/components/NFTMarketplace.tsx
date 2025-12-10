import React, { useState } from 'react';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';

export function NFTMarketplace() {
  const { listings, buyNFT, listNFT, isPending } = useNFTMarketplace();
  const [showListForm, setShowListForm] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const [price, setPrice] = useState('');

  const handleListNFT = () => {
    if (tokenId && price) {
      listNFT(Number(tokenId), price);
      setTokenId('');
      setPrice('');
      setShowListForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">🎨 NFT Marketplace</h2>
        <button
          onClick={() => setShowListForm(!showListForm)}
          className="btn-primary"
        >
          List NFT
        </button>
      </div>

      {showListForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">List Your NFT</h3>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Token ID"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <input
              type="number"
              step="0.001"
              placeholder="Price in ETH"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleListNFT}
                disabled={isPending || !tokenId || !price}
                className="btn-primary"
              >
                List NFT
              </button>
              <button
                onClick={() => setShowListForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="card">
            <div className="text-6xl text-center mb-4">{listing.image}</div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">{listing.name}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Token ID</span>
                <span className="dark:text-white">#{listing.tokenId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Seller</span>
                <span className="dark:text-white font-mono">{listing.seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price</span>
                <span className="text-lg font-bold dark:text-white">{listing.price} ETH</span>
              </div>
            </div>
            <button
              onClick={() => buyNFT(listing.id, listing.price)}
              disabled={isPending}
              className="btn-primary w-full"
            >
              {isPending ? 'Purchasing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}