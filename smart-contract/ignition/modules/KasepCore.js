const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("KasepCore", (m) => {
    const kasepmultisig = m.contract("KasepMultiSigWalletCore");

    return { kasepmultisig };
})
