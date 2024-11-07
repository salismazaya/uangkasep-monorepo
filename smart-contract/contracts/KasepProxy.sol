// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "./KasepLibrary.sol";

contract KasepProxy is TransparentUpgradeableProxy {
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
}
