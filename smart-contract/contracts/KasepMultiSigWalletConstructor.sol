// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepMultiSigWallet.sol";

contract KasepMultiSigWalletConstructor is KasepMultiSigWallet {
    constructor(
        address[] memory _owners,
        uint256 _required,
        address _idrt,
        uint256 _amountPerMonth
    ) {
        initialize(_owners, _required, _idrt, _amountPerMonth);
    }
}