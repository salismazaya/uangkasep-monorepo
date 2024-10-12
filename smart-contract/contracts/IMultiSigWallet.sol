// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IMultiSigWallet {
    function isOwner(address) external view returns (bool);
    function getOwners() external view returns (address[] memory);
}
