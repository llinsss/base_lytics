// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../security/Pausable.sol";
import "../utils/Math.sol";

/**
 * @title BaseDEX
 * @dev A decentralized exchange (DEX) with automated market maker (AMM) functionality
 * Features: Token swaps, liquidity provision, price discovery, fee distribution
 */
contract BaseDEX is Ownable, ReentrancyGuard, Pausable {
    using Math for uint256;

    // Events
    event LiquidityAdded(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB, uint256 liquidity);
    event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event FeeCollected(address indexed token, uint256 amount);
    event PoolCreated(address indexed tokenA, address indexed tokenB, address indexed pool);

    // Pool structure
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalSupply;
        uint256 feeRate; // Fee rate in basis points (e.g., 30 = 0.3%)
        bool exists;
    }

    // Liquidity provider positions
    struct LiquidityPosition {
        uint256 amount;
        uint256 timestamp;
        uint256 feeShare;
    }

    // State variables
    mapping(address => mapping(address => Pool)) public pools;
    mapping(address => mapping(address => mapping(address => LiquidityPosition))) public liquidityPositions;
    mapping(address => uint256) public totalFeesCollected;
    
    uint256 public constant FEE_DENOMINATOR = 10000; // 100% = 10000 basis points
    uint256 public defaultFeeRate = 30; // 0.3% default fee
    uint256 public minLiquidity = 1000; // Minimum liquidity to prevent precision loss
    
    // Fee distribution
    uint256 public protocolFeeRate = 1000; // 10% of trading fees go to protocol
    address public feeRecipient;

    constructor() {
        feeRecipient = msg.sender;
    }

    /**
     * @dev Create a new liquidity pool
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param feeRate Custom fee rate for this pool (optional, 0 uses default)
     */
    function createPool(address tokenA, address tokenB, uint256 feeRate) external onlyOwner {
        require(tokenA != tokenB, "BaseDEX: identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "BaseDEX: zero address");
        require(!pools[tokenA][tokenB].exists, "BaseDEX: pool exists");
        
        uint256 poolFeeRate = feeRate == 0 ? defaultFeeRate : feeRate;
        require(poolFeeRate <= 1000, "BaseDEX: fee too high"); // Max 10%
        
        pools[tokenA][tokenB] = Pool({
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: 0,
            reserveB: 0,
            totalSupply: 0,
            feeRate: poolFeeRate,
            exists: true
        });
        
        emit PoolCreated(tokenA, tokenB, address(this));
    }

    /**
     * @dev Add liquidity to a pool
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param amountA Amount of tokenA to add
     * @param amountB Amount of tokenB to add
     * @param minLiquidityA Minimum amount of tokenA (slippage protection)
     * @param minLiquidityB Minimum amount of tokenB (slippage protection)
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 minLiquidityA,
        uint256 minLiquidityB
    ) external nonReentrant whenNotPaused {
        require(pools[tokenA][tokenB].exists, "BaseDEX: pool does not exist");
        require(amountA > 0 && amountB > 0, "BaseDEX: invalid amounts");
        
        Pool storage pool = pools[tokenA][tokenB];
        uint256 liquidity;
        
        if (pool.totalSupply == 0) {
            // First liquidity provision
            liquidity = Math.sqrt(amountA * amountB) - minLiquidity;
            require(liquidity >= minLiquidity, "BaseDEX: insufficient liquidity");
        } else {
            // Calculate liquidity based on existing reserves
            uint256 liquidityA = (amountA * pool.totalSupply) / pool.reserveA;
            uint256 liquidityB = (amountB * pool.totalSupply) / pool.reserveB;
            liquidity = Math.min(liquidityA, liquidityB);
            
            require(amountA >= minLiquidityA && amountB >= minLiquidityB, "BaseDEX: insufficient amounts");
        }
        
        // Transfer tokens from user
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "BaseDEX: transfer A failed");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "BaseDEX: transfer B failed");
        
        // Update pool reserves
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalSupply += liquidity;
        
        // Update liquidity position
        liquidityPositions[msg.sender][tokenA][tokenB].amount += liquidity;
        liquidityPositions[msg.sender][tokenA][tokenB].timestamp = block.timestamp;
        
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);
    }

    /**
     * @dev Remove liquidity from a pool
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidity Amount of liquidity tokens to remove
     * @param minAmountA Minimum amount of tokenA to receive
     * @param minAmountB Minimum amount of tokenB to receive
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant {
        require(pools[tokenA][tokenB].exists, "BaseDEX: pool does not exist");
        require(liquidity > 0, "BaseDEX: invalid liquidity");
        
        Pool storage pool = pools[tokenA][tokenB];
        require(liquidityPositions[msg.sender][tokenA][tokenB].amount >= liquidity, "BaseDEX: insufficient liquidity");
        
        // Calculate amounts to return
        uint256 amountA = (liquidity * pool.reserveA) / pool.totalSupply;
        uint256 amountB = (liquidity * pool.reserveB) / pool.totalSupply;
        
        require(amountA >= minAmountA && amountB >= minAmountB, "BaseDEX: insufficient amounts");
        
        // Update pool reserves
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;
        pool.totalSupply -= liquidity;
        
        // Update liquidity position
        liquidityPositions[msg.sender][tokenA][tokenB].amount -= liquidity;
        
        // Transfer tokens to user
        require(IERC20(tokenA).transfer(msg.sender, amountA), "BaseDEX: transfer A failed");
        require(IERC20(tokenB).transfer(msg.sender, amountB), "BaseDEX: transfer B failed");
        
        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);
    }

    /**
     * @dev Execute a token swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @param minAmountOut Minimum amount of output tokens (slippage protection)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused {
        require(pools[tokenIn][tokenOut].exists || pools[tokenOut][tokenIn].exists, "BaseDEX: pool does not exist");
        require(amountIn > 0, "BaseDEX: invalid amount");
        
        Pool storage pool = pools[tokenIn][tokenOut].exists ? 
            pools[tokenIn][tokenOut] : pools[tokenOut][tokenIn];
        
        // Calculate output amount using constant product formula
        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= minAmountOut, "BaseDEX: insufficient output");
        
        // Calculate fees
        uint256 fee = (amountIn * pool.feeRate) / FEE_DENOMINATOR;
        uint256 protocolFee = (fee * protocolFeeRate) / FEE_DENOMINATOR;
        uint256 liquidityFee = fee - protocolFee;
        
        // Transfer input tokens from user
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "BaseDEX: transfer failed");
        
        // Update reserves
        if (pool.tokenA == tokenIn) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        // Transfer output tokens to user
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "BaseDEX: transfer failed");
        
        // Update fee tracking
        totalFeesCollected[tokenIn] += protocolFee;
        
        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        emit FeeCollected(tokenIn, protocolFee);
    }

    /**
     * @dev Calculate output amount for a swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @return amountOut Amount of output tokens
     */
    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256 amountOut) {
        require(pools[tokenIn][tokenOut].exists || pools[tokenOut][tokenIn].exists, "BaseDEX: pool does not exist");
        
        Pool memory pool = pools[tokenIn][tokenOut].exists ? 
            pools[tokenIn][tokenOut] : pools[tokenOut][tokenIn];
        
        uint256 reserveIn = pool.tokenA == tokenIn ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = pool.tokenA == tokenIn ? pool.reserveB : pool.reserveA;
        
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "BaseDEX: invalid amounts");
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - pool.feeRate);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        amountOut = numerator / denominator;
    }

    /**
     * @dev Get pool information
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return reserveA Reserve of tokenA
     * @return reserveB Reserve of tokenB
     * @return totalSupply Total liquidity supply
     * @return feeRate Pool fee rate
     */
    function getPoolInfo(address tokenA, address tokenB) external view returns (
        uint256 reserveA,
        uint256 reserveB,
        uint256 totalSupply,
        uint256 feeRate
    ) {
        Pool memory pool = pools[tokenA][tokenB].exists ? 
            pools[tokenA][tokenB] : pools[tokenB][tokenA];
        
        require(pool.exists, "BaseDEX: pool does not exist");
        
        return (pool.reserveA, pool.reserveB, pool.totalSupply, pool.feeRate);
    }

    /**
     * @dev Get user's liquidity position
     * @param user User address
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return amount Liquidity amount
     * @return timestamp Position timestamp
     */
    function getLiquidityPosition(address user, address tokenA, address tokenB) external view returns (
        uint256 amount,
        uint256 timestamp
    ) {
        LiquidityPosition memory position = liquidityPositions[user][tokenA][tokenB];
        return (position.amount, position.timestamp);
    }

    /**
     * @dev Calculate user's share of fees
     * @param user User address
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return feeShare User's fee share
     */
    function calculateFeeShare(address user, address tokenA, address tokenB) external view returns (uint256 feeShare) {
        Pool memory pool = pools[tokenA][tokenB].exists ? 
            pools[tokenA][tokenB] : pools[tokenB][tokenA];
        
        require(pool.exists, "BaseDEX: pool does not exist");
        
        LiquidityPosition memory position = liquidityPositions[user][tokenA][tokenB];
        if (pool.totalSupply > 0) {
            feeShare = (position.amount * totalFeesCollected[tokenA]) / pool.totalSupply;
        }
    }

    /**
     * @dev Claim accumulated fees
     * @param tokenA First token address
     * @param tokenB Second token address
     */
    function claimFees(address tokenA, address tokenB) external nonReentrant {
        Pool storage pool = pools[tokenA][tokenB].exists ? 
            pools[tokenA][tokenB] : pools[tokenB][tokenA];
        
        require(pool.exists, "BaseDEX: pool does not exist");
        
        LiquidityPosition storage position = liquidityPositions[msg.sender][tokenA][tokenB];
        require(position.amount > 0, "BaseDEX: no liquidity position");
        
        uint256 feeShare = (position.amount * totalFeesCollected[tokenA]) / pool.totalSupply;
        require(feeShare > 0, "BaseDEX: no fees to claim");
        
        // Reset user's fee share
        position.feeShare = 0;
        
        // Transfer fees to user
        require(IERC20(tokenA).transfer(msg.sender, feeShare), "BaseDEX: fee transfer failed");
    }

    /**
     * @dev Set default fee rate (owner only)
     * @param newFeeRate New fee rate in basis points
     */
    function setDefaultFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= 1000, "BaseDEX: fee too high");
        defaultFeeRate = newFeeRate;
    }

    /**
     * @dev Set protocol fee rate (owner only)
     * @param newProtocolFeeRate New protocol fee rate in basis points
     */
    function setProtocolFeeRate(uint256 newProtocolFeeRate) external onlyOwner {
        require(newProtocolFeeRate <= 2000, "BaseDEX: protocol fee too high"); // Max 20%
        protocolFeeRate = newProtocolFeeRate;
    }

    /**
     * @dev Set fee recipient (owner only)
     * @param newFeeRecipient New fee recipient address
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "BaseDEX: zero address");
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Pause the contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (owner only)
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner(), amount), "BaseDEX: emergency withdraw failed");
    }

    /**
     * @dev Get quote for a swap
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input tokens
     * @return amountOut Amount of output tokens
     * @return priceImpact Price impact percentage
     */
    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (
        uint256 amountOut,
        uint256 priceImpact
    ) {
        amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        
        Pool memory pool = pools[tokenIn][tokenOut].exists ? 
            pools[tokenIn][tokenOut] : pools[tokenOut][tokenIn];
        
        uint256 reserveIn = pool.tokenA == tokenIn ? pool.reserveA : pool.reserveB;
        uint256 reserveOut = pool.tokenA == tokenIn ? pool.reserveB : pool.reserveA;
        
        // Calculate price impact
        uint256 priceBefore = (reserveOut * 1e18) / reserveIn;
        uint256 priceAfter = (amountOut * 1e18) / amountIn;
        priceImpact = ((priceBefore - priceAfter) * 10000) / priceBefore;
    }
}
