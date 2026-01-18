// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../security/ReentrancyGuard.sol";
import "../access/Ownable.sol";

contract BaseBatch is ReentrancyGuard, Ownable {
    event BatchExecuted(address indexed executor, uint256 callCount, bool[] results);
    event CallExecuted(address indexed target, bytes data, bool success, bytes returnData);

    struct Call {
        address target;
        bytes callData;
        uint256 value;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    function batchCall(Call[] calldata calls) external payable nonReentrant returns (Result[] memory results) {
        results = new Result[](calls.length);
        bool[] memory successArray = new bool[](calls.length);

        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory returnData) = calls[i].target.call{value: calls[i].value}(calls[i].callData);
            
            results[i] = Result({
                success: success,
                returnData: returnData
            });
            
            successArray[i] = success;
            
            emit CallExecuted(calls[i].target, calls[i].callData, success, returnData);
        }

        emit BatchExecuted(msg.sender, calls.length, successArray);
    }

    function batchCallWithRevert(Call[] calldata calls) external payable nonReentrant returns (Result[] memory results) {
        results = new Result[](calls.length);
        bool[] memory successArray = new bool[](calls.length);

        for (uint256 i = 0; i < calls.length; i++) {
            (bool success, bytes memory returnData) = calls[i].target.call{value: calls[i].value}(calls[i].callData);
            
            require(success, "batch call failed");
            
            results[i] = Result({
                success: success,
                returnData: returnData
            });
            
            successArray[i] = success;
            
            emit CallExecuted(calls[i].target, calls[i].callData, success, returnData);
        }

        emit BatchExecuted(msg.sender, calls.length, successArray);
    }

    function batchTransfer(address token, address[] calldata recipients, uint256[] calldata amounts) external nonReentrant {
        require(recipients.length == amounts.length, "length mismatch");

        bytes4 transferSelector = bytes4(keccak256("transfer(address,uint256)"));
        
        for (uint256 i = 0; i < recipients.length; i++) {
            bytes memory callData = abi.encodeWithSelector(transferSelector, recipients[i], amounts[i]);
            (bool success,) = token.call(callData);
            require(success, "transfer failed");
        }
    }

    function batchApprove(address token, address[] calldata spenders, uint256[] calldata amounts) external nonReentrant {
        require(spenders.length == amounts.length, "length mismatch");

        bytes4 approveSelector = bytes4(keccak256("approve(address,uint256)"));
        
        for (uint256 i = 0; i < spenders.length; i++) {
            bytes memory callData = abi.encodeWithSelector(approveSelector, spenders[i], amounts[i]);
            (bool success,) = token.call(callData);
            require(success, "approve failed");
        }
    }

    function estimateBatchGas(Call[] calldata calls) external returns (uint256 totalGas) {
        for (uint256 i = 0; i < calls.length; i++) {
            uint256 gasBefore = gasleft();
            calls[i].target.call{value: calls[i].value}(calls[i].callData);
            totalGas += gasBefore - gasleft();
        }
    }

    function multicall(bytes[] calldata data) external payable returns (bytes[] memory results) {
        results = new bytes[](data.length);
        
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(data[i]);
            require(success, "multicall failed");
            results[i] = result;
        }
    }

    receive() external payable {}
}