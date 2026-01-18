// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../access/Ownable.sol";

contract BaseProxy is Ownable {
    bytes32 private constant IMPLEMENTATION_SLOT = keccak256("base.proxy.implementation");
    bytes32 private constant ADMIN_SLOT = keccak256("base.proxy.admin");

    event Upgraded(address indexed implementation);

    modifier onlyAdmin() {
        require(msg.sender == _getAdmin(), "not admin");
        _;
    }

    constructor(address _implementation) {
        _setImplementation(_implementation);
        _setAdmin(msg.sender);
    }

    function upgrade(address newImplementation) external onlyAdmin {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    function implementation() external view returns (address) {
        return _getImplementation();
    }

    function admin() external view returns (address) {
        return _getAdmin();
    }

    function _getImplementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    function _setImplementation(address impl) internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, impl)
        }
    }

    function _getAdmin() internal view returns (address adm) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            adm := sload(slot)
        }
    }

    function _setAdmin(address adm) internal {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            sstore(slot, adm)
        }
    }

    fallback() external payable {
        address impl = _getImplementation();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    receive() external payable {}
}

abstract contract BaseUpgradeable {
    uint256[50] private __gap;
    
    modifier initializer() {
        require(!_initialized(), "already initialized");
        _setInitialized();
        _;
    }

    function _initialized() internal view returns (bool) {
        return _getBool(keccak256("base.upgradeable.initialized"));
    }

    function _setInitialized() internal {
        _setBool(keccak256("base.upgradeable.initialized"), true);
    }

    function _getBool(bytes32 slot) internal view returns (bool value) {
        assembly {
            value := sload(slot)
        }
    }

    function _setBool(bytes32 slot, bool value) internal {
        assembly {
            sstore(slot, value)
        }
    }
}