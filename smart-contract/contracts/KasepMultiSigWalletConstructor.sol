// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepMultiSigWalletCore.sol";

contract KasepMultiSigWalletConstructor is KasepMultiSigWalletCore {
    constructor(
        address _dataFeed,
        address[] memory _owners,
        uint256 _required,
        address _wbtc,
        uint256 _amountPerMonth
    ) {
        _initialize(_dataFeed, _owners, _required, _wbtc, _amountPerMonth);
    }
}
