// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./KasepMultiSigWallet.sol";

contract KasepMultiSigWalletConstructor is KasepMultiSigWallet {
    constructor(
        address _dataFeed,
        address[] memory _owners,
        uint256 _required,
        address _wbtc,
        uint256 _amountPerMonth
    ) {
        initialize(_dataFeed, _owners, _required, _wbtc, _amountPerMonth);
    }
}
