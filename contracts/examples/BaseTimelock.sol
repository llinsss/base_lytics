// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../access/Ownable.sol";
import "../security/ReentrancyGuard.sol";

contract BaseTimelock is Ownable, ReentrancyGuard {
    event QueueTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event CancelTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);
    event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta);

    uint256 public constant GRACE_PERIOD = 14 days;
    uint256 public constant MINIMUM_DELAY = 2 days;
    uint256 public constant MAXIMUM_DELAY = 30 days;

    uint256 public delay;
    mapping(bytes32 => bool) public queuedTransactions;

    constructor(uint256 _delay) {
        require(_delay >= MINIMUM_DELAY, "delay must exceed minimum");
        require(_delay <= MAXIMUM_DELAY, "delay must not exceed maximum");
        delay = _delay;
    }

    function setDelay(uint256 _delay) external onlyOwner {
        require(_delay >= MINIMUM_DELAY, "delay must exceed minimum");
        require(_delay <= MAXIMUM_DELAY, "delay must not exceed maximum");
        delay = _delay;
    }

    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external onlyOwner returns (bytes32) {
        require(eta >= getBlockTimestamp() + delay, "estimated execution block must satisfy delay");

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    function cancelTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external onlyOwner {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }

    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    ) external payable onlyOwner nonReentrant returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        require(queuedTransactions[txHash], "transaction hasn't been queued");
        require(getBlockTimestamp() >= eta, "transaction hasn't surpassed time lock");
        require(getBlockTimestamp() <= eta + GRACE_PERIOD, "transaction is stale");

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        require(success, "transaction execution reverted");

        emit ExecuteTransaction(txHash, target, value, signature, data, eta);

        return returnData;
    }

    function getBlockTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    receive() external payable {}
}