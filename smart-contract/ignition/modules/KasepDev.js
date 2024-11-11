const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { kasep } = require('./Kasep');

module.exports = buildModule("KasepDev", (m) => {
    const erc20 = m.contract("ERC20", [
        "Kasep BTC",
        "KBTC",
        process.env.OWNER,
    ]);
    const dataFeed = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
    return { erc20, ...kasep(m, erc20, dataFeed) };
});