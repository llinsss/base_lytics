// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC721.sol";
import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../security/Pausable.sol";

/**
 * @title BaseMarketplace
 * @dev A comprehensive NFT marketplace with auctions, fixed-price sales, and royalty management
 * Features: Buy/sell NFTs, auction system, royalty distribution, escrow functionality
 */
contract BaseMarketplace is Ownable, ReentrancyGuard, Pausable {
    // Events
    event ItemListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, address paymentToken);
    event ItemSold(address indexed seller, address indexed buyer, address indexed nftContract, uint256 tokenId, uint256 price, address paymentToken);
    event ItemDelisted(address indexed seller, address indexed nftContract, uint256 indexed tokenId);
    event AuctionCreated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 startingPrice, uint256 endTime);
    event BidPlaced(address indexed bidder, address indexed nftContract, uint256 indexed tokenId, uint256 bidAmount);
    event AuctionEnded(address indexed winner, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 winningBid);
    event RoyaltyPaid(address indexed recipient, address indexed nftContract, uint256 indexed tokenId, uint256 amount);
    event FeeCollected(address indexed feeRecipient, uint256 amount, address paymentToken);

    // Listing structure
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address paymentToken;
        bool active;
        uint256 timestamp;
    }

    // Auction structure
    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool ended;
        address paymentToken;
    }

    // Bid structure
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    // Royalty structure
    struct RoyaltyInfo {
        address recipient;
        uint256 percentage; // In basis points (e.g., 250 = 2.5%)
    }

    // State variables
    mapping(bytes32 => Listing) public listings;
    mapping(bytes32 => Auction) public auctions;
    mapping(bytes32 => Bid[]) public auctionBids;
    mapping(address => mapping(uint256 => RoyaltyInfo)) public royalties;
    
    uint256 public marketplaceFee = 250; // 2.5% marketplace fee
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeRecipient;
    
    uint256 public auctionDuration = 7 days; // Default auction duration
    uint256 public minBidIncrement = 100; // 1% minimum bid increment
    
    // Supported payment tokens
    mapping(address => bool) public supportedPaymentTokens;
    
    // Escrow functionality
    mapping(bytes32 => bool) public escrowActive;
    mapping(bytes32 => uint256) public escrowEndTime;

    constructor() {
        feeRecipient = msg.sender;
    }

    /**
     * @dev List an NFT for sale
     * @param nftContract NFT contract address
     * @param tokenId Token ID to list
     * @param price Sale price
     * @param paymentToken Payment token address (address(0) for ETH)
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address paymentToken
    ) external nonReentrant whenNotPaused {
        require(price > 0, "BaseMarketplace: invalid price");
        require(paymentToken == address(0) || supportedPaymentTokens[paymentToken], "BaseMarketplace: unsupported payment token");
        
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        require(!listings[listingId].active, "BaseMarketplace: already listed");
        
        // Transfer NFT to marketplace (escrow)
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            paymentToken: paymentToken,
            active: true,
            timestamp: block.timestamp
        });
        
        emit ItemListed(msg.sender, nftContract, tokenId, price, paymentToken);
    }

    /**
     * @dev Buy a listed NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID to buy
     */
    function buyItem(address nftContract, uint256 tokenId) external payable nonReentrant whenNotPaused {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "BaseMarketplace: not listed");
        require(msg.sender != listing.seller, "BaseMarketplace: cannot buy own item");
        
        uint256 totalPrice = listing.price;
        
        if (listing.paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= totalPrice, "BaseMarketplace: insufficient payment");
            
            // Distribute payment
            _distributePayment(listing.seller, nftContract, tokenId, totalPrice, address(0));
            
            // Refund excess ETH
            if (msg.value > totalPrice) {
                payable(msg.sender).transfer(msg.value - totalPrice);
            }
        } else {
            // ERC20 payment
            require(msg.value == 0, "BaseMarketplace: ETH not accepted");
            require(IERC20(listing.paymentToken).transferFrom(msg.sender, address(this), totalPrice), "BaseMarketplace: payment failed");
            
            // Distribute payment
            _distributePayment(listing.seller, nftContract, tokenId, totalPrice, listing.paymentToken);
        }
        
        // Transfer NFT to buyer
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        // Remove listing
        listing.active = false;
        
        emit ItemSold(listing.seller, msg.sender, nftContract, tokenId, totalPrice, listing.paymentToken);
    }

    /**
     * @dev Delist an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID to delist
     */
    function delistItem(address nftContract, uint256 tokenId) external nonReentrant {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        Listing storage listing = listings[listingId];
        
        require(listing.active, "BaseMarketplace: not listed");
        require(msg.sender == listing.seller || msg.sender == owner(), "BaseMarketplace: not authorized");
        
        // Transfer NFT back to seller
        IERC721(nftContract).transferFrom(address(this), listing.seller, tokenId);
        
        // Remove listing
        listing.active = false;
        
        emit ItemDelisted(listing.seller, nftContract, tokenId);
    }

    /**
     * @dev Create an auction for an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID to auction
     * @param startingPrice Starting bid price
     * @param duration Auction duration in seconds
     * @param paymentToken Payment token address
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration,
        address paymentToken
    ) external nonReentrant whenNotPaused {
        require(startingPrice > 0, "BaseMarketplace: invalid starting price");
        require(duration > 0, "BaseMarketplace: invalid duration");
        require(paymentToken == address(0) || supportedPaymentTokens[paymentToken], "BaseMarketplace: unsupported payment token");
        
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId));
        require(!auctions[auctionId].ended, "BaseMarketplace: auction exists");
        
        // Transfer NFT to marketplace
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        
        auctions[auctionId] = Auction({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: address(0),
            endTime: block.timestamp + duration,
            ended: false,
            paymentToken: paymentToken
        });
        
        emit AuctionCreated(msg.sender, nftContract, tokenId, startingPrice, block.timestamp + duration);
    }

    /**
     * @dev Place a bid on an auction
     * @param nftContract NFT contract address
     * @param tokenId Token ID to bid on
     */
    function placeBid(address nftContract, uint256 tokenId) external payable nonReentrant whenNotPaused {
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId));
        Auction storage auction = auctions[auctionId];
        
        require(!auction.ended, "BaseMarketplace: auction ended");
        require(block.timestamp < auction.endTime, "BaseMarketplace: auction expired");
        require(msg.sender != auction.seller, "BaseMarketplace: cannot bid on own auction");
        
        uint256 bidAmount;
        if (auction.paymentToken == address(0)) {
            bidAmount = msg.value;
        } else {
            bidAmount = msg.value; // This should be handled differently for ERC20
            require(IERC20(auction.paymentToken).transferFrom(msg.sender, address(this), bidAmount), "BaseMarketplace: bid failed");
        }
        
        require(bidAmount >= auction.startingPrice, "BaseMarketplace: bid too low");
        require(bidAmount > auction.highestBid, "BaseMarketplace: bid too low");
        
        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            if (auction.paymentToken == address(0)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            } else {
                IERC20(auction.paymentToken).transfer(auction.highestBidder, auction.highestBid);
            }
        }
        
        // Update auction
        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;
        
        // Record bid
        auctionBids[auctionId].push(Bid({
            bidder: msg.sender,
            amount: bidAmount,
            timestamp: block.timestamp
        }));
        
        emit BidPlaced(msg.sender, nftContract, tokenId, bidAmount);
    }

    /**
     * @dev End an auction and transfer NFT to winner
     * @param nftContract NFT contract address
     * @param tokenId Token ID of auction
     */
    function endAuction(address nftContract, uint256 tokenId) external nonReentrant {
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId));
        Auction storage auction = auctions[auctionId];
        
        require(!auction.ended, "BaseMarketplace: auction ended");
        require(block.timestamp >= auction.endTime || msg.sender == owner(), "BaseMarketplace: auction not ended");
        
        auction.ended = true;
        
        if (auction.highestBidder != address(0)) {
            // Distribute payment to seller
            _distributePayment(auction.seller, nftContract, tokenId, auction.highestBid, auction.paymentToken);
            
            // Transfer NFT to winner
            IERC721(nftContract).transferFrom(address(this), auction.highestBidder, tokenId);
            
            emit AuctionEnded(auction.highestBidder, auction.seller, nftContract, tokenId, auction.highestBid);
        } else {
            // No bids, return NFT to seller
            IERC721(nftContract).transferFrom(address(this), auction.seller, tokenId);
        }
    }

    /**
     * @dev Set royalty information for an NFT
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @param recipient Royalty recipient
     * @param percentage Royalty percentage in basis points
     */
    function setRoyalty(address nftContract, uint256 tokenId, address recipient, uint256 percentage) external {
        require(percentage <= 1000, "BaseMarketplace: royalty too high"); // Max 10%
        require(msg.sender == owner() || msg.sender == IERC721(nftContract).ownerOf(tokenId), "BaseMarketplace: not authorized");
        
        royalties[nftContract][tokenId] = RoyaltyInfo({
            recipient: recipient,
            percentage: percentage
        });
    }

    /**
     * @dev Internal function to distribute payment
     */
    function _distributePayment(address seller, address nftContract, uint256 tokenId, uint256 totalAmount, address paymentToken) internal {
        // Calculate marketplace fee
        uint256 marketplaceFeeAmount = (totalAmount * marketplaceFee) / FEE_DENOMINATOR;
        uint256 remainingAmount = totalAmount - marketplaceFeeAmount;
        
        // Calculate royalty
        RoyaltyInfo memory royalty = royalties[nftContract][tokenId];
        uint256 royaltyAmount = 0;
        if (royalty.recipient != address(0)) {
            royaltyAmount = (totalAmount * royalty.percentage) / FEE_DENOMINATOR;
            remainingAmount -= royaltyAmount;
        }
        
        // Distribute payments
        if (paymentToken == address(0)) {
            // ETH payments
            if (marketplaceFeeAmount > 0) {
                payable(feeRecipient).transfer(marketplaceFeeAmount);
                emit FeeCollected(feeRecipient, marketplaceFeeAmount, address(0));
            }
            
            if (royaltyAmount > 0) {
                payable(royalty.recipient).transfer(royaltyAmount);
                emit RoyaltyPaid(royalty.recipient, nftContract, tokenId, royaltyAmount);
            }
            
            if (remainingAmount > 0) {
                payable(seller).transfer(remainingAmount);
            }
        } else {
            // ERC20 payments
            if (marketplaceFeeAmount > 0) {
                IERC20(paymentToken).transfer(feeRecipient, marketplaceFeeAmount);
                emit FeeCollected(feeRecipient, marketplaceFeeAmount, paymentToken);
            }
            
            if (royaltyAmount > 0) {
                IERC20(paymentToken).transfer(royalty.recipient, royaltyAmount);
                emit RoyaltyPaid(royalty.recipient, nftContract, tokenId, royaltyAmount);
            }
            
            if (remainingAmount > 0) {
                IERC20(paymentToken).transfer(seller, remainingAmount);
            }
        }
    }

    /**
     * @dev Add supported payment token
     * @param token Token address
     */
    function addSupportedPaymentToken(address token) external onlyOwner {
        supportedPaymentTokens[token] = true;
    }

    /**
     * @dev Remove supported payment token
     * @param token Token address
     */
    function removeSupportedPaymentToken(address token) external onlyOwner {
        supportedPaymentTokens[token] = false;
    }

    /**
     * @dev Set marketplace fee
     * @param newFee New fee in basis points
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "BaseMarketplace: fee too high"); // Max 10%
        marketplaceFee = newFee;
    }

    /**
     * @dev Set fee recipient
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "BaseMarketplace: zero address");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Set auction duration
     * @param newDuration New duration in seconds
     */
    function setAuctionDuration(uint256 newDuration) external onlyOwner {
        require(newDuration > 0, "BaseMarketplace: invalid duration");
        auctionDuration = newDuration;
    }

    /**
     * @dev Get listing information
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return listing Listing information
     */
    function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory listing) {
        bytes32 listingId = keccak256(abi.encodePacked(nftContract, tokenId));
        return listings[listingId];
    }

    /**
     * @dev Get auction information
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return auction Auction information
     */
    function getAuction(address nftContract, uint256 tokenId) external view returns (Auction memory auction) {
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId));
        return auctions[auctionId];
    }

    /**
     * @dev Get auction bids
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return bids Array of bids
     */
    function getAuctionBids(address nftContract, uint256 tokenId) external view returns (Bid[] memory bids) {
        bytes32 auctionId = keccak256(abi.encodePacked(nftContract, tokenId));
        return auctionBids[auctionId];
    }

    /**
     * @dev Get royalty information
     * @param nftContract NFT contract address
     * @param tokenId Token ID
     * @return recipient Royalty recipient
     * @return percentage Royalty percentage
     */
    function getRoyalty(address nftContract, uint256 tokenId) external view returns (address recipient, uint256 percentage) {
        RoyaltyInfo memory royalty = royalties[nftContract][tokenId];
        return (royalty.recipient, royalty.percentage);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw
     * @param token Token address (address(0) for ETH)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }
}
