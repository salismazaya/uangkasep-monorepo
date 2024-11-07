// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract CustomProxyAdmin is ProxyAdmin {
    constructor(address owner) {
        _transferOwnership(owner);
    }
}
