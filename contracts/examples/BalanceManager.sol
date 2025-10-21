// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

/**
 * @title BalanceManager
 * @dev Enhanced token contract with advanced balance checking and immediate balance updates
 */
contract BalanceManager is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint8 public constant DECIMALS = 18;
    
    // Balance tracking events
    event BalanceChecked(address indexed account, uint256 balance, uint256 timestamp);
    event BalanceUpdated(address indexed account, uint256 oldBalance, uint256 newBalance, string reason);
    event TransactionProcessed(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    
    // Balance history tracking
    struct BalanceSnapshot {
        uint256 balance;
        uint256 timestamp;
        string reason;
    }
    
    mapping(address => BalanceSnapshot[]) public balanceHistory;
    mapping(address => uint256) public lastBalanceCheck;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply <= MAX_SUPPLY, "BalanceManager: initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Check balance for a specific account with detailed information
     * @param account The address to check balance for
     * @return balance The current balance
     * @return lastCheck The timestamp of last balance check
     * @return totalTransactions The number of transactions for this account
     */
    function checkBalance(address account) public returns (uint256 balance, uint256 lastCheck, uint256 totalTransactions) {
        require(account != address(0), "BalanceManager: cannot check balance for zero address");
        
        balance = balanceOf(account);
        lastCheck = lastBalanceCheck[account];
        totalTransactions = balanceHistory[account].length;
        
        // Update last check timestamp
        lastBalanceCheck[account] = block.timestamp;
        
        // Record this balance check
        balanceHistory[account].push(BalanceSnapshot({
            balance: balance,
            timestamp: block.timestamp,
            reason: "Balance Check"
        }));
        
        emit BalanceChecked(account, balance, block.timestamp);
        
        return (balance, lastCheck, totalTransactions);
    }

    /**
     * @dev Check multiple balances at once
     * @param accounts Array of addresses to check
     * @return balances Array of balances corresponding to the accounts
     */
    function checkMultipleBalances(address[] calldata accounts) external returns (uint256[] memory balances) {
        balances = new uint256[](accounts.length);
        
        for (uint256 i = 0; i < accounts.length; i++) {
            (balances[i],,) = checkBalance(accounts[i]);
        }
        
        return balances;
    }

    /**
     * @dev Immediately update balance for an account (owner only)
     * @param account The account to update
     * @param newBalance The new balance amount
     * @param reason The reason for the balance update
     */
    function updateBalance(address account, uint256 newBalance, string calldata reason) external onlyOwner {
        require(account != address(0), "BalanceManager: cannot update balance for zero address");
        
        uint256 oldBalance = balanceOf(account);
        
        // Record the balance change
        balanceHistory[account].push(BalanceSnapshot({
            balance: newBalance,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        emit BalanceUpdated(account, oldBalance, newBalance, reason);
    }

    /**
     * @dev Enhanced transfer with immediate balance update tracking
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return success Whether the transfer was successful
     */
    function transfer(address to, uint256 amount) public override nonReentrant returns (bool success) {
        address from = _msgSender();
        
        // Record transaction before processing
        _recordTransaction(from, to, amount, "Transfer");
        
        // Perform the transfer
        success = super.transfer(to, amount);
        
        // Record balance updates after successful transfer
        if (success) {
            _recordBalanceUpdate(from, "Transfer Out");
            _recordBalanceUpdate(to, "Transfer In");
        }
        
        return success;
    }

    /**
     * @dev Enhanced transferFrom with immediate balance update tracking
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     * @return success Whether the transfer was successful
     */
    function transferFrom(address from, address to, uint256 amount) public override nonReentrant returns (bool success) {
        // Record transaction before processing
        _recordTransaction(from, to, amount, "TransferFrom");
        
        // Perform the transfer
        success = super.transferFrom(from, to, amount);
        
        // Record balance updates after successful transfer
        if (success) {
            _recordBalanceUpdate(from, "TransferFrom Out");
            _recordBalanceUpdate(to, "TransferFrom In");
        }
        
        return success;
    }

    /**
     * @dev Mint tokens with balance tracking
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "BalanceManager: minting would exceed max supply");
        
        // Record transaction
        _recordTransaction(address(0), to, amount, "Mint");
        
        // Perform mint
        _mint(to, amount);
        
        // Record balance update
        _recordBalanceUpdate(to, "Mint");
    }

    /**
     * @dev Burn tokens with balance tracking
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        // Record transaction
        _recordTransaction(from, address(0), amount, "Burn");
        
        // Perform burn
        _burn(from, amount);
        
        // Record balance update
        _recordBalanceUpdate(from, "Burn");
    }

    /**
     * @dev Get balance history for an account
     * @param account The account to get history for
     * @param limit The maximum number of records to return (0 for all)
     * @return snapshots Array of balance snapshots
     */
    function getBalanceHistory(address account, uint256 limit) external view returns (BalanceSnapshot[] memory snapshots) {
        BalanceSnapshot[] storage history = balanceHistory[account];
        uint256 length = history.length;
        
        if (limit > 0 && limit < length) {
            length = limit;
        }
        
        snapshots = new BalanceSnapshot[](length);
        
        // Return most recent records first
        for (uint256 i = 0; i < length; i++) {
            snapshots[i] = history[history.length - 1 - i];
        }
        
        return snapshots;
    }

    /**
     * @dev Get balance at a specific timestamp (approximate)
     * @param account The account to check
     * @param timestamp The timestamp to check balance at
     * @return balance The approximate balance at that timestamp
     */
    function getBalanceAt(address account, uint256 timestamp) external view returns (uint256 balance) {
        BalanceSnapshot[] storage history = balanceHistory[account];
        
        // If no history, return current balance
        if (history.length == 0) {
            return balanceOf(account);
        }
        
        // Find the closest snapshot before the timestamp
        for (uint256 i = history.length; i > 0; i--) {
            if (history[i - 1].timestamp <= timestamp) {
                return history[i - 1].balance;
            }
        }
        
        // If timestamp is before first snapshot, return 0
        return 0;
    }

    /**
     * @dev Internal function to record transactions
     */
    function _recordTransaction(address from, address to, uint256 amount, string memory reason) internal {
        emit TransactionProcessed(from, to, amount, block.timestamp);
    }

    /**
     * @dev Internal function to record balance updates
     */
    function _recordBalanceUpdate(address account, string memory reason) internal {
        uint256 currentBalance = balanceOf(account);
        
        balanceHistory[account].push(BalanceSnapshot({
            balance: currentBalance,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        emit BalanceUpdated(account, 0, currentBalance, reason);
    }

    /**
     * @dev Override decimals to return the constant value
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Get account statistics
     * @param account The account to get stats for
     * @return currentBalance Current balance
     * @return totalTransactions Total number of transactions
     * @return lastActivity Last activity timestamp
     * @return accountAge Account age in seconds
     */
    function getAccountStats(address account) external view returns (
        uint256 currentBalance,
        uint256 totalTransactions,
        uint256 lastActivity,
        uint256 accountAge
    ) {
        currentBalance = balanceOf(account);
        totalTransactions = balanceHistory[account].length;
        
        if (totalTransactions > 0) {
            lastActivity = balanceHistory[account][totalTransactions - 1].timestamp;
            accountAge = block.timestamp - balanceHistory[account][0].timestamp;
        } else {
            lastActivity = 0;
            accountAge = 0;
        }
        
        return (currentBalance, totalTransactions, lastActivity, accountAge);
    }
}
