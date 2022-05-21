require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.

const PRIVATE_KEY = ""

module.exports = {
  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/{api_key}",
      accounts: [`${PRIVATE_KEY}`]
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/{api_key}",
      chainId: 4,
      accounts: [`${PRIVATE_KEY}`]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ""
  }
};