// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepLibrary.sol";

contract KasepProxyAdmin {
    bytes4 upgradeSelector =
        bytes4(keccak256("upgradeUsingProxyAdmin(address,uint256)"));

    function upgrade(address proxy, uint256 transactionId) external {
        require(
            isConfirmed(proxy, transactionId),
            "KasepProxyAdmin: not confirmed yet"
        );

        KasepLibrary.Transaction memory transaction = getTransaction(
            proxy,
            transactionId
        );
        bytes memory data = getData(transaction);
        (bool success, ) = proxy.call(data);
        require(success, "KasepProxyAdmin: upgrade failed");
    }

    function isConfirmed(
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

    function getTransaction(
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

    function getData(
        KasepLibrary.Transaction memory transaction
    ) private view returns (bytes memory) {
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

        return transaction.data;
    }
}
