// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./KasepLibrary.sol";

contract KasepProxy is TransparentUpgradeableProxy {
    event ExternalCall(address indexed sender, uint256 value);

    constructor(
        address _logic,
        bytes memory _data
    ) TransparentUpgradeableProxy(_logic, msg.sender, _data) {}

    function getAdmin() external view returns (address) {
        return _getAdmin();
    }

    function getImplementation() external view returns (address) {
        return _getImplementation();
    }

    function changeAdmin(address _newAddress) external ifAdmin {
        _changeAdmin(_newAddress);
    }

    function upgradeTo(address _newImplementation) external ifAdmin {
        _upgradeTo(_newImplementation);
    }

    /// @dev sender must contract to call this function. This is intended to limit admin powers
    function external_call(
        address destination,
        uint256 value,
        bytes memory data
    ) external ifAdmin {
        require(
            Address.isContract(_getAdmin()),
            "KasepProxy: admin must contract"
        );
        (bool success, ) = destination.call{value: value}(data);
        require(success, "KasepProxy: external_call failed");
        emit ExternalCall(msg.sender, value);
    }
}
