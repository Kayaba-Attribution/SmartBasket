import { ethers } from "hardhat";
import { parseUnits } from "ethers";
import fs from "fs";

// Import the ABI of your ERC20_BASE contract
import ERC20_BASE_ABI from "../artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";

export async function mintTokensForTesting(targetAddress: string) {
    const [owner] = await ethers.getSigners();

    // Load the addresses from the JSON file
    const addresses = JSON.parse(fs.readFileSync('addresses.json', 'utf-8'));

    // Define token amounts (adjust these as needed for your testing scenario)
    const tokenAmounts = {
        USDT: parseUnits("1000000", 18),  // 1 million USDT
        ETH: parseUnits("1000", 18),      // 1000 ETH
        WBTC: parseUnits("50", 18),       // 50 WBTC
        XRP: parseUnits("100000", 18),    // 100,000 XRP
        UNI: parseUnits("10000", 18),     // 10,000 UNI
        LINK: parseUnits("5000", 18),     // 5,000 LINK
        DOGE: parseUnits("1000000", 18),  // 1 million DOGE
        SHIB: parseUnits("1000000000", 18), // 1 billion SHIB
        PEPE: parseUnits("10000000000", 18), // 10 billion PEPE
        FLOKI: parseUnits("5000000000", 18)  // 5 billion FLOKI
    };

    // Mint tokens
    for (const [tokenName, amount] of Object.entries(tokenAmounts)) {
        const tokenContract = new ethers.Contract(addresses[tokenName], ERC20_BASE_ABI.abi, owner);

        try {
            const tx = await tokenContract.mint(targetAddress, amount);
            await tx.wait();
            console.log(`Minted ${ethers.formatUnits(amount, 18)} ${tokenName} to ${targetAddress}`);
        } catch (error) {
            console.error(`Failed to mint ${tokenName}: ${error}`);
        }
    }

    console.log("Token minting process completed");
}

// Example usage:
// mintTokensForTesting("0x1234567890123456789012345678901234567890")