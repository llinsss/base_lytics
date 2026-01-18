// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

interface IFlashLoanReceiver {
    function executeOperation(address asset, uint256 amount, uint256 fee, bytes calldata params) external;
}

contract BaseFlashLoan is Ownable, ReentrancyGuard {
    event FlashLoan(address indexed receiver, address indexed asset, uint256 amount, uint256 fee);
    event PoolUpdated(address indexed asset, uint256 liquidity);

    mapping(address => uint256) public poolLiquidity;
    mapping(address => bool) public supportedAssets;
    
    uint256 public flashLoanFee = 9; // 0.09%
    uint256 public constant FEE_DENOMINATOR = 10000;

    function addAsset(address asset) external onlyOwner {
        supportedAssets[asset] = true;
    }

    function deposit(address asset, uint256 amount) external nonReentrant {
        require(supportedAssets[asset], "asset not supported");
        require(amount > 0, "invalid amount");

        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        poolLiquidity[asset] += amount;

        emit PoolUpdated(asset, poolLiquidity[asset]);
    }

    function withdraw(address asset, uint256 amount) external onlyOwner {
        require(poolLiquidity[asset] >= amount, "insufficient liquidity");
        
        poolLiquidity[asset] -= amount;
        IERC20(asset).transfer(msg.sender, amount);

        emit PoolUpdated(asset, poolLiquidity[asset]);
    }

    function flashLoan(address receiver, address asset, uint256 amount, bytes calldata params) external nonReentrant {
        require(supportedAssets[asset], "asset not supported");
        require(amount > 0, "invalid amount");
        require(poolLiquidity[asset] >= amount, "insufficient liquidity");

        uint256 fee = (amount * flashLoanFee) / FEE_DENOMINATOR;
        uint256 balanceBefore = IERC20(asset).balanceOf(address(this));

        // Transfer loan amount to receiver
        IERC20(asset).transfer(receiver, amount);

        // Execute receiver logic
        IFlashLoanReceiver(receiver).executeOperation(asset, amount, fee, params);

        // Check repayment
        uint256 balanceAfter = IERC20(asset).balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "loan not repaid");

        emit FlashLoan(receiver, asset, amount, fee);
    }

    function getAvailableLiquidity(address asset) external view returns (uint256) {
        return poolLiquidity[asset];
    }

    function setFlashLoanFee(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "fee too high"); // Max 1%
        flashLoanFee = newFee;
    }
}

contract FlashLoanExample is IFlashLoanReceiver {
    function executeOperation(address asset, uint256 amount, uint256 fee, bytes calldata params) external override {
        // Example: Simple arbitrage logic
        // 1. Use the borrowed amount for arbitrage
        // 2. Ensure profit > fee
        // 3. Repay loan + fee
        
        uint256 totalRepayment = amount + fee;
        IERC20(asset).transfer(msg.sender, totalRepayment);
    }
}