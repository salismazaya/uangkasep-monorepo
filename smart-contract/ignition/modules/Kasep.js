const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

require('dotenv').config();

const kasep = (m, idrt) => {
  const inputOwners = process.env.OWNERS;
  const inputRequired = process.env.VOTING_REQUIRED;
  const inputAmount = process.env.AMOUNT_PER_MONTH;

  const owners = m.getParameter('_owners', inputOwners.split(','));
  const required = m.getParameter('_required', inputRequired);

  const amount = m.getParameter('_amountPerMonth', inputAmount);

  const kasepmultisig = m.contract("KasepMultiSigWalletConstructor", [
    owners,
    required,
    idrt,
    amount
  ]);

  return { kasepmultisig };
}

module.exports = {
  default: buildModule("Kasep", (m) => {
    const idrt = m.getParameter('_idrt', process.env.IDRT_ADDRESS);
    return kasep(m, idrt);
  }),
  kasep
};
