const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

require('dotenv').config();

module.exports = buildModule("Kasep", (m) => {
  const inputOwners = process.env.OWNERS;
  const inputRequired = process.env.VOTING_REQUIRED;
  const inputIdrt = process.env.IDRT_ADDRESS;
  const inputAmount = process.env.AMOUNT_PER_MONTH;

  const owners = m.getParameter('_owners', inputOwners.split(','));
  const required = m.getParameter('_required', inputRequired);
  const multisig = m.contract("MultiSigWallet", [
    owners,
    required
  ]);

  const idrt = m.getParameter('_idrt', inputIdrt);
  const amount = m.getParameter('_amountPerMonth', inputAmount);

  const kasepmultisig = m.contract("KasepMultiSigWallet", [
    multisig,
    idrt,
    amount
  ]);
  
  return { multisig, kasepmultisig };
});
