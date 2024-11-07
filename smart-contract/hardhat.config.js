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
  },
  networks: {
    polygon: {
      url: 'https://polygon.llamarpc.com',
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      url: 'https://1rpc.io/sepolia',
      accounts: [process.env.PRIVATE_KEY]
    },
    amoy: {
      url: 'https://polygon-amoy.gateway.tenderly.co',
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
    }
  }
}
