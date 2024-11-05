// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

library KasepLibrary {
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
    }
}
