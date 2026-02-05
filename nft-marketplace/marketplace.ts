import { ethers } from 'ethers';

interface NFTListing {
  tokenId: string;
  contract: string;
  seller: string;
  price: string;
  currency: string;
  listingType: ListingType;
  startTime: number;
  endTime: number;
  royaltyRecipient: string;
  royaltyPercentage: number;
  metadata: NFTMetadata;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  rarity_score?: number;
}

interface Auction {
  listingId: string;
  highestBid: string;
  highestBidder: string;
  minBidIncrement: string;
  reservePrice: string;
  bids: Bid[];
}

interface Bid {
  bidder: string;
  amount: string;
  timestamp: number;
  txHash: string;
}

interface Collection {
  address: string;
  name: string;
  symbol: string;
  description: string;
  creator: string;
  verified: boolean;
  floorPrice: string;
  totalVolume: string;
  totalSupply: number;
  royaltyPercentage: number;
}

enum ListingType {
  FIXED_PRICE = 'fixed_price',
  AUCTION = 'auction',
  DUTCH_AUCTION = 'dutch_auction',
  BUNDLE = 'bundle'
}

enum OrderStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

class AdvancedNFTMarketplace {
  private listings: Map<string, NFTListing> = new Map();
  private auctions: Map<string, Auction> = new Map();
  private collections: Map<string, Collection> = new Map();
  private userOffers: Map<string, Array<{offerId: string, tokenId: string, amount: string, expiry: number}>> = new Map();
  private marketplaceFee: number = 250; // 2.5%
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  // Listing Management
  async createListing(listing: NFTListing): Promise<string> {
    const listingId = this.generateListingId(listing);
    
    // Validate listing
    await this.validateListing(listing);
    
    // Set listing status and timestamps
    listing.startTime = listing.startTime || Date.now();
    
    this.listings.set(listingId, listing);
    
    // Create auction if needed
    if (listing.listingType === ListingType.AUCTION) {
      this.auctions.set(listingId, {
        listingId,
        highestBid: '0',
        highestBidder: ethers.constants.AddressZero,
        minBidIncrement: ethers.utils.parseEther('0.01').toString(),
        reservePrice: listing.price,
        bids: []
      });
    }
    
    console.log(`Created listing ${listingId} for token ${listing.tokenId}`);
    return listingId;
  }

  async cancelListing(listingId: string, user: string): Promise<boolean> {
    const listing = this.listings.get(listingId);
    if (!listing || listing.seller !== user) {
      throw new Error('Unauthorized or listing not found');
    }
    
    this.listings.delete(listingId);
    this.auctions.delete(listingId);
    
    console.log(`Cancelled listing ${listingId}`);
    return true;
  }

  // Purchase Functions
  async buyNow(listingId: string, buyer: string): Promise<string> {
    const listing = this.listings.get(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    if (listing.listingType !== ListingType.FIXED_PRICE) {
      throw new Error('Not a fixed price listing');
    }
    
    // Calculate fees
    const salePrice = ethers.BigNumber.from(listing.price);
    const marketplaceFeeAmount = salePrice.mul(this.marketplaceFee).div(10000);
    const royaltyAmount = salePrice.mul(listing.royaltyPercentage).div(10000);
    const sellerAmount = salePrice.sub(marketplaceFeeAmount).sub(royaltyAmount);
    
    // Process payment distribution
    await this.processPayment(buyer, listing.seller, listing.royaltyRecipient, {
      total: salePrice,
      marketplace: marketplaceFeeAmount,
      royalty: royaltyAmount,
      seller: sellerAmount
    });
    
    // Transfer NFT
    await this.transferNFT(listing.contract, listing.tokenId, listing.seller, buyer);
    
    // Remove listing
    this.listings.delete(listingId);
    
    // Update collection stats
    await this.updateCollectionStats(listing.contract, salePrice.toString());
    
    const txHash = this.generateTxHash();
    console.log(`Sale completed: ${listingId} to ${buyer} for ${listing.price}`);
    return txHash;
  }

  // Auction Functions
  async placeBid(listingId: string, bidder: string, amount: string): Promise<boolean> {
    const listing = this.listings.get(listingId);
    const auction = this.auctions.get(listingId);
    
    if (!listing || !auction) {
      throw new Error('Auction not found');
    }
    
    if (listing.listingType !== ListingType.AUCTION) {
      throw new Error('Not an auction listing');
    }
    
    const bidAmount = ethers.BigNumber.from(amount);
    const currentHighest = ethers.BigNumber.from(auction.highestBid);
    const minBid = currentHighest.add(auction.minBidIncrement);
    
    if (bidAmount.lt(minBid)) {
      throw new Error('Bid too low');
    }
    
    // Refund previous highest bidder
    if (auction.highestBidder !== ethers.constants.AddressZero) {
      await this.refundBidder(auction.highestBidder, auction.highestBid);
    }
    
    // Update auction
    auction.highestBid = amount;
    auction.highestBidder = bidder;
    auction.bids.push({
      bidder,
      amount,
      timestamp: Date.now(),
      txHash: this.generateTxHash()
    });
    
    console.log(`New bid placed: ${amount} by ${bidder} on ${listingId}`);
    return true;
  }

  async finalizeAuction(listingId: string): Promise<string> {
    const listing = this.listings.get(listingId);
    const auction = this.auctions.get(listingId);
    
    if (!listing || !auction) {
      throw new Error('Auction not found');
    }
    
    if (Date.now() < listing.endTime) {
      throw new Error('Auction not ended');
    }
    
    if (auction.highestBidder === ethers.constants.AddressZero) {
      // No bids, return NFT to seller
      console.log(`Auction ${listingId} ended with no bids`);
      this.listings.delete(listingId);
      this.auctions.delete(listingId);
      return '';
    }
    
    // Process sale
    const salePrice = ethers.BigNumber.from(auction.highestBid);
    const marketplaceFeeAmount = salePrice.mul(this.marketplaceFee).div(10000);
    const royaltyAmount = salePrice.mul(listing.royaltyPercentage).div(10000);
    const sellerAmount = salePrice.sub(marketplaceFeeAmount).sub(royaltyAmount);
    
    await this.processPayment(auction.highestBidder, listing.seller, listing.royaltyRecipient, {
      total: salePrice,
      marketplace: marketplaceFeeAmount,
      royalty: royaltyAmount,
      seller: sellerAmount
    });
    
    await this.transferNFT(listing.contract, listing.tokenId, listing.seller, auction.highestBidder);
    
    // Clean up
    this.listings.delete(listingId);
    this.auctions.delete(listingId);
    
    const txHash = this.generateTxHash();
    console.log(`Auction finalized: ${listingId} won by ${auction.highestBidder} for ${auction.highestBid}`);
    return txHash;
  }

  // Collection Management
  async addCollection(collection: Collection): Promise<void> {
    this.collections.set(collection.address, collection);
    console.log(`Added collection: ${collection.name} (${collection.address})`);
  }

  async getCollectionStats(contractAddress: string): Promise<any> {
    const collection = this.collections.get(contractAddress);
    if (!collection) {
      throw new Error('Collection not found');
    }
    
    // Calculate stats from listings
    const collectionListings = Array.from(this.listings.values())
      .filter(listing => listing.contract === contractAddress);
    
    const prices = collectionListings.map(l => ethers.BigNumber.from(l.price));
    const floorPrice = prices.length > 0 ? prices.reduce((min, price) => price.lt(min) ? price : min) : ethers.BigNumber.from(0);
    
    return {
      ...collection,
      activeListings: collectionListings.length,
      floorPrice: floorPrice.toString(),
      averagePrice: prices.length > 0 ? prices.reduce((sum, price) => sum.add(price)).div(prices.length).toString() : '0'
    };
  }

  // Offer System
  async makeOffer(tokenId: string, contractAddress: string, offerer: string, amount: string, expiry: number): Promise<string> {
    const offerId = this.generateOfferId(tokenId, contractAddress, offerer);
    
    const userOffers = this.userOffers.get(offerer) || [];
    userOffers.push({
      offerId,
      tokenId: `${contractAddress}:${tokenId}`,
      amount,
      expiry
    });
    
    this.userOffers.set(offerer, userOffers);
    
    console.log(`Offer made: ${amount} for token ${tokenId} by ${offerer}`);
    return offerId;
  }

  async acceptOffer(offerId: string, tokenOwner: string): Promise<string> {
    // Find offer
    let offer: any = null;
    let offerer: string = '';
    
    for (const [user, offers] of this.userOffers.entries()) {
      const foundOffer = offers.find(o => o.offerId === offerId);
      if (foundOffer) {
        offer = foundOffer;
        offerer = user;
        break;
      }
    }
    
    if (!offer) {
      throw new Error('Offer not found');
    }
    
    if (Date.now() > offer.expiry) {
      throw new Error('Offer expired');
    }
    
    // Process sale
    const [contractAddress, tokenId] = offer.tokenId.split(':');
    const salePrice = ethers.BigNumber.from(offer.amount);
    
    // Get royalty info
    const collection = this.collections.get(contractAddress);
    const royaltyPercentage = collection?.royaltyPercentage || 0;
    
    const marketplaceFeeAmount = salePrice.mul(this.marketplaceFee).div(10000);
    const royaltyAmount = salePrice.mul(royaltyPercentage).div(10000);
    const sellerAmount = salePrice.sub(marketplaceFeeAmount).sub(royaltyAmount);
    
    await this.processPayment(offerer, tokenOwner, collection?.creator || ethers.constants.AddressZero, {
      total: salePrice,
      marketplace: marketplaceFeeAmount,
      royalty: royaltyAmount,
      seller: sellerAmount
    });
    
    await this.transferNFT(contractAddress, tokenId, tokenOwner, offerer);
    
    // Remove offer
    const userOffers = this.userOffers.get(offerer) || [];
    const updatedOffers = userOffers.filter(o => o.offerId !== offerId);
    this.userOffers.set(offerer, updatedOffers);
    
    const txHash = this.generateTxHash();
    console.log(`Offer accepted: ${offerId} for ${offer.amount}`);
    return txHash;
  }

  // Analytics
  async getMarketplaceStats(): Promise<any> {
    const totalListings = this.listings.size;
    const totalAuctions = this.auctions.size;
    const totalCollections = this.collections.size;
    
    const allListings = Array.from(this.listings.values());
    const totalVolume = allListings.reduce((sum, listing) => {
      return sum.add(ethers.BigNumber.from(listing.price));
    }, ethers.BigNumber.from(0));
    
    return {
      totalListings,
      totalAuctions,
      totalCollections,
      totalVolume: totalVolume.toString(),
      averagePrice: totalListings > 0 ? totalVolume.div(totalListings).toString() : '0'
    };
  }

  // Helper Methods
  private async validateListing(listing: NFTListing): Promise<void> {
    // Validate NFT ownership
    // Validate pricing
    // Validate timestamps
    if (listing.endTime && listing.endTime <= listing.startTime) {
      throw new Error('Invalid end time');
    }
  }

  private async processPayment(buyer: string, seller: string, royaltyRecipient: string, amounts: any): Promise<void> {
    // Mock payment processing
    console.log(`Payment processed: ${amounts.total} from ${buyer} to ${seller}`);
  }

  private async transferNFT(contract: string, tokenId: string, from: string, to: string): Promise<void> {
    // Mock NFT transfer
    console.log(`NFT transferred: ${contract}:${tokenId} from ${from} to ${to}`);
  }

  private async refundBidder(bidder: string, amount: string): Promise<void> {
    // Mock refund
    console.log(`Refunded ${amount} to ${bidder}`);
  }

  private async updateCollectionStats(contractAddress: string, salePrice: string): Promise<void> {
    const collection = this.collections.get(contractAddress);
    if (collection) {
      const currentVolume = ethers.BigNumber.from(collection.totalVolume || '0');
      const newVolume = currentVolume.add(salePrice);
      collection.totalVolume = newVolume.toString();
    }
  }

  private generateListingId(listing: NFTListing): string {
    return `${listing.contract}:${listing.tokenId}:${Date.now()}`;
  }

  private generateOfferId(tokenId: string, contract: string, offerer: string): string {
    return `${contract}:${tokenId}:${offerer}:${Date.now()}`;
  }

  private generateTxHash(): string {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }

  // Public getters
  getListing(listingId: string): NFTListing | undefined {
    return this.listings.get(listingId);
  }

  getAuction(listingId: string): Auction | undefined {
    return this.auctions.get(listingId);
  }

  getAllListings(): NFTListing[] {
    return Array.from(this.listings.values());
  }

  getListingsByCollection(contractAddress: string): NFTListing[] {
    return Array.from(this.listings.values())
      .filter(listing => listing.contract === contractAddress);
  }
}

// Example usage
async function main() {
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  const marketplace = new AdvancedNFTMarketplace(provider);
  
  // Add a collection
  await marketplace.addCollection({
    address: '0x1234567890123456789012345678901234567890',
    name: 'Test Collection',
    symbol: 'TEST',
    description: 'A test NFT collection',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    verified: true,
    floorPrice: '0',
    totalVolume: '0',
    totalSupply: 1000,
    royaltyPercentage: 500 // 5%
  });
  
  // Create a listing
  const listing: NFTListing = {
    tokenId: '1',
    contract: '0x1234567890123456789012345678901234567890',
    seller: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    price: ethers.utils.parseEther('1').toString(),
    currency: ethers.constants.AddressZero,
    listingType: ListingType.FIXED_PRICE,
    startTime: Date.now(),
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    royaltyRecipient: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    royaltyPercentage: 500,
    metadata: {
      name: 'Test NFT #1',
      description: 'A test NFT',
      image: 'https://example.com/image.png',
      attributes: [
        { trait_type: 'Color', value: 'Blue' },
        { trait_type: 'Rarity', value: 'Common' }
      ]
    }
  };
  
  const listingId = await marketplace.createListing(listing);
  console.log('Created listing:', listingId);
  
  // Get marketplace stats
  const stats = await marketplace.getMarketplaceStats();
  console.log('Marketplace stats:', stats);
}

export { AdvancedNFTMarketplace, ListingType, OrderStatus };
export type { NFTListing, NFTMetadata, Auction, Bid, Collection };