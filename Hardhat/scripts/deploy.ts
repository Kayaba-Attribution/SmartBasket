import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

// Import artifacts
import WETH9 from "../WETH9.json";
import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import pairArtifact from "@uniswap/v2-periphery/build/IUniswapV2Pair.json";

async function main() {
  // Get signers
  const [owner] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${owner.address}`);

  // Deploy Factory
  const Factory = new ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );
  const factory = await Factory.deploy(owner.address);
  const factoryAddress = await factory.getAddress();
  console.log(`Factory deployed to ${factoryAddress}`);

  // Deploy USDT
  const USDT = await ethers.getContractFactory("Tether");
  const usdt = await USDT.deploy();
  const usdtAddress = await usdt.getAddress();
  console.log(`USDT deployed to ${usdtAddress}`);

  // Deploy USDC
  const USDC = await ethers.getContractFactory("UsdCoin");
  const usdc = await USDC.deploy();
  const usdcAddress = await usdc.getAddress();
  console.log(`USDC deployed to ${usdcAddress}`);

  // Mint tokens
  await usdt.connect(owner).mint(owner.address, ethers.parseEther("1000"));
  await usdc.connect(owner).mint(owner.address, ethers.parseEther("1000"));

  // Create pair
  const tx1 = await factory.createPair(usdtAddress, usdcAddress);
  await tx1.wait();
  const pairAddress = await factory.getPair(usdtAddress, usdcAddress);
  console.log(`Pair deployed to ${pairAddress}`);

  // Get pair contract
  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  let reserves = await pair.getReserves();
  console.log(`Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);

  // Deploy WETH
  const WETH = new ContractFactory(WETH9.abi, WETH9.bytecode, owner);
  const weth = await WETH.deploy();
  const wethAddress = await weth.getAddress();
  console.log(`WETH deployed to ${wethAddress}`);

  // Deploy Router
  const Router = new ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );
  const router = await Router.deploy(factoryAddress, wethAddress);
  const routerAddress = await router.getAddress();
  console.log(`Router deployed to ${routerAddress}`);

  const MaxUint256 = ethers.MaxUint256;

  // Approve tokens
  await usdt.approve(routerAddress, MaxUint256);
  await usdc.approve(routerAddress, MaxUint256);

  const token0Amount = ethers.parseUnits("100", 18);
  const token1Amount = ethers.parseUnits("100", 18);

  const lpTokenBalanceBefore = await pair.balanceOf(owner.address);
  console.log(
    `LP tokens for the owner before: ${lpTokenBalanceBefore.toString()}`
  );

  // Add liquidity
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
  const addLiquidityTx = await router
    .connect(owner)
    .addLiquidity(
      usdtAddress,
      usdcAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      owner.address,
      deadline
    );
  await addLiquidityTx.wait();

  // Check LP token balance
  const lpTokenBalance = await pair.balanceOf(owner.address);
  console.log(`LP tokens for the owner: ${lpTokenBalance.toString()}`);

  reserves = await pair.getReserves();
  console.log(`Reserves: ${reserves[0].toString()}, ${reserves[1].toString()}`);

  // Log addresses
  console.log("USDT_ADDRESS", usdtAddress);
  console.log("USDC_ADDRESS", usdcAddress);
  console.log("WETH_ADDRESS", wethAddress);
  console.log("FACTORY_ADDRESS", factoryAddress);
  console.log("ROUTER_ADDRESS", routerAddress);
  console.log("PAIR_ADDRESS", pairAddress);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });