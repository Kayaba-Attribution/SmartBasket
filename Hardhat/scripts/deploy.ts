import { ethers } from "hardhat";
import { Contract, ContractFactory, parseEther, Signer } from "ethers";
import { parseUnits } from "ethers";

// Import artifacts
import WETH9 from "../WETH9.json";
import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import pairArtifact from "@uniswap/v2-periphery/build/IUniswapV2Pair.json";

import fs from "fs";

// Interfaces
interface DeployedCore {
  factory: any;
  router: any;
  weth: any;
}

interface TokenInfo {
  contract: any;
  address: string;
}

const MaxUint256 = ethers.MaxUint256;

// Deploy core contracts (Factory, Router, WETH)
async function deployCore(owner: Signer): Promise<DeployedCore> {
  const Factory = new ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );
  const factory = await Factory.deploy(await owner.getAddress());
  const factoryAddress = await factory.getAddress();
  console.log(`Factory deployed to ${factoryAddress}`);

  const WETH = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
  const weth = await WETH.deploy();
  const wethAddress = await weth.getAddress();
  console.log(`WETH deployed to ${wethAddress}`);

  const Router = new ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );
  const router = await Router.deploy(factoryAddress, wethAddress);
  console.log(`Router deployed to ${await router.getAddress()}`);

  return { factory, router, weth };
}

// Deploy a new ERC20 token based on ERC20_BASE
async function deployToken(owner: Signer, name: string, symbol: string): Promise<TokenInfo> {
  const ERC20_BASE = await ethers.getContractFactory("ERC20_BASE");
  const token = await ERC20_BASE.deploy(name, symbol);
  const tokenAddress = await token.getAddress();
  console.log(`${name} deployed to ${tokenAddress}`);

  return { contract: token, address: tokenAddress };
}

// Mint tokens, create pair, approve, and add liquidity
async function setupTokenPair(
  owner: Signer,
  factory: any,
  router: any,
  token: any,
  usdt: any,
  targetPriceUSD: number
) {
  const ownerAddress = await owner.getAddress();

  // Mint tokens
  const tokenAmount = parseUnits("1000", 18);
  const usdtAmount = parseUnits((1000 * targetPriceUSD).toString(), 18); // Assuming USDT has 18 decimals

  await token.connect(owner).mint(ownerAddress, tokenAmount);
  await usdt.connect(owner).mint(ownerAddress, usdtAmount);

  console.log("Creating pair...");
  // Create pair
  const tokenAddress = await token.getAddress();
  const usdtAddress = await usdt.getAddress();

  await factory.createPair(tokenAddress, usdtAddress);
  console.log("Pair created, getting pair address...");
  const pairAddress = await factory.getPair(tokenAddress, usdtAddress);
  console.log(`Pair created at ${pairAddress}`);

  // Approve router
  const routerAddress = await router.getAddress();
  await token.connect(owner).approve(routerAddress, MaxUint256);
  await usdt.connect(owner).approve(routerAddress, MaxUint256);

  // Add liquidity
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
  await router.connect(owner).addLiquidity(
    tokenAddress,
    usdtAddress,
    tokenAmount,
    usdtAmount,
    0,
    0,
    ownerAddress,
    deadline
  );

  console.log(`Liquidity added for ${await token.symbol()} / USDT pair | Target price: ${targetPriceUSD}`);
}

async function deploySmartBasket(owner: Signer, router: any, usdt: any) {
  const SmartBasket = await ethers.getContractFactory("SmartBasket");
  const customBasket = await SmartBasket.deploy(router, usdt);

  return customBasket;
}


async function main() {
  const [owner, user1, user2, user3] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${owner.address}`);

  // Deploy core contracts
  const core = await deployCore(owner);

  // Deploy USDT
  const usdt = await deployToken(owner, "Tether USD", "USDT");

  // Low Risk ETF Tokens
  console.log("Deploying and setting up Low Risk ETF tokens...");
  const eth = await deployToken(owner, "Ethereum", "ETH");
  const wbtc = await deployToken(owner, "Wrapped Bitcoin", "WBTC");
  const xrp = await deployToken(owner, "Ripple", "XRP");

  await setupTokenPair(owner, core.factory, core.router, eth.contract, usdt.contract, 2000);
  await setupTokenPair(owner, core.factory, core.router, wbtc.contract, usdt.contract, 60000);
  await setupTokenPair(owner, core.factory, core.router, xrp.contract, usdt.contract, 0.5);

  // Medium Risk ETF Tokens
  console.log("Deploying and setting up Medium Risk ETF tokens...");
  // ETH is already deployed
  const uni = await deployToken(owner, "Uniswap", "UNI");
  const link = await deployToken(owner, "Chainlink", "LINK");

  await setupTokenPair(owner, core.factory, core.router, uni.contract, usdt.contract, 5);
  await setupTokenPair(owner, core.factory, core.router, link.contract, usdt.contract, 15);

  // High Risk ETF Tokens
  console.log("Deploying and setting up High Risk ETF tokens...");
  const doge = await deployToken(owner, "Dogecoin", "DOGE");
  const shib = await deployToken(owner, "Shiba Inu", "SHIB");
  const pepe = await deployToken(owner, "Pepe", "PEPE");
  const floki = await deployToken(owner, "Floki Inu", "FLOKI");

  await setupTokenPair(owner, core.factory, core.router, doge.contract, usdt.contract, 0.1);
  await setupTokenPair(owner, core.factory, core.router, shib.contract, usdt.contract, 0.000008);
  await setupTokenPair(owner, core.factory, core.router, pepe.contract, usdt.contract, 0.000001);
  await setupTokenPair(owner, core.factory, core.router, floki.contract, usdt.contract, 0.00002);

  // Deploy SmartBasket contract
  const SmartBasket = await deploySmartBasket(owner, core.router, usdt.address);
  const smartBasketAddress = await SmartBasket.getAddress();
  console.log(`SmartBasket deployed to ${smartBasketAddress}`);

  // Deploy dummy baskets for testing
  const lowRiskAllocations = [
    { tokenAddress: eth.address, percentage: 60 },
    { tokenAddress: wbtc.address, percentage: 20 },
    { tokenAddress: xrp.address, percentage: 20 },
  ];
  const mediumRiskAllocations = [
    { tokenAddress: uni.address, percentage: 50 },
    { tokenAddress: link.address, percentage: 50 },
  ];
  const highRiskAllocations = [
    { tokenAddress: doge.address, percentage: 25 },
    { tokenAddress: shib.address, percentage: 25 },
    { tokenAddress: pepe.address, percentage: 25 },
    { tokenAddress: floki.address, percentage: 25 },
  ];

  // approve USDT spending for the smart basket contract
  await usdt.contract.approve(smartBasketAddress, MaxUint256);

  // Create baskets
  await SmartBasket.createBasket(lowRiskAllocations, parseEther("10000"));
  await SmartBasket.createBasket(mediumRiskAllocations, parseEther("1000"));
  await SmartBasket.createBasket(highRiskAllocations, parseEther("100"));

  // Verify baskets created
  const userBaskets = await SmartBasket.getUserBaskets(await owner.getAddress());
  console.log("User baskets:", userBaskets.length);

  console.log("Deployment and setup completed");

  // Log addresses for reference
  console.log("Deployed Token Addresses:");
  console.log("USDT:", usdt.address);
  console.log("ETH:", eth.address);
  console.log("WBTC:", wbtc.address);
  console.log("XRP:", xrp.address);
  console.log("UNI:", uni.address);
  console.log("LINK:", link.address);
  console.log("DOGE:", doge.address);
  console.log("SHIB:", shib.address);
  console.log("PEPE:", pepe.address);
  console.log("FLOKI:", floki.address);


  const addresses = {
    // Core contracts
    core: {
      Factory: await core.factory.getAddress(),
      Router: await core.router.getAddress(),
      WETH: await core.weth.getAddress(),
      SmartBasket: smartBasketAddress
    },
    // Tokens
    tokens: {
      USDT: usdt.address,
      ETH: eth.address,
      WBTC: wbtc.address,
      XRP: xrp.address,
      UNI: uni.address,
      LINK: link.address,
      DOGE: doge.address,
      SHIB: shib.address,
      PEPE: pepe.address,
      FLOKI: floki.address
    }
  };
  fs.writeFileSync('addresses.json', JSON.stringify(addresses));
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });