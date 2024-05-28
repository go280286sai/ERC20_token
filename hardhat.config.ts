import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";


const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      chainId: 1337,

    }
  },
  solidity: {

    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
      },
    },

  },
};

export default config;
