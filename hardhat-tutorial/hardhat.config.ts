import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from 'dotenv' ;
dotenv.config()

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) throw new Error();

module.exports = {

  solidity: "0.8.9",
    // defaultNetwork: "goerli",
    networks: {
        // hardhat: {},
        goerli: {
          url: QUICKNODE_HTTP_URL,
          accounts: [PRIVATE_KEY],
        }
  },
  // etherscan: {
  //   // Your API key for Etherscan
  //   // Obtain one at https://etherscan.io/
  //   apiKey: ALCHEMY_API_KEY
  // }
};

// const config: HardhatUserConfig = {
//   solidity: "0.8.17",
// };

// export default config;
