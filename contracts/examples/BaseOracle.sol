// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function updatePrice(address token, uint256 price) external;
}

contract BaseOracle is Ownable, ReentrancyGuard, IPriceOracle {
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        bool isActive;
    }

    mapping(address => PriceData) public prices;
    mapping(address => bool) public authorizedOracles;
    
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public priceValidityPeriod = 3600; // 1 hour

    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == owner(), "not authorized oracle");
        _;
    }

    constructor() {
        authorizedOracles[msg.sender] = true;
    }

    function getPrice(address token) external view override returns (uint256) {
        PriceData memory priceData = prices[token];
        require(priceData.isActive, "price not available");
        require(block.timestamp - priceData.timestamp <= priceValidityPeriod, "price too old");
        return priceData.price;
    }

    function updatePrice(address token, uint256 price) external override onlyOracle {
        require(token != address(0), "invalid token");
        require(price > 0, "invalid price");

        prices[token] = PriceData({
            price: price,
            timestamp: block.timestamp,
            isActive: true
        });

        emit PriceUpdated(token, price, block.timestamp);
    }

    function updatePrices(address[] calldata tokens, uint256[] calldata _prices) external onlyOracle {
        require(tokens.length == _prices.length, "array length mismatch");
        
        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "invalid token");
            require(_prices[i] > 0, "invalid price");

            prices[tokens[i]] = PriceData({
                price: _prices[i],
                timestamp: block.timestamp,
                isActive: true
            });

            emit PriceUpdated(tokens[i], _prices[i], block.timestamp);
        }
    }

    function addOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "invalid oracle");
        authorizedOracles[oracle] = true;
        emit OracleAdded(oracle);
    }

    function removeOracle(address oracle) external onlyOwner {
        authorizedOracles[oracle] = false;
        emit OracleRemoved(oracle);
    }

    function setPriceValidityPeriod(uint256 period) external onlyOwner {
        require(period > 0, "invalid period");
        priceValidityPeriod = period;
    }

    function deactivatePrice(address token) external onlyOwner {
        prices[token].isActive = false;
    }

    function isPriceValid(address token) external view returns (bool) {
        PriceData memory priceData = prices[token];
        return priceData.isActive && (block.timestamp - priceData.timestamp <= priceValidityPeriod);
    }
}