# 🚀 BaseLytics Deployment Guide

Complete guide for deploying BaseLytics contracts to Base network.

## 📋 Prerequisites

1. **Environment Setup**
   ```bash
   # Add to .env file
   PRIVATE_KEY=your_private_key_here
   BASESCAN_API_KEY=your_basescan_api_key_here
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile Contracts**
   ```bash
   npx hardhat compile
   ```

## ⛽ Gas Estimation

Before deployment, estimate gas costs:

```bash
npx hardhat run scripts/gas-estimate.js --network baseSepolia
```

## 🎯 Deployment Options

### Option 1: Full Deployment
Deploy all contracts at once:
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Option 2: Batch Deployment
Deploy contracts in organized batches:

```bash
# Deploy core contracts (BaseToken, BaseNFT)
npx hardhat run scripts/deploy-batch.js --network baseSepolia core

# Deploy DeFi contracts (BaseStaking, BaseDEX, BaseVesting)
npx hardhat run scripts/deploy-batch.js --network baseSepolia defi

# Deploy governance contracts
npx hardhat run scripts/deploy-batch.js --network baseSepolia governance

# Deploy utility contracts
npx hardhat run scripts/deploy-batch.js --network baseSepolia utilities
```

### Option 3: Individual Deployment
Deploy single contracts:

```bash
# Deploy BaseToken
npx hardhat run scripts/deploy-individual.js --network baseSepolia BaseToken

# Deploy BaseNFT
npx hardhat run scripts/deploy-individual.js --network baseSepolia BaseNFT

# Deploy BaseStaking (requires BaseToken)
npx hardhat run scripts/deploy-individual.js --network baseSepolia BaseStaking
```

## 🔍 Contract Verification

### Verify All Contracts
```bash
npx hardhat run scripts/verify.js --network baseSepolia
```

### Verify Single Contract
```bash
npx hardhat run scripts/verify.js --network baseSepolia BaseToken
```

## 📁 Deployment Tracking

All deployments are automatically saved to `deployments/` folder:
- Format: `{network}-{timestamp}.json`
- Contains contract addresses and deployment info
- Used by verification scripts

## 🌐 Network Configuration

### Base Sepolia (Testnet)
```bash
--network baseSepolia
```

### Base Mainnet
```bash
--network base
```

## 📊 Available Contracts

### Core Contracts
- **BaseToken**: ERC20 token with minting
- **BaseNFT**: ERC721 NFT collection

### DeFi Contracts
- **BaseStaking**: Token staking with rewards
- **BaseDEX**: Decentralized exchange
- **BaseVesting**: Token vesting schedules

### Governance
- **BaseGovernance**: DAO governance system

### Utilities
- **BalanceManager**: Balance management
- **BalanceTracker**: Multi-token tracking
- **BaseMarketplace**: NFT marketplace

## 🔧 Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Check gas estimation first
   - Increase gas limit in hardhat.config.js

2. **Missing Dependencies**
   - Deploy BaseToken before dependent contracts
   - Use batch deployment for proper order

3. **Verification Failures**
   - Ensure contract is deployed
   - Check constructor arguments match

### Gas Optimization Tips

- Deploy in batches to spread costs
- Use gas estimation to plan deployment
- Deploy during low network activity

## 📞 Support

For deployment issues:
1. Check deployment logs in `deployments/` folder
2. Verify network configuration
3. Ensure sufficient ETH balance
4. Open GitHub issue if problems persist