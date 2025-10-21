# Balance Management Functions Usage Guide

This guide demonstrates how to use the new balance checking and updating functions in the Baselytics contracts.

## 📋 Overview

We've created two new contracts that provide advanced balance management capabilities:

1. **BalanceManager** - A complete ERC20 token with built-in balance tracking
2. **BalanceTracker** - A utility contract that can track balances for any existing ERC20 token

## 🚀 BalanceManager Contract

The BalanceManager is a full-featured ERC20 token with enhanced balance tracking capabilities.

### Key Features

- **Real-time Balance Checking**: Check balances with detailed information
- **Transaction Tracking**: Automatically tracks all transfers, mints, and burns
- **Balance History**: Complete history of balance changes with timestamps
- **Account Statistics**: Get comprehensive account information
- **Security**: Reentrancy protection and access controls

### Usage Examples

#### 1. Check Balance

```javascript
// Connect to deployed contract
const balanceManager = await ethers.getContractAt("BalanceManager", balanceManagerAddress);

// Check balance for a user
const [balance, lastCheck, totalTransactions] = await balanceManager.checkBalance(userAddress);
console.log(`Balance: ${ethers.formatEther(balance)}`);
console.log(`Last check: ${lastCheck}`);
console.log(`Total transactions: ${totalTransactions}`);
```

#### 2. Transfer with Automatic Tracking

```javascript
// Transfer tokens (automatically tracked)
const transferAmount = ethers.parseEther("100");
await balanceManager.transfer(recipientAddress, transferAmount);

// The contract automatically records:
// - Transaction details
// - Balance updates for both sender and recipient
// - Timestamps and reasons
```

#### 3. Get Balance History

```javascript
// Get complete balance history
const history = await balanceManager.getBalanceHistory(userAddress, 0); // 0 = all records

// Get last 10 transactions
const recentHistory = await balanceManager.getBalanceHistory(userAddress, 10);

// Each record contains:
// - balance: The balance at that time
// - timestamp: When the change occurred
// - reason: Why the balance changed
```

#### 4. Get Account Statistics

```javascript
const [currentBalance, totalTransactions, lastActivity, accountAge] = 
  await balanceManager.getAccountStats(userAddress);

console.log(`Current Balance: ${ethers.formatEther(currentBalance)}`);
console.log(`Total Transactions: ${totalTransactions}`);
console.log(`Last Activity: ${lastActivity}`);
console.log(`Account Age: ${accountAge} seconds`);
```

#### 5. Mint and Burn with Tracking

```javascript
// Mint tokens (owner only)
await balanceManager.mint(userAddress, ethers.parseEther("1000"));

// Burn tokens (owner only)
await balanceManager.burn(userAddress, ethers.parseEther("500"));

// Both operations are automatically tracked
```

## 🔍 BalanceTracker Utility Contract

The BalanceTracker can be used with any existing ERC20 token to add balance tracking capabilities.

### Key Features

- **Multi-Token Support**: Track balances for multiple ERC20 tokens
- **Retroactive Tracking**: Add tracking to existing tokens
- **Flexible Integration**: Works with any ERC20 token
- **Batch Operations**: Check multiple balances at once

### Usage Examples

#### 1. Setup BalanceTracker

```javascript
// Deploy BalanceTracker
const BalanceTracker = await ethers.getContractFactory("BalanceTracker");
const balanceTracker = await BalanceTracker.deploy();

// Add supported tokens
await balanceTracker.addSupportedToken(tokenAddress1);
await balanceTracker.addSupportedToken(tokenAddress2);
```

#### 2. Check Balance for Any Token

```javascript
// Check balance for a specific token
const [balance, lastCheck, totalRecords] = await balanceTracker.checkBalance(
  tokenAddress, 
  userAddress
);

console.log(`Token balance: ${ethers.formatEther(balance)}`);
```

#### 3. Track Transactions

```javascript
// After any token transfer, track it
await token.transfer(recipientAddress, ethers.parseEther("100"));

// Track the transaction
await balanceTracker.trackTransaction(
  tokenAddress,
  senderAddress,
  recipientAddress,
  ethers.parseEther("100"),
  "Payment for services"
);
```

#### 4. Batch Balance Checking

```javascript
// Check balances for multiple tokens and accounts
const tokens = [tokenAddress1, tokenAddress2];
const accounts = [user1Address, user2Address, user3Address];

const balances = await balanceTracker.checkMultipleBalances(tokens, accounts);

// Result: balances[tokenIndex][accountIndex]
console.log(`User1 Token1 Balance: ${ethers.formatEther(balances[0][0])}`);
```

#### 5. Get Balance History

```javascript
// Get balance history for a specific token and account
const history = await balanceTracker.getBalanceHistory(
  tokenAddress, 
  userAddress, 
  10 // Last 10 records
);

history.forEach(record => {
  console.log(`Balance: ${ethers.formatEther(record.balance)}`);
  console.log(`Time: ${record.timestamp}`);
  console.log(`Reason: ${record.reason}`);
});
```

## 🔧 Integration Examples

### Example 1: DEX Integration

```javascript
// Before a swap, check balances
const [balanceBefore] = await balanceTracker.checkBalance(tokenAddress, userAddress);

// Perform swap
await dex.swap(tokenAddress, otherTokenAddress, swapAmount);

// Track the transaction
await balanceTracker.trackTransaction(
  tokenAddress,
  userAddress,
  dexAddress,
  swapAmount,
  "DEX Swap"
);

// Check balance after
const [balanceAfter] = await balanceTracker.checkBalance(tokenAddress, userAddress);
console.log(`Balance change: ${ethers.formatEther(balanceAfter - balanceBefore)}`);
```

### Example 2: Payment System

```javascript
// Check if user has sufficient balance
const [balance] = await balanceTracker.checkBalance(tokenAddress, userAddress);
const paymentAmount = ethers.parseEther("100");

if (balance >= paymentAmount) {
  // Process payment
  await token.transferFrom(userAddress, merchantAddress, paymentAmount);
  
  // Track the payment
  await balanceTracker.trackTransaction(
    tokenAddress,
    userAddress,
    merchantAddress,
    paymentAmount,
    "Payment for goods"
  );
  
  console.log("Payment processed successfully");
} else {
  console.log("Insufficient balance");
}
```

### Example 3: Analytics Dashboard

```javascript
// Get comprehensive account data
const [currentBalance, totalTransactions, lastActivity, accountAge] = 
  await balanceTracker.getAccountStats(tokenAddress, userAddress);

// Get recent transaction history
const recentHistory = await balanceTracker.getBalanceHistory(
  tokenAddress, 
  userAddress, 
  20
);

// Calculate activity metrics
const transactionsToday = recentHistory.filter(
  record => record.timestamp > (Date.now() / 1000) - 86400
).length;

console.log(`Daily transactions: ${transactionsToday}`);
console.log(`Account age: ${Math.floor(accountAge / 86400)} days`);
```

## 🛡️ Security Considerations

1. **Access Control**: Only contract owners can add/remove supported tokens
2. **Reentrancy Protection**: All transfer functions are protected against reentrancy
3. **Input Validation**: All functions validate addresses and amounts
4. **Event Logging**: All operations emit events for off-chain tracking

## 📊 Gas Optimization Tips

1. **Batch Operations**: Use `checkMultipleBalances` for checking multiple accounts
2. **Limit History**: Use limit parameter in `getBalanceHistory` to reduce gas costs
3. **Event Monitoring**: Monitor events instead of calling view functions repeatedly
4. **Selective Tracking**: Only track important transactions to save gas

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Test BalanceManager
npx hardhat test test/BalanceManager.test.js

# Test BalanceTracker
npx hardhat test test/BalanceTracker.test.js

# Run all tests
npx hardhat test
```

## 🚀 Deployment

Deploy all contracts including the new balance management contracts:

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

The deployment script will:
1. Deploy all existing contracts (BaseToken, BaseNFT, BaseStaking)
2. Deploy BalanceManager with 500K initial supply
3. Deploy BalanceTracker utility
4. Add BaseToken to BalanceTracker's supported tokens
5. Save deployment information to `deployments/` folder

## 📈 Use Cases

- **DeFi Applications**: Track user balances across multiple protocols
- **Payment Systems**: Monitor payment flows and detect anomalies
- **Analytics Platforms**: Build comprehensive user activity dashboards
- **Compliance**: Maintain detailed transaction records for regulatory requirements
- **Gaming**: Track in-game currency balances and transactions
- **NFT Marketplaces**: Monitor token balances for trading activities

---

Built with ❤️ for the Base ecosystem
