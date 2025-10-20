# BaseLytics Base Contracts

A comprehensive collection of base smart contracts for blockchain applications, built with security and best practices in mind.

## 📁 Project Structure

```
contracts/
├── interfaces/          # ERC standard interfaces
│   ├── IERC20.sol
│   ├── IERC20Metadata.sol
│   ├── IERC721.sol
│   ├── IERC721Receiver.sol
│   ├── IERC721Metadata.sol
│   ├── IERC1155.sol
│   └── IERC165.sol
├── tokens/              # Token implementations
│   ├── ERC20.sol
│   └── ERC721.sol
├── utils/               # Utility libraries
│   ├── Context.sol
│   ├── Strings.sol
│   ├── Address.sol
│   ├── Math.sol
│   └── ERC165.sol
├── access/              # Access control
│   └── Ownable.sol
├── security/            # Security patterns
│   ├── Pausable.sol
│   └── ReentrancyGuard.sol
└── examples/            # Example implementations
    ├── BaseToken.sol
    ├── BaseNFT.sol
    └── BaseStaking.sol
```

## 🚀 Features

### Core Standards
- **ERC20**: Fungible token standard with metadata support
- **ERC721**: Non-fungible token standard with metadata
- **ERC1155**: Multi-token standard (interface only)
- **ERC165**: Interface detection standard

### Security Features
- **Ownable**: Basic ownership access control
- **Pausable**: Emergency pause functionality
- **ReentrancyGuard**: Protection against reentrancy attacks

### Utility Libraries
- **Context**: Safe message sender and data access
- **Strings**: String manipulation utilities
- **Address**: Address validation and interaction utilities
- **Math**: Mathematical operations and rounding

### Example Contracts
- **BaseToken**: ERC20 token with minting capabilities
- **BaseNFT**: ERC721 NFT with batch minting and pause functionality
- **BaseStaking**: Token staking contract with rewards

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/llinsss/base_lytics.git
cd base_lytics
```

2. Install dependencies:
```bash
npm install
```

## 🔧 Usage

### Compilation
```bash
npx hardhat compile
```

### Testing
```bash
npx hardhat test
```

### Deployment
```bash
npx hardhat run scripts/deploy.js --network <network>
```

## 📋 Contract Examples

### BaseToken
A simple ERC20 token with:
- Minting capabilities (owner only)
- Burning functionality
- Maximum supply limit
- Standard ERC20 features

### BaseNFT
An ERC721 NFT collection with:
- Public minting with price
- Batch minting
- Owner minting
- Pause functionality
- Withdrawal mechanism

### BaseStaking
A staking contract featuring:
- Token staking and unstaking
- Reward calculation
- Claimable rewards
- Configurable reward rates
- Emergency functions

## 🔒 Security Considerations

- All contracts include proper access controls
- Reentrancy protection where needed
- Pause functionality for emergency situations
- Input validation and error handling
- Gas optimization considerations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For questions and support, please open an issue on GitHub.

---

Built with ❤️ for the Base ecosystem
