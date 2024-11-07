// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepLibrary.sol";
import "./CustomProxyAdmin.sol";

contract KasepProxyAdmin {
    bytes4 upgradeSelector = bytes4(keccak256("upgradeTo(address)"));
    address public realAdmin;

    constructor() {
        // realAdmin is contract address
        // This is necessary because if the admin accesses the function of the proxy implementation, access will be denied
        // read this https://docs.openzeppelin.com/contracts/4.x/api/proxy#TransparentUpgradeableProxy
        realAdmin = address(new CustomProxyAdmin(address(this)));
        // enter realAdmin address in KasepProxy not this contract address
    }

    // because it is possible that the deployer entered the contract address incorrectly
    function changeToRealAdmin(address proxy) external {
        bytes memory data = abi.encodeWithSignature(
            "changeAdmin(address)",
            realAdmin
        );
        (bool success, ) = proxy.call(data);
        require(success, "KasepProxyAdmin: transaction failed");
    }

    function confirmUpgrade(address proxy, uint256 transactionId) external {
        require(
            _isConfirmed(proxy, transactionId),
            "KasepProxyAdmin: not confirmed yet"
        );
        KasepLibrary.Transaction memory transaction = _getTransaction(
            proxy,
            transactionId
        );
        address newImplementation = _getNewImplementation(transaction); // check validity and get value
        _upgrade(proxy, newImplementation);
        _markTransactionAsExecuted(proxy, transactionId);
    }

    function _upgrade(address proxy, address newImplementation) private {
        bytes memory data = abi.encodeWithSignature(
            "upgrade(address,address)",
            proxy,
            newImplementation
        );
        (bool success, ) = realAdmin.call(data);
        require(success, "KasepProxy: transaction failed");
    }

    function _markTransactionAsExecuted(
        address proxy,
        uint256 transactionId
    ) private {
        bytes memory data = abi.encodeWithSignature(
            "external_call(address,uint256,bytes)",
            proxy,
            0,
            abi.encodeWithSignature(
                "markTransactionAsExecuted(uint256)",
                transactionId
            )
        );

        (bool success, ) = proxy.call(data);
        require(success, "KasepProxy: transaction failed");
    }

    function _isConfirmed(
        address proxy,
        uint256 transactionId
    ) private returns (bool) {
        bytes memory data = abi.encodeWithSignature(
            "isConfirmed(uint256)",
            transactionId
        );
        (bool success, bytes memory output) = proxy.call(data);
        require(success, "KasepProxyAdmin: transaction failed");

        bool is_confirmed = abi.decode(output, (bool));
        return is_confirmed;
    }

    function _getTransaction(
        address proxy,
        uint256 transactionId
    ) private returns (KasepLibrary.Transaction memory transaction) {
        bytes memory data = abi.encodeWithSignature(
            "getTransaction(uint256)",
            transactionId
        );
        (bool success, bytes memory output) = proxy.call(data);
        require(success, "KasepProxyAdmin: transaction failed");
        transaction = abi.decode(output, (KasepLibrary.Transaction));
    }

    function _getNewImplementation(
        KasepLibrary.Transaction memory transaction
    ) private view returns (address) {
        address newImplementation;
        bytes4 selector;
        bytes memory data = transaction.data;

        assembly {
            selector := mload(add(data, 32))
        }

        require(
            selector == upgradeSelector,
            "KasepProxyAdmin: invalid selector"
        );

        assembly {
            newImplementation := mload(add(data, 36))
        }

        require(
            transaction.destination == address(this),
            "KasepProxyAdmin: invalid destination"
        );

        require(
            transaction.executed == false,
            "KasepProxyAdmin: transaction has been executed"
        );

        return newImplementation;
    }
}
