// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./KasepMultiSigWalletCore.sol";

contract KasepMultiSigWalletInitializable is
    KasepMultiSigWalletCore,
    Initializable
{
    function initialize(
        address _dataFeed,
        address[] memory _owners,
        uint256 _required,
        address _wbtc,
        uint256 _amountPerMonth
    ) public initializer {
        _initialize(_dataFeed, _owners, _required, _wbtc, _amountPerMonth);
    }

    function blankInitialize() public initializer {}
}
