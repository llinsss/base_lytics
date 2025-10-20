// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC721.sol";
import "../access/Ownable.sol";
import "../security/Pausable.sol";

/**
 * @title BaseNFT
 * @dev A basic ERC721 NFT implementation with minting capabilities
 */
contract BaseNFT is ERC721, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant PRICE = 0.01 ether;
    
    uint256 private _currentTokenId = 0;
    string private _baseTokenURI;
    bool public mintingEnabled = true;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a single NFT
     */
    function mint() public payable whenNotPaused {
        require(mintingEnabled, "BaseNFT: minting is disabled");
        require(_currentTokenId < MAX_SUPPLY, "BaseNFT: max supply reached");
        require(msg.value >= PRICE, "BaseNFT: insufficient payment");

        _currentTokenId++;
        _safeMint(msg.sender, _currentTokenId);
    }

    /**
     * @dev Mint multiple NFTs
     * @param quantity The number of NFTs to mint
     */
    function mintBatch(uint256 quantity) public payable whenNotPaused {
        require(mintingEnabled, "BaseNFT: minting is disabled");
        require(quantity <= MAX_MINT_PER_TX, "BaseNFT: exceeds max mint per transaction");
        require(_currentTokenId + quantity <= MAX_SUPPLY, "BaseNFT: would exceed max supply");
        require(msg.value >= PRICE * quantity, "BaseNFT: insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);
        }
    }

    /**
     * @dev Owner mint function
     * @param to The address to mint to
     * @param quantity The number of NFTs to mint
     */
    function ownerMint(address to, uint256 quantity) public onlyOwner {
        require(_currentTokenId + quantity <= MAX_SUPPLY, "BaseNFT: would exceed max supply");

        for (uint256 i = 0; i < quantity; i++) {
            _currentTokenId++;
            _safeMint(to, _currentTokenId);
        }
    }

    /**
     * @dev Set the base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Toggle minting enabled/disabled
     */
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }

    /**
     * @dev Pause the contract
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "BaseNFT: no balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "BaseNFT: withdrawal failed");
    }

    /**
     * @dev Override baseURI to return the stored base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Get the current token ID
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _currentTokenId;
    }

    /**
     * @dev Get the total supply
     */
    function totalSupply() public view returns (uint256) {
        return _currentTokenId;
    }
}
