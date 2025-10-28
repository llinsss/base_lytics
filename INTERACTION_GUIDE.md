# 🔧 BaseLytics Contract Interaction Guide

Complete guide for interacting with deployed BaseLytics contracts.

## 📋 Prerequisites

1. **Contracts must be deployed** - Use deployment scripts first
2. **Network configuration** - Ensure correct network in commands
3. **Account setup** - Private key in `.env` with sufficient ETH/tokens

## 🚀 Quick Commands

### Contract Information
```bash
# View all contract states and user balances
npm run info --network baseSepolia

# View specific address info
npm run info --network baseSepolia 0x123...
```

### Token Operations
```bash
# Mint tokens (owner only)
npm run mint --network baseSepolia 0x123... 1000

# Check staking info
npm run stake --network baseSepolia 0 info

# Stake tokens
npm run stake --network baseSepolia 100 stake

# Unstake tokens
npm run stake --network baseSepolia 50 unstake

# Claim rewards
npm run stake --network baseSepolia 0 claim
```

### NFT Operations
```bash
# Mint single NFT (pays ETH)
npm run nft --network baseSepolia mint

# Batch mint NFTs (owner only)
npm run nft --network baseSepolia batch-mint 10

# View NFT info
npm run nft --network baseSepolia info

# Transfer NFT
npm run nft --network baseSepolia transfer 0x123... 1
```

### Admin Functions
```bash
# Pause/unpause NFT contract
npm run admin --network baseSepolia BaseNFT pause
npm run admin --network baseSepolia BaseNFT unpause

# Set staking reward rate
npm run admin --network baseSepolia BaseStaking set-reward-rate 200

# Transfer ownership
npm run admin --network baseSepolia BaseToken transfer-ownership 0x123...
```

### User Journey Simulation
```bash
# Complete user workflow
npm run journey --network baseSepolia complete

# Specific scenarios
npm run journey --network baseSepolia tokens
npm run journey --network baseSepolia nft
npm run journey --network baseSepolia staking
```

## 📁 Script Categories

### 🔧 Interaction Scripts (`scripts/interact/`)

#### `mint-tokens.js`
Mint BaseTokens to specified addresses (owner only).
```bash
npx hardhat run scripts/interact/mint-tokens.js --network baseSepolia 0x123... 1000
```

#### `stake-tokens.js`
Handle all staking operations.
```bash
# Stake tokens
npx hardhat run scripts/interact/stake-tokens.js --network baseSepolia 100 stake

# View staking info
npx hardhat run scripts/interact/stake-tokens.js --network baseSepolia 0 info
```

#### `nft-operations.js`
Manage NFT minting and transfers.
```bash
# Mint NFT
npx hardhat run scripts/interact/nft-operations.js --network baseSepolia mint

# Batch mint (owner)
npx hardhat run scripts/interact/nft-operations.js --network baseSepolia batch-mint 5
```

#### `user-journey.js`
Simulate complete user workflows.
```bash
npx hardhat run scripts/interact/user-journey.js --network baseSepolia complete
```

### ⚙️ Admin Scripts (`scripts/admin/`)

#### `contract-admin.js`
Owner-only administrative functions.

**BaseToken Admin:**
- `set-max-supply <amount>` - Update maximum token supply
- `transfer-ownership <address>` - Transfer contract ownership

**BaseNFT Admin:**
- `pause` / `unpause` - Emergency pause functionality
- `toggle-minting` - Enable/disable public minting
- `withdraw` - Withdraw collected ETH
- `set-base-uri <uri>` - Update metadata URI

**BaseStaking Admin:**
- `set-reward-rate <rate>` - Update reward rate (basis points)
- `emergency-withdraw` - Emergency function

### 🔍 Utility Scripts (`scripts/utils/`)

#### `contract-info.js`
View comprehensive contract and user information.
```bash
npx hardhat run scripts/utils/contract-info.js --network baseSepolia [address]
```

#### `contract-loader.js`
Utility class for loading deployed contracts (used by other scripts).

## 📊 Example Workflows

### New User Onboarding
1. **Get tokens** - Receive from owner or earn
2. **Mint NFT** - Pay ETH to mint
3. **Stake tokens** - Earn rewards
4. **Check rewards** - Monitor earnings
5. **Claim rewards** - Withdraw earnings

### Owner Management
1. **Deploy contracts** - Use deployment scripts
2. **Mint initial tokens** - Distribute to users
3. **Configure parameters** - Set rates, URIs, etc.
4. **Monitor activity** - Check contract states
5. **Emergency actions** - Pause if needed

### Developer Integration
1. **Load contracts** - Use ContractLoader utility
2. **Check states** - Verify contract status
3. **Simulate operations** - Test interactions
4. **Monitor gas usage** - Optimize transactions

## 🛡️ Security Notes

### Access Control
- **Owner functions** require contract ownership
- **User functions** require sufficient balances/approvals
- **Always verify** contract addresses before interaction

### Transaction Safety
- **Check gas prices** before transactions
- **Verify parameters** to avoid mistakes
- **Use testnet first** for new operations

### Error Handling
- Scripts include comprehensive error messages
- **Check network connectivity** if transactions fail
- **Verify contract deployment** if loading fails

## 🔧 Troubleshooting

### Common Issues

1. **"Contract not found"**
   - Ensure contracts are deployed on the network
   - Check deployment files in `deployments/` folder

2. **"Insufficient balance"**
   - Check ETH balance for gas fees
   - Check token balance for operations

3. **"Only owner can..."**
   - Verify you're using the owner account
   - Check contract ownership with info script

4. **Transaction failures**
   - Increase gas limit in hardhat.config.js
   - Check network congestion

### Debug Commands
```bash
# Check deployment status
ls deployments/

# Verify network connection
npx hardhat console --network baseSepolia

# Check account balance
npx hardhat run scripts/utils/contract-info.js --network baseSepolia
```

## 📞 Support

For interaction issues:
1. Check contract deployment status
2. Verify network configuration
3. Ensure sufficient balances
4. Review error messages carefully
5. Test on testnet first