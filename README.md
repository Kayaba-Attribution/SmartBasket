# SmartBasket: Customizable Token Portfolio Manager

### Things to do for an MVP:

- **Create basket**
   - check allowance of usdt of the user to the basket contract ✅
   - create component ✅
      - input for amount in usdt ✅
      - button to call the createBasket with hardcoded allocations ✅
   - extra (should be done):
      - choose the type of assets and the percentages ✅
      - max 5 tokens, % must sum to 100 ✅
      - dropdown menu? pre-made risk basket (might be easier at first) ✅
- **Sell basket**
   - create component ✅
      - index of basket to sell ✅
      - check user usdt has gotten up ✅
   - extra (only if time permits):
      - modify contract to sell only a % of the basket ie: 25%
      - modify to be able to sell x amount of usdt
- **View functions**
   - use getUserBaskets to get all the users baskets (user) ✅
   - use getBasketAssetDetails (user, index) to get basket details ✅
   - use getBasketTotalValue (user, index) to get usdt value of basket ✅
   - showcase the results ✅
   - save all, show all porfolio total balance and refresh on create
- **Others**
   - improve UI ✅
   - deploy on testnet

## Overview

SmartBasket is a Solidity-based smart contract system that allows users to create and manage customizable token portfolios (baskets) using USDT as the base currency. The project utilizes Uniswap V2 for token swaps and liquidity provision.

## Key Components

1. **SmartBasket Contract**: The main contract that handles basket creation, management, and liquidation.
2. **ERC20 Tokens**: Various ERC20 tokens representing different cryptocurrencies and risk levels.
3. **Uniswap V2**: Used for token swaps and liquidity provision.

## Features

- Create customized token baskets with up to 5 different tokens
- Invest in baskets using USDT
- Sell baskets and receive USDT
- View basket total value and individual asset details

## Project Structure

1. **Smart Contracts**:
   - `SmartBasket.sol`: Main contract for basket management
   - `ERC20_BASE.sol`: Base ERC20 token implementation

2. **Deployment Scripts**:
   - `deploy.ts`: Deploys core contracts, tokens, and sets up liquidity pairs

3. **Test Suite**:
   - `SmartBasket.test.ts`: Comprehensive tests for the SmartBasket contract

## Workflow

1. **Deployment**:
   - Deploy Uniswap V2 core contracts (Factory, Router, WETH)
   - Deploy USDT and other ERC20 tokens
   - Create Uniswap pairs and add initial liquidity

2. **Basket Creation**:
   - User approves USDT spending for the SmartBasket contract
   - User calls `createBasket` with token allocations and USDT amount
   - Contract swaps USDT for specified tokens using Uniswap

3. **Basket Management**:
   - Users can view basket details using `getBasketTotalValue` and `getBasketAssetDetails`

4. **Basket Liquidation**:
   - User calls `sellBasket` to liquidate a basket
   - Contract swaps all tokens back to USDT using Uniswap and returns USDT to the user

## Testing

The test suite covers various scenarios including:
- Basket creation and liquidation
- Invalid input handling
- Multi-basket management
- Value and asset detail retrieval

## Setup and Deployment for Hardhat

1. Clone the repository
2. `cd Hardhat` and install dependencies: `npm install`
3. Compile `npx hardhat compile`
4. Start Node `npx hardhat node`
5. Deploy contracts: `npx hardhat run scripts/deploy.ts --network localhost`
6. Run tests: `npx hardhat test --network localhost`

## Setup and Deployment for Hardhat

1. `cd nextjs` and install dependencies: `npm install`
2. Start the project `npm run dev`
3. You should see the balances, if not check:
   - node running?
   - deploy script ran?
5. Get tokens `npx hardhat mint-tokens --address your_address_here --network localhost`
6. When re-fetching the balances you should see the values

## Notes for Developers

- The project uses Hardhat for development and testing
- Ensure you have sufficient ETH for gas fees when deploying to a testnet or mainnet
