// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

/**
 * @title BalanceTracker
 * @dev A utility contract that can track balances for any ERC20 token
 * This contract can be used to add balance tracking to existing tokens
 */
contract BalanceTracker is Ownable, ReentrancyGuard {
    // Events
    event BalanceTracked(address indexed token, address indexed account, uint256 balance, uint256 timestamp);
    event TransactionTracked(address indexed token, address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    
    // Balance tracking structure
    struct BalanceRecord {
        uint256 balance;
        uint256 timestamp;
        string reason;
    }
    
    // Mapping: token => account => balance history
    mapping(address => mapping(address => BalanceRecord[])) public balanceHistory;
    
    // Mapping: token => account => last check timestamp
    mapping(address => mapping(address => uint256)) public lastBalanceCheck;
    
    // Supported tokens (only owner can add/remove)
    mapping(address => bool) public supportedTokens;
    
    modifier onlySupportedToken(address token) {
        require(supportedTokens[token], "BalanceTracker: token not supported");
        _;
    }

    /**
     * @dev Add a token to the supported list
     * @param token The token contract address
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "BalanceTracker: invalid token address");
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove a token from the supported list
     * @param token The token contract address
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Check and track balance for a specific token and account
     * @param token The token contract address
     * @param account The account to check balance for
     * @return balance The current balance
     * @return lastCheck The timestamp of last balance check
     * @return totalRecords The number of balance records for this account
     */
    function checkBalance(address token, address account) 
        external 
        onlySupportedToken(token) 
        returns (uint256 balance, uint256 lastCheck, uint256 totalRecords) 
    {
        require(account != address(0), "BalanceTracker: cannot check balance for zero address");
        
        IERC20 tokenContract = IERC20(token);
        balance = tokenContract.balanceOf(account);
        lastCheck = lastBalanceCheck[token][account];
        totalRecords = balanceHistory[token][account].length;
        
        // Update last check timestamp
        lastBalanceCheck[token][account] = block.timestamp;
        
        // Record this balance check
        balanceHistory[token][account].push(BalanceRecord({
            balance: balance,
            timestamp: block.timestamp,
            reason: "Balance Check"
        }));
        
        emit BalanceTracked(token, account, balance, block.timestamp);
        
        return (balance, lastCheck, totalRecords);
    }

    /**
     * @dev Track a transaction (call this after any token transfer)
     * @param token The token contract address
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount transferred
     * @param reason Optional reason for the transaction
     */
    function trackTransaction(
        address token, 
        address from, 
        address to, 
        uint256 amount, 
        string calldata reason
    ) external onlySupportedToken(token) {
        require(from != address(0) || to != address(0), "BalanceTracker: invalid addresses");
        
        emit TransactionTracked(token, from, to, amount, block.timestamp);
        
        // Record balance updates for both accounts
        if (from != address(0)) {
            _recordBalanceUpdate(token, from, "Transaction Out", reason);
        }
        if (to != address(0)) {
            _recordBalanceUpdate(token, to, "Transaction In", reason);
        }
    }

    /**
     * @dev Manually record a balance update
     * @param token The token contract address
     * @param account The account to update
     * @param reason The reason for the update
     */
    function recordBalanceUpdate(address token, address account, string calldata reason) 
        external 
        onlySupportedToken(token) 
    {
        require(account != address(0), "BalanceTracker: cannot update balance for zero address");
        
        _recordBalanceUpdate(token, account, "Manual Update", reason);
    }

    /**
     * @dev Get balance history for a specific token and account
     * @param token The token contract address
     * @param account The account to get history for
     * @param limit The maximum number of records to return (0 for all)
     * @return records Array of balance records
     */
    function getBalanceHistory(address token, address account, uint256 limit) 
        external 
        view 
        returns (BalanceRecord[] memory records) 
    {
        BalanceRecord[] storage history = balanceHistory[token][account];
        uint256 length = history.length;
        
        if (limit > 0 && limit < length) {
            length = limit;
        }
        
        records = new BalanceRecord[](length);
        
        // Return most recent records first
        for (uint256 i = 0; i < length; i++) {
            records[i] = history[history.length - 1 - i];
        }
        
        return records;
    }

    /**
     * @dev Get balance at a specific timestamp for a token and account
     * @param token The token contract address
     * @param account The account to check
     * @param timestamp The timestamp to check balance at
     * @return balance The approximate balance at that timestamp
     */
    function getBalanceAt(address token, address account, uint256 timestamp) 
        external 
        view 
        returns (uint256 balance) 
    {
        BalanceRecord[] storage history = balanceHistory[token][account];
        
        // If no history, return current balance
        if (history.length == 0) {
            IERC20 tokenContract = IERC20(token);
            return tokenContract.balanceOf(account);
        }
        
        // Find the closest record before the timestamp
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i - 1].timestamp <= timestamp) {
                return history[i - 1].balance;
            }
        }
        
        // If timestamp is before first record, return 0
        return 0;
    }

    /**
     * @dev Get account statistics for a specific token
     * @param token The token contract address
     * @param account The account to get stats for
     * @return currentBalance Current balance
     * @return totalRecords Total number of balance records
     * @return lastActivity Last activity timestamp
     * @return accountAge Account age in seconds
     */
    function getAccountStats(address token, address account) 
        external 
        view 
        returns (
            uint256 currentBalance,
            uint256 totalRecords,
            uint256 lastActivity,
            uint256 accountAge
        ) 
    {
        IERC20 tokenContract = IERC20(token);
        currentBalance = tokenContract.balanceOf(account);
        totalRecords = balanceHistory[token][account].length;
        
        if (totalRecords > 0) {
            lastActivity = balanceHistory[token][account][totalRecords - 1].timestamp;
            accountAge = block.timestamp - balanceHistory[token][account][0].timestamp;
        } else {
            lastActivity = 0;
            accountAge = 0;
        }
        
        return (currentBalance, totalRecords, lastActivity, accountAge);
    }

    /**
     * @dev Check multiple balances for multiple tokens
     * @param tokens Array of token addresses
     * @param accounts Array of account addresses
     * @return balances 2D array of balances [token][account]
     */
    function checkMultipleBalances(address[] calldata tokens, address[] calldata accounts) 
        external 
        returns (uint256[][] memory balances) 
    {
        balances = new uint256[][](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            require(supportedTokens[tokens[i]], "BalanceTracker: token not supported");
            balances[i] = new uint256[](accounts.length);
            
            for (uint256 j = 0; j < accounts.length; j++) {
                IERC20 tokenContract = IERC20(tokens[i]);
                balances[i][j] = tokenContract.balanceOf(accounts[j]);
                
                // Record the balance check
                balanceHistory[tokens[i]][accounts[j]].push(BalanceRecord({
                    balance: balances[i][j],
                    timestamp: block.timestamp,
                    reason: "Batch Balance Check"
                }));
                
                lastBalanceCheck[tokens[i]][accounts[j]] = block.timestamp;
                
                emit BalanceTracked(tokens[i], accounts[j], balances[i][j], block.timestamp);
            }
        }
        
        return balances;
    }

    /**
     * @dev Internal function to record balance updates
     */
    function _recordBalanceUpdate(address token, address account, string memory action, string memory reason) internal {
        IERC20 tokenContract = IERC20(token);
        uint256 currentBalance = tokenContract.balanceOf(account);
        
        string memory fullReason = string(abi.encodePacked(action, ": ", reason));
        
        balanceHistory[token][account].push(BalanceRecord({
            balance: currentBalance,
            timestamp: block.timestamp,
            reason: fullReason
        }));
        
        emit BalanceTracked(token, account, currentBalance, block.timestamp);
    }

    /**
     * @dev Get the number of supported tokens
     * @return count The number of supported tokens
     */
    function getSupportedTokenCount() external view returns (uint256 count) {
        // This is a simple implementation - in practice you might want to maintain a list
        // For now, we'll return 0 as we can't easily count mappings
        return 0;
    }

    /**
     * @dev Check if a token is supported
     * @param token The token address to check
     * @return supported Whether the token is supported
     */
    function isTokenSupported(address token) external view returns (bool supported) {
        return supportedTokens[token];
    }
}
