// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepMultiSigWalletCore.sol";

contract KasepMultiSigWalletConstructor is KasepMultiSigWalletCore {
    constructor(
        address[] memory _owners,
        uint256 _required,
        address _idrt,
        uint256 _amountPerMonth
    ) {
        _initialize(_owners, _required, _idrt, _amountPerMonth);
    }
}