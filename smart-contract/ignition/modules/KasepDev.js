const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { kasep } = require('./Kasep');

module.exports = buildModule("KasepDev", (m) => {
    const erc20 = m.contract("ERC20", [
        "Kasep Token",
        "KTOKEN",
        process.env.OWNER,
    ]);
    return { erc20, ...kasep(m, erc20) };
});