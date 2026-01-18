// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../tokens/ERC20.sol";
import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

interface IBridge {
    function bridgeToken(address token, uint256 amount, uint256 targetChain, address recipient) external;
    function receiveToken(address token, uint256 amount, address recipient, bytes32 txHash) external;
}

contract BaseBridge is IBridge, Ownable, ReentrancyGuard {
    event TokenBridged(address indexed token, uint256 amount, uint256 targetChain, address recipient, bytes32 txHash);
    event TokenReceived(address indexed token, uint256 amount, address recipient, bytes32 txHash);
    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    struct BridgeRequest {
        address token;
        uint256 amount;
        uint256 targetChain;
        address recipient;
        bool processed;
    }

    mapping(address => bool) public validators;
    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(bytes32 => bool) public processedTxs;
    mapping(address => bool) public supportedTokens;
    
    uint256 public validatorCount;
    uint256 public requiredValidations = 2;

    modifier onlyValidator() {
        require(validators[msg.sender], "not validator");
        _;
    }

    function addValidator(address validator) external onlyOwner {
        require(!validators[validator], "already validator");
        validators[validator] = true;
        validatorCount++;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "not validator");
        validators[validator] = false;
        validatorCount--;
        emit ValidatorRemoved(validator);
    }

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function bridgeToken(address token, uint256 amount, uint256 targetChain, address recipient) external override nonReentrant {
        require(supportedTokens[token], "token not supported");
        require(amount > 0, "invalid amount");
        require(recipient != address(0), "invalid recipient");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        bytes32 txHash = keccak256(abi.encodePacked(token, amount, targetChain, recipient, block.timestamp));
        
        bridgeRequests[txHash] = BridgeRequest({
            token: token,
            amount: amount,
            targetChain: targetChain,
            recipient: recipient,
            processed: false
        });

        emit TokenBridged(token, amount, targetChain, recipient, txHash);
    }

    function receiveToken(address token, uint256 amount, address recipient, bytes32 txHash) external override onlyValidator {
        require(!processedTxs[txHash], "already processed");
        require(supportedTokens[token], "token not supported");

        processedTxs[txHash] = true;
        IERC20(token).transfer(recipient, amount);

        emit TokenReceived(token, amount, recipient, txHash);
    }

    function setRequiredValidations(uint256 required) external onlyOwner {
        require(required > 0 && required <= validatorCount, "invalid requirement");
        requiredValidations = required;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}