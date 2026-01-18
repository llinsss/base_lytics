// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library GasOptimizer {
    struct PackedData {
        uint128 value1;
        uint128 value2;
    }
    
    struct UserData {
        uint128 balance;
        uint64 timestamp;
        uint32 count;
        uint32 flags;
    }

    function packUint256(uint256 a, uint256 b) internal pure returns (uint256 packed) {
        assembly {
            packed := or(shl(128, a), b)
        }
    }

    function unpackUint256(uint256 packed) internal pure returns (uint256 a, uint256 b) {
        assembly {
            a := shr(128, packed)
            b := and(packed, 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
        }
    }

    function efficientLoop(uint256[] memory array) internal pure returns (uint256 sum) {
        uint256 length = array.length;
        assembly {
            let data := add(array, 0x20)
            for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                sum := add(sum, mload(add(data, mul(i, 0x20))))
            }
        }
    }

    function batchTransfer(address token, address[] calldata recipients, uint256[] calldata amounts) internal {
        require(recipients.length == amounts.length, "length mismatch");
        
        bytes4 selector = bytes4(keccak256("transfer(address,uint256)"));
        
        for (uint256 i; i < recipients.length;) {
            assembly {
                let ptr := mload(0x40)
                mstore(ptr, selector)
                mstore(add(ptr, 0x04), calldataload(add(recipients.offset, mul(i, 0x20))))
                mstore(add(ptr, 0x24), calldataload(add(amounts.offset, mul(i, 0x20))))
                
                let success := call(gas(), token, 0, ptr, 0x44, 0, 0)
                if iszero(success) { revert(0, 0) }
                
                i := add(i, 1)
            }
        }
    }

    function estimateGas(address target, bytes calldata data) internal view returns (uint256 gasUsed) {
        uint256 gasBefore = gasleft();
        (bool success,) = target.staticcall(data);
        require(success, "estimation failed");
        gasUsed = gasBefore - gasleft();
    }
}