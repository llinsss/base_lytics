// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";
import "../security/Pausable.sol";

contract BaseDEX is Ownable, ReentrancyGuard, Pausable {
    event LiquidityAdded(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event TokensSwapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
    }

    mapping(bytes32 => Pool) public pools;
    mapping(address => bool) public supportedTokens;
    
    uint256 public constant FEE_RATE = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function createPool(address tokenA, address tokenB) external onlyOwner returns (bytes32) {
        require(tokenA != tokenB, "identical tokens");
        require(supportedTokens[tokenA] && supportedTokens[tokenB], "unsupported token");
        
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        
        require(pools[poolId].tokenA == address(0), "pool exists");
        
        pools[poolId].tokenA = token0;
        pools[poolId].tokenB = token1;
        
        return poolId;
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external nonReentrant whenNotPaused {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        (uint256 amount0, uint256 amount1) = tokenA < tokenB ? (amountA, amountB) : (amountB, amountA);
        
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[poolId];
        
        require(pool.tokenA != address(0), "pool does not exist");
        
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        
        uint256 liquidityMinted;
        if (pool.totalLiquidity == 0) {
            liquidityMinted = sqrt(amount0 * amount1);
        } else {
            liquidityMinted = min(
                (amount0 * pool.totalLiquidity) / pool.reserveA,
                (amount1 * pool.totalLiquidity) / pool.reserveB
            );
        }
        
        pool.reserveA += amount0;
        pool.reserveB += amount1;
        pool.totalLiquidity += liquidityMinted;
        pool.liquidity[msg.sender] += liquidityMinted;
        
        emit LiquidityAdded(msg.sender, token0, token1, amount0, amount1);
    }

    function removeLiquidity(address tokenA, address tokenB, uint256 liquidity) external nonReentrant {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[poolId];
        
        require(pool.liquidity[msg.sender] >= liquidity, "insufficient liquidity");
        
        uint256 amount0 = (liquidity * pool.reserveA) / pool.totalLiquidity;
        uint256 amount1 = (liquidity * pool.reserveB) / pool.totalLiquidity;
        
        pool.liquidity[msg.sender] -= liquidity;
        pool.totalLiquidity -= liquidity;
        pool.reserveA -= amount0;
        pool.reserveB -= amount1;
        
        IERC20(token0).transfer(msg.sender, amount0);
        IERC20(token1).transfer(msg.sender, amount1);
        
        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1);
    }

    function swapTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external nonReentrant whenNotPaused {
        require(tokenIn != tokenOut, "identical tokens");
        require(supportedTokens[tokenIn] && supportedTokens[tokenOut], "unsupported token");
        
        (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[poolId];
        
        require(pool.tokenA != address(0), "pool does not exist");
        
        bool isToken0 = tokenIn == token0;
        (uint256 reserveIn, uint256 reserveOut) = isToken0 ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        uint256 amountOut = numerator / denominator;
        
        require(amountOut >= minAmountOut, "insufficient output amount");
        
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
        
        if (isToken0) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }
        
        emit TokensSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256) {
        (address token0, address token1) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[poolId];
        
        bool isToken0 = tokenIn == token0;
        (uint256 reserveIn, uint256 reserveOut) = isToken0 ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);
        
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }

    function getPoolInfo(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB, uint256 totalLiquidity) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        Pool storage pool = pools[poolId];
        
        bool isToken0 = tokenA == token0;
        (reserveA, reserveB) = isToken0 ? (pool.reserveA, pool.reserveB) : (pool.reserveB, pool.reserveA);
        totalLiquidity = pool.totalLiquidity;
    }

    function getUserLiquidity(address tokenA, address tokenB, address user) external view returns (uint256) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        return pools[poolId].liquidity[user];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}