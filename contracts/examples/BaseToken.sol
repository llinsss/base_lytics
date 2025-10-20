// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";

/**
 * @title BaseToken
 * @dev A basic ERC20 token implementation with minting capabilities
 */
contract BaseToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint8 public constant DECIMALS = 18;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply <= MAX_SUPPLY, "BaseToken: initial supply exceeds max supply");
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mint new tokens to a specific address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "BaseToken: minting would exceed max supply");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from a specific address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Override decimals to return the constant value
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }
}
