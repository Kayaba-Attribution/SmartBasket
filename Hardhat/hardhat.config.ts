import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'
import "./tasks/mintTokens"; 
import "./tasks/createBaskets";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Validate environment variables
if (!ALCHEMY_API_KEY) {
  console.warn("Warning: ALCHEMY_API_KEY is not set in the environment");
}

if (!PRIVATE_KEY) {
  console.warn("Warning: PRIVATE_KEY is not set in the environment");
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},
    sepolia: ALCHEMY_API_KEY && PRIVATE_KEY
      ? {
          url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
          accounts: [PRIVATE_KEY]
        }
      : {
          url: "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
          accounts: ["0x0000000000000000000000000000000000000000000000000000000000000000"]
        }
  },
};

if (!ALCHEMY_API_KEY || !PRIVATE_KEY) {
  console.log("Sepolia network is configured with placeholder values. It will not be functional for real operations.");
}
export default config;