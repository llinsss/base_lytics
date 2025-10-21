# Quick Start Guide

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/llinsss/base_lytics.git
cd base_lytics
npm install
```

### 2. Environment Setup
Create a `.env` file:
```bash
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
```

### 3. Compile Contracts
```bash
npx hardhat compile
```

### 4. Run Tests
```bash
npx hardhat test
```

### 5. Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

## 📋 Contract Usage Examples

### BaseToken Example
```solidity
// Deploy
BaseToken token = new BaseToken("My Token", "MTK", 1000000 * 10**18);

// Mint tokens (owner only)
token.mint(userAddress, 1000 * 10**18);

// Burn tokens (owner only)
token.burn(userAddress, 100 * 10**18);
```

### BaseNFT Example
```solidity
// Deploy
BaseNFT nft = new BaseNFT("My NFT", "MNFT", "https://api.example.com/");

// Public mint (requires payment)
nft.mint{value: 0.01 ether}();

// Batch mint
nft.mintBatch{value: 0.05 ether}(5);

// Owner mint (free)
nft.ownerMint(userAddress, 10);
```

### BaseStaking Example
```solidity
// Deploy
BaseStaking staking = new BaseStaking(tokenAddress);

// Approve and stake
token.approve(address(staking), 1000 * 10**18);
staking.stake(1000 * 10**18);

// Check rewards
uint256 rewards = staking.calculateReward(userAddress);

// Claim rewards
staking.claimRewards();

// Unstake
staking.unstake(500 * 10**18);
```

## 🔧 Common Operations

### Minting Tokens
```javascript
// Connect to deployed contract
const token = await ethers.getContractAt("BaseToken", tokenAddress);

// Mint 1000 tokens to user
await token.mint(userAddress, ethers.parseEther("1000"));
```

### Minting NFTs
```javascript
// Connect to deployed contract
const nft = await ethers.getContractAt("BaseNFT", nftAddress);

// Public mint (user pays)
await nft.connect(user).mint({ value: ethers.parseEther("0.01") });

// Owner mint (free)
await nft.ownerMint(userAddress, 5);
```

### Staking Operations
```javascript
// Connect to contracts
const token = await ethers.getContractAt("BaseToken", tokenAddress);
const staking = await ethers.getContractAt("BaseStaking", stakingAddress);

// Approve staking contract
await token.connect(user).approve(stakingAddress, ethers.parseEther("1000"));

// Stake tokens
await staking.connect(user).stake(ethers.parseEther("1000"));

// Check rewards after some time
const rewards = await staking.calculateReward(userAddress);
console.log("Pending rewards:", ethers.formatEther(rewards));
```

## 🛠️ Development Tips

### Testing Locally
```bash
# Start local hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Run specific test
npx hardhat test test/BaseToken.test.js
```

### Debugging
```bash
# Compile with detailed output
npx hardhat compile --verbose

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Verification
```bash
# Verify on BaseScan
npx hardhat verify --network baseSepolia CONTRACT_ADDRESS "Constructor" "Args"
```

## 📊 Gas Optimization Tips

1. **Batch Operations**: Use batch minting for NFTs when possible
2. **Approve Once**: Set maximum allowance to avoid repeated approvals
3. **Pack Structs**: Organize struct fields to minimize storage slots
4. **Use Events**: Emit events for off-chain tracking instead of storing everything

## 🔒 Security Best Practices

1. **Always use `onlyOwner`** for administrative functions
2. **Add `nonReentrant`** to functions that transfer tokens/ETH
3. **Validate inputs** - check for zero addresses and amounts
4. **Use `whenNotPaused`** for critical user functions
5. **Test thoroughly** - especially edge cases and error conditions

## 🚨 Common Issues

### Compilation Errors
- Ensure Solidity version matches (^0.8.19)
- Check import paths are correct
- Verify all dependencies are installed

### Deployment Failures
- Check network configuration in hardhat.config.js
- Ensure sufficient ETH balance for gas
- Verify private key is set correctly

### Transaction Failures
- Check gas limits and prices
- Verify contract addresses are correct
- Ensure proper approvals are set

## 📞 Getting Help

1. Check the test files for usage examples
2. Review the CONTRACTS.md documentation
3. Open an issue on GitHub
4. Check Hardhat documentation for tooling issues

---

Happy building! 🎉