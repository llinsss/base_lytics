import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useNotifications } from '../contexts/NotificationContext';
import { useContractAddresses, BASE_MARKETPLACE_ABI, BASE_NFT_ABI } from '../utils/contracts';

interface NFTListing {
  id: number;
  tokenId: number;
  price: string;
  seller: string;
  image: string;
  name: string;
}

// Demo IDs to check for listings
const FEATURED_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function useNFTMarketplace() {
  const { addNotification } = useNotifications();
  const { BaseMarketplace, BaseNFT } = useContractAddresses();
  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const [listings, setListings] = useState<NFTListing[]>([]);

  // Fetch listings for featured IDs
  const { data: listingsData, refetch } = useReadContracts({
    contracts: FEATURED_IDS.map((id) => ({
      address: BaseMarketplace,
      abi: BASE_MARKETPLACE_ABI as any, // Cast to any to avoid strict type mismatch with Wagmi
      functionName: 'getListing',
      args: [BaseNFT, BigInt(id)],
    })),
  });

  useEffect(() => {
    if (listingsData) {
      const activeListings = listingsData
        .map((result) => {
          if (result.status === 'success' && result.result) {
            // Cast result to expected struct shape
            // ABI returns: (address seller, address nftContract, uint256 tokenId, uint256 price, address paymentToken, bool active, uint256 timestamp)
            // Wagmi/Viem returns this as an object if named in ABI, or array. 
            // In contracts.ts we defined names.

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const listing = result.result as any;

            // Check if active
            if (listing.active || listing[5]) { // Backup index access if object keys fail
              const tokenId = Number(listing.tokenId || listing[2]);
              return {
                id: tokenId,
                tokenId: tokenId,
                price: formatEther(listing.price || listing[3]),
                seller: listing.seller || listing[0],
                image: `https://picsum.photos/seed/${tokenId}/300/300`, // Placeholder
                name: `Base NFT #${tokenId}`,
              };
            }
          }
          return null;
        })
        .filter((item): item is NFTListing => item !== null);

      setListings(activeListings);
    }
  }, [listingsData]);

  const buyNFT = async (listingId: number, price: string) => {
    if (!BaseMarketplace) return;
    try {
      writeContract({
        address: BaseMarketplace,
        abi: BASE_MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [BaseNFT, BigInt(listingId)],
        value: parseEther(price),
      }, {
        onSuccess: () => {
          addNotification({
            title: 'Transaction Submitted',
            type: 'info',
            message: 'Your purchase is processing...'
          });
        },
        onError: (error) => {
          addNotification({
            title: 'Purchase Failed',
            type: 'error',
            message: error.message || 'Unknown error'
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const listNFT = async (tokenId: number, price: string) => {
    if (!BaseMarketplace) return;

    // Note: In a real app, we should check for approval first. 
    // For this demo, we'll try to approval first then list, or just list.
    // Let's just list, assuming user might have approved manually or we'd need a multi-step flow.
    // To keep it simple and actionable in one click (if approved) or fail with "Approve first":

    // Better UX: Run approval first? No, that's complex for one function call. 
    // I will just run the list function. If it fails due to allowance, user gets error.

    try {
      writeContract({
        address: BaseMarketplace,
        abi: BASE_MARKETPLACE_ABI,
        functionName: 'listItem',
        args: [BaseNFT, BigInt(tokenId), parseEther(price), '0x0000000000000000000000000000000000000000'], // Address(0) for ETH
      }, {
        onSuccess: () => {
          addNotification({
            title: 'Listing Submitted',
            type: 'info',
            message: 'Your listing transaction is processing...'
          });
        },
        onError: (error) => {
          addNotification({
            title: 'Listing Failed',
            type: 'error',
            message: error.message || 'Unknown error'
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Approval helper (optional, can be exposed if needed)
  const approveNFT = async (tokenId: number) => {
    if (!BaseMarketplace || !BaseNFT) return;
    writeContract({
      address: BaseNFT,
      abi: BASE_NFT_ABI,
      functionName: 'approve',
      args: [BaseMarketplace, BigInt(tokenId)]
    }, {
      onSuccess: () => addNotification({ title: 'Approval Submitted', type: 'info' }),
      onError: (err) => addNotification({ title: 'Approval Failed', type: 'error', message: err.message })
    });
  };

  return {
    listings,
    buyNFT,
    listNFT,
    approveNFT,
    isPending,
    isConfirming,
    isSuccess: isConfirmed,
    refetch
  };
}