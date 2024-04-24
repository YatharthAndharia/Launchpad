import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
require('dotenv').config();

type HttpNetworkAccountsUserConfig = any;
const config: HardhatUserConfig = {
  solidity: '0.8.4',
  networks: {
    hardhat: {
      chainId: 1337,
      allowBlocksWithSameTimestamp: true,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId: 11155111,
      gas: 'auto',
    },
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      accounts: [process.env.PRIVATE_KEY] as
        | HttpNetworkAccountsUserConfig
        | undefined,
      chainId: 44787,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY
        ? process.env.ETHERSCAN_API_KEY
        : '',
    },
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
