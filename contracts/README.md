# BaseLytics Base Contracts

This directory contains base smart contracts for blockchain applications.

Contracts Overview

Interfaces (`contracts/interfaces/`)
- IERC20.sol: ERC20 token standard interface
- IERC20Metadata.sol: ERC20 metadata extension interface
- IERC721.sol: ERC721 NFT standard interface
- IERC721Receiver.sol: ERC721 receiver interface
- IERC721Metadata.sol: ERC721 metadata extension interface
- IERC1155.sol: ERC1155 multi-token standard interface
- IERC165.sol: ERC165 interface detection standard

Token Implementations (`contracts/tokens/`)
- ERC20.sol: Complete ERC20 token implementation with metadata
- ERC721.sol: Complete ERC721 NFT implementation with metadata

Utility Libraries (`contracts/utils/`)
- Context.sol: Safe message sender and data access
- Strings.sol: String manipulation utilities
- Address.sol: Address validation and interaction utilities
- Math.sol: Mathematical operations and rounding utilities
- ERC165.sol: ERC165 interface detection implementation

 Access Control (`contracts/access/`)
- *wnable.sol: Basic ownership access control pattern

 Security (`contracts/security/`)
- Pausable.sol: Emergency pause functionality
- ReentrancyGuard.sol: Protection against reentrancy attacks

Examples (`contracts/examples/`)
- BaseToken.sol: Example ERC20 token with minting capabilities
- BaseNFT.sol: Example ERC721 NFT collection with batch minting
- BaseStaking.sol: Example token staking contract with rewards

Usage

These contracts can be used as base implementations for your own smart contracts. Simply inherit from the appropriate contract and override or extend functionality as needed.

 Example Usage

solidity

SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./tokens/ERC20.sol";
import "./access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}


## Security

All contracts follow security best practices:
- Proper access controls
- Reentrancy protection
- Input validation
- Gas optimization
- Emergency pause functionality

MIT License 
