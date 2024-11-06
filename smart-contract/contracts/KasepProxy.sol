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

    function upgrade(address _newImplementation) external ifAdmin {
        _upgradeTo(_newImplementation);
    }

    function markTransactionAsExecuted(uint256 transactionId) internal ifAdmin {
        bytes memory data = abi.encodeWithSignature(
            "markTransactionAsExecuted(uint256)",
            transactionId
        );
        (bool success, ) = _getImplementation().delegatecall(data);
        require(success, "KasepProxy: transaction failed");
    }

    function isConfirmed(
        uint256 transactionId
    ) external ifAdmin returns (bool) {
        bytes memory data = abi.encodeWithSignature(
            "isConfirmed(uint256)",
            transactionId
        );
        (bool success, bytes memory output) = _getImplementation().delegatecall(
            data
        );
        require(success, "KasepProxy: transaction failed");
        return abi.decode(output, (bool));
    }

    function getTransaction(
        uint256 transactionId
    ) external ifAdmin returns (KasepLibrary.Transaction memory) {
        bytes memory data = abi.encodeWithSignature(
            "getTransaction(uint256)",
            transactionId
        );
        (bool success, bytes memory output) = _getImplementation().delegatecall(
            data
        );
        require(success, "KasepProxy: transaction failed");

        KasepLibrary.Transaction memory transacation = abi.decode(output, (KasepLibrary.Transaction));
        return transacation;

    }

    function upgradeUsingProxyAdmin(
        address _newImplementation,
        uint256 transactionId
    ) external ifAdmin {
        markTransactionAsExecuted(transactionId);
        _upgradeTo(_newImplementation);
    }
}
