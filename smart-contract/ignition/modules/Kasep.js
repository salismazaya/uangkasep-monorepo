const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

require('dotenv').config();

const kasep = (m, wbtc, dataFeed) => {
  const inputOwners = process.env.OWNERS;
  const inputRequired = process.env.VOTING_REQUIRED;
  const inputAmount = process.env.AMOUNT_PER_MONTH;

  const owners = m.getParameter('_owners', inputOwners.split(','));
  const required = m.getParameter('_required', inputRequired);

  const amount = m.getParameter('_amountPerMonth', inputAmount);

  const kasepmultisig = m.contract("KasepMultiSigWalletConstructor", [
    dataFeed,
    owners,
    required,
    wbtc,
    amount
  ]);

  return { kasepmultisig };
}

module.exports = {
  default: buildModule("Kasep", (m) => {
    const wbtc = m.getParameter('_wbtc', process.env.WBTC_ADDRESS);
    const dataFeed = m.getParameter('_wbtc', process.env.CHAINLINK_DATA_FEED_ADDRESS);
    return kasep(m, wbtc, dataFeed);
  }),
  kasep
};
