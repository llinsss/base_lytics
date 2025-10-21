# BaseLytics Smart Contracts Documentation

## 📋 Overview

This repository contains a comprehensive collection of base smart contracts for blockchain applications, built with security and best practices in mind. All contracts are implemented using Solidity ^0.8.19 and follow established standards.

## 🏗️ Architecture

### Core Interfaces
- **IERC20.sol** - Standard ERC20 token interface
- **IERC20Metadata.sol** - ERC20 metadata extension interface
- **IERC721.sol** - Standard ERC721 NFT interface
- **IERC721Metadata.sol** - ERC721 metadata extension interface
- **IERC721Receiver.sol** - Interface for contracts that can receive ERC721 tokens
- **IERC1155.sol** - Multi-token standard interface
- **IERC165.sol** - Interface detection standard

### Utility Libraries
- **Context.sol** - Provides secure access to msg.sender and msg.data
- **Address.sol** - Address validation and interaction utilities
- **Math.sol** - Mathematical operations with overflow protection
- **Strings.sol** - String manipulation utilities
- **ERC165.sol** - Implementation of interface detection

### Access Control
- **Ownable.sol** - Basic ownership access control pattern

### Security Modules
- **Pausable.sol** - Emergency pause functionality
- **ReentrancyGuard.sol** - Protection against reentrancy attacks

### Token Implementations
- **ERC20.sol** - Complete ERC20 token implementation
- **ERC721.sol** - Complete ERC721 NFT implementation

### Example Contracts
- **BaseToken.sol** - ERC20 token with minting and burning
- **BaseNFT.sol** - ERC721 NFT with public/owner minting and pause functionality
- **BaseStaking.sol** - Token staking contract with rewards

## 📖 Contract Details

### BaseToken (ERC20)

A feature-rich ERC20 token implementation with:

**Features:**
- Standard ERC20 functionality (transfer, approve, etc.)
- Owner-only minting capabilities
- Owner-only burning functionality
- Maximum supply limit (1 billion tokens)
- 18 decimal places

**Key Functions:**
```solidity
function mint(address to, uint256 amount) public onlyOwner
function burn(address from, uint256 amount) public onlyOwner
```

**Constants:**
- `MAX_SUPPLY`: 1,000,000,000 tokens (1 billion)
- `DECIMALS`: 18

### BaseNFT (ERC721)

A comprehensive NFT collection contract with:

**Features:**
- Public minting with ETH payment (0.01 ETH per NFT)
- Batch minting (up to 10 per transaction)
- Owner minting (free, any quantity)
- Pausable functionality
- Withdrawal mechanism for collected ETH
- Configurable base URI for metadata

**Key Functions:**
```solidity
function mint() public payable whenNotPaused
function mintBatch(uint256 quantity) public payable whenNotPaused
function ownerMint(address to, uint256 quantity) public onlyOwner
function setBaseURI(string memory baseURI) public onlyOwner
function pause() public onlyOwner
function withdraw() public onlyOwner
```

**Constants:**
- `MAX_SUPPLY`: 10,000 NFTs
- `MAX_MINT_PER_TX`: 10 NFTs per transaction
- `PRICE`: 0.01 ETH per NFT

### BaseStaking

A token staking contract with reward distribution:

**Features:**
- Stake ERC20 tokens to earn rewards
- Configurable reward rates (default 1% per day)
- Automatic reward calculation based on time staked
- Emergency functions for contract management
- Reentrancy protection
- Pausable functionality

**Key Functions:**
```solidity
function stake(uint256 amount) external nonReentrant whenNotPaused
function unstake(uint256 amount) external nonReentrant
function claimRewards() external nonReentrant
function calculateReward(address user) public view returns (uint256)
function setRewardRate(uint256 newRate) external onlyOwner
```

**Reward Calculation:**
- Rewards are calculated per second based on staked amount
- Default rate: 100 basis points (1% per day)
- Maximum rate: 1000 basis points (10% per day)

## 🚀 Deployment

### Prerequisites
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### Verify Contracts
```bash
npx hardhat run scripts/verify.js --network baseSepolia
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with:
```
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
```

### Network Configuration
The project is configured for:
- **Base Mainnet** - Production deployment
- **Base Sepolia** - Testnet deployment
- **Localhost** - Local development

## 🧪 Testing

The test suite covers:
- Token minting and burning functionality
- NFT minting with payment validation
- Staking and unstaking mechanisms
- Reward calculations
- Access control restrictions
- Pause/unpause functionality
- Edge cases and error conditions

Run tests with:
```bash
npx hardhat test
```

## 🔒 Security Features

### Access Control
- Owner-only functions protected by `onlyOwner` modifier
- Proper ownership transfer mechanisms
- Zero address validation

### Reentrancy Protection
- `nonReentrant` modifier on critical functions
- Checks-effects-interactions pattern
- State updates before external calls

### Pause Functionality
- Emergency pause capability for critical contracts
- `whenNotPaused` and `whenPaused` modifiers
- Owner-controlled pause/unpause functions

### Input Validation
- Zero address checks
- Amount validation (> 0)
- Supply limit enforcement
- Rate limit validation

## 📝 Usage Examples

### Deploy and Use BaseToken
```javascript
const BaseToken = await ethers.getContractFactory("BaseToken");
const token = await BaseToken.deploy("My Token", "MTK", ethers.parseEther("1000000"));

// Mint tokens
await token.mint(userAddress, ethers.parseEther("1000"));

// Transfer tokens
await token.transfer(recipientAddress, ethers.parseEther("100"));
```

### Deploy and Use BaseNFT
```javascript
const BaseNFT = await ethers.getContractFactory("BaseNFT");
const nft = await BaseNFT.deploy("My NFT", "MNFT", "https://api.example.com/");

// Public mint
await nft.connect(user).mint({ value: ethers.parseEther("0.01") });

// Owner mint
await nft.ownerMint(userAddress, 5);
```

### Deploy and Use BaseStaking
```javascript
const BaseStaking = await ethers.getContractFactory("BaseStaking");
const staking = await BaseStaking.deploy(tokenAddress);

// Stake tokens
await token.approve(stakingAddress, ethers.parseEther("100"));
await staking.stake(ethers.parseEther("100"));

// Check rewards
const rewards = await staking.calculateReward(userAddress);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add comprehensive tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Open an issue on GitHub
- Check the documentation
- Review the test files for usage examples

---

Built with ❤️ for the Base ecosystem