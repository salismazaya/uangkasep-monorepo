const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

require('dotenv').config();

module.exports = buildModule("KasepProxy", (m) => {
    const kasepmultisig = m.contract("KasepMultiSigWallet");

    const proxy = m.contract("KasepProxy", [kasepmultisig, "0x"]);
    const proxyAdmin = m.contract("KasepProxyAdmin");

    return { kasepmultisig, proxy, proxyAdmin };
})
