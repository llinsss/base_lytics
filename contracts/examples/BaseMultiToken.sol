// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC1155.sol";
import "../access/Ownable.sol";
import "../security/Pausable.sol";

contract BaseMultiToken is ERC1155, Ownable, Pausable {
    event TokenCreated(uint256 indexed tokenId, uint256 supply, bool fungible);
    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount);

    mapping(uint256 => bool) public fungibleTokens;
    mapping(uint256 => uint256) public tokenSupply;
    mapping(uint256 => uint256) public maxSupply;
    
    uint256 public nextTokenId = 1;
    string public name;
    string public symbol;

    constructor(string memory _name, string memory _symbol, string memory _uri) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
    }

    function createToken(uint256 _maxSupply, bool _fungible) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        fungibleTokens[tokenId] = _fungible;
        maxSupply[tokenId] = _maxSupply;
        
        emit TokenCreated(tokenId, 0, _fungible);
        return tokenId;
    }

    function mint(address to, uint256 tokenId, uint256 amount) external onlyOwner whenNotPaused {
        require(tokenId < nextTokenId, "token does not exist");
        require(tokenSupply[tokenId] + amount <= maxSupply[tokenId], "exceeds max supply");
        
        if (!fungibleTokens[tokenId]) {
            require(amount == 1, "NFT amount must be 1");
            require(balanceOf(to, tokenId) == 0, "NFT already exists");
        }
        
        tokenSupply[tokenId] += amount;
        _mint(to, tokenId, amount, "");
        
        emit TokenMinted(to, tokenId, amount);
    }

    function mintBatch(address to, uint256[] memory tokenIds, uint256[] memory amounts) external onlyOwner whenNotPaused {
        require(tokenIds.length == amounts.length, "arrays length mismatch");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(tokenIds[i] < nextTokenId, "token does not exist");
            require(tokenSupply[tokenIds[i]] + amounts[i] <= maxSupply[tokenIds[i]], "exceeds max supply");
            
            if (!fungibleTokens[tokenIds[i]]) {
                require(amounts[i] == 1, "NFT amount must be 1");
                require(balanceOf(to, tokenIds[i]) == 0, "NFT already exists");
            }
            
            tokenSupply[tokenIds[i]] += amounts[i];
        }
        
        _mintBatch(to, tokenIds, amounts, "");
    }

    function burn(address from, uint256 tokenId, uint256 amount) external {
        require(from == msg.sender || isApprovedForAll(from, msg.sender), "not authorized");
        
        tokenSupply[tokenId] -= amount;
        _burn(from, tokenId, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(!paused(), "token transfer while paused");
    }
}