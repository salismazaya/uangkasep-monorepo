require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.27",
      },
    ],
    overrides: {
      'contracts/MultiSigWallet.sol': {
        version: "0.4.15"
      }
    }
  },
  networks: {
    polygon: {
      url: 'https://polygon-rpc.com',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY
    }
  }
}
