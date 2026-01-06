// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BaseLyticsRewards.sol";

contract OptimizedTrading is ReentrancyGuard, Ownable {
    BaseLyticsRewards public immutable rewardsContract;
    
    struct Trade {
        address tokenA;
        address tokenB;
        uint256 amountA;
        uint256 amountB;
        uint256 timestamp;
    }
    
    mapping(address => uint256) public userTradeCount;
    mapping(address => uint256) public userVolume;
    
    // Packed struct for gas optimization
    struct PackedTrade {
        uint128 amountA;
        uint128 amountB;
        uint64 timestamp;
        uint32 tokenAId;
        uint32 tokenBId;
    }
    
    mapping(address => PackedTrade[]) public userTrades;
    mapping(address => uint32) public tokenIds;
    address[] public supportedTokens;
    
    event TradeExecuted(address indexed user, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event BatchTradeExecuted(address indexed user, uint256 tradeCount);
    
    constructor(address _rewardsContract) {
        rewardsContract = BaseLyticsRewards(_rewardsContract);
    }
    
    function addSupportedToken(address token) external onlyOwner {
        tokenIds[token] = uint32(supportedTokens.length);
        supportedTokens.push(token);
    }
    
    function executeTrade(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        require(tokenIds[tokenA] > 0 || tokenA == supportedTokens[0], "Token A not supported");
        require(tokenIds[tokenB] > 0 || tokenB == supportedTokens[0], "Token B not supported");
        
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
        
        // Pack trade data for gas efficiency
        PackedTrade memory packedTrade = PackedTrade({
            amountA: uint128(amountA),
            amountB: uint128(amountB),
            timestamp: uint64(block.timestamp),
            tokenAId: tokenIds[tokenA],
            tokenBId: tokenIds[tokenB]
        });
        
        userTrades[msg.sender].push(packedTrade);
        userTradeCount[msg.sender]++;
        userVolume[msg.sender] += amountA; // Simplified volume calculation
        
        // Record trading activity for rewards
        rewardsContract.recordTradingActivity(msg.sender, amountA);
        
        emit TradeExecuted(msg.sender, tokenA, tokenB, amountA, amountB);
    }
    
    function executeBatchTrades(
        address[] calldata tokensA,
        address[] calldata tokensB,
        uint256[] calldata amountsA,
        uint256[] calldata amountsB
    ) external nonReentrant {
        require(tokensA.length == tokensB.length, "Array length mismatch");
        require(tokensA.length == amountsA.length, "Array length mismatch");
        require(tokensA.length == amountsB.length, "Array length mismatch");
        
        uint256 totalVolume = 0;
        
        for (uint256 i = 0; i < tokensA.length; i++) {
            IERC20(tokensA[i]).transferFrom(msg.sender, address(this), amountsA[i]);
            IERC20(tokensB[i]).transfer(msg.sender, amountsB[i]);
            
            PackedTrade memory packedTrade = PackedTrade({
                amountA: uint128(amountsA[i]),
                amountB: uint128(amountsB[i]),
                timestamp: uint64(block.timestamp),
                tokenAId: tokenIds[tokensA[i]],
                tokenBId: tokenIds[tokensB[i]]
            });
            
            userTrades[msg.sender].push(packedTrade);
            totalVolume += amountsA[i];
        }
        
        userTradeCount[msg.sender] += tokensA.length;
        userVolume[msg.sender] += totalVolume;
        
        // Record batch trading activity
        rewardsContract.recordTradingActivity(msg.sender, totalVolume);
        
        emit BatchTradeExecuted(msg.sender, tokensA.length);
    }
    
    function getUserStats(address user) external view returns (
        uint256 tradeCount,
        uint256 volume,
        uint256 lastTradeTime
    ) {
        tradeCount = userTradeCount[user];
        volume = userVolume[user];
        
        PackedTrade[] memory trades = userTrades[user];
        if (trades.length > 0) {
            lastTradeTime = trades[trades.length - 1].timestamp;
        }
    }
    
    function getUserTrades(address user, uint256 offset, uint256 limit) 
        external view returns (PackedTrade[] memory) {
        PackedTrade[] memory allTrades = userTrades[user];
        if (offset >= allTrades.length) {
            return new PackedTrade[](0);
        }
        
        uint256 end = offset + limit;
        if (end > allTrades.length) {
            end = allTrades.length;
        }
        
        PackedTrade[] memory result = new PackedTrade[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allTrades[i];
        }
        
        return result;
    }
}