"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import addresses from "../../Hardhat/addresses.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { BasketProvider } from "./BasketContext";
import CreateBasket from "./CreateBasket";
import GetTokenBalance from "./GetTokenBalance";
import GetUserBaskets from "./GetUserBaskets";
import SellBasket from "./SellBasket";
import { formatEther } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { ArrowPathIcon, BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const contractAddress = addresses.core.SmartBasket;
  const [totalUsdtInvested, setTotalUsdtInvested] = useState("0.00");
  const [isContractsVisible, setIsContractsVisible] = useState(false);
  const [isAllTokensVisible, setIsAllTokensVisible] = useState(false);

  const { data: basketsData, refetch: refetchBaskets } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: SmartBasketABI.abi,
    functionName: "getUserBaskets",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (Array.isArray(basketsData)) {
      const total = basketsData.reduce((sum, basket) => sum + BigInt(basket.investmentValue), BigInt(0));
      setTotalUsdtInvested(formatEther(total));
    }
  }, [basketsData]);

  const tokenEntries = Object.entries(addresses.tokens);

  return (
    <BasketProvider>
      <div className="flex flex-col min-h-screen">
        <div className="pt-8 text-center">
          <div className="container mx-auto px-4 glow">
            <h1 className="text-4xl font-extrabold mb-4">Smart Basket Portfolio Manager</h1>
            
            <p className="text-xl text-base-content opacity-80 max-w-2xl mx-auto">
              Customize, manage, and optimize your crypto portfolio with ease. Create diversified baskets and track your
              investments in real-time.
            </p>
          </div>
        </div>
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {connectedAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
              {/* Left Panel */}
              <div className="md:col-span-1 space-y-8">
                <div className="card bg-base-200 shadow-xl glow">
                  <div className="card-body">
                    <h2 className="card-title mb-4">Your Account</h2>
                    <div className="flex flex-col space-y-4">
                      <div>
                        <p className="text-sm opacity-70 mb-1">Connected Address:</p>
                        <Address address={connectedAddress} />
                      </div>
                      <div>
                        <p className="text-sm opacity-70 mb-1">Total Investment:</p>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">${totalUsdtInvested}</span>
                          <span className="ml-2 text-sm opacity-70">USDT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-xl glow">
                  <div className="card-body">
                    <h2 className="card-title">Your Token Balances</h2>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Token</th>
                            <th>Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokenEntries.slice(0, 5).map(([name, address]) => (
                            <tr key={name}>
                              <td>{name}</td>
                              <td>
                                <GetTokenBalance
                                  contractAddress={address as `0x${string}`}
                                  userAddress={connectedAddress as `0x${string}`}
                                  contractName={name}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {tokenEntries.length > 5 && (
                      <div>
                        <button
                          className="btn btn-sm btn-ghost mt-2"
                          onClick={() => setIsAllTokensVisible(!isAllTokensVisible)}
                        >
                          {isAllTokensVisible ? "Hide" : "Show More"} Tokens
                        </button>
                        {isAllTokensVisible && (
                          <table className="table w-full mt-2">
                            <tbody>
                              {tokenEntries.slice(5).map(([name, address]) => (
                                <tr key={name}>
                                  <td>{name}</td>
                                  <td>
                                    <GetTokenBalance
                                      contractAddress={address as `0x${string}`}
                                      userAddress={connectedAddress as `0x${string}`}
                                      contractName={name}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card bg-base-200 shadow-xl glow">
                  <div className="card-body">
                    <h2
                      className="card-title cursor-pointer"
                      onClick={() => setIsContractsVisible(!isContractsVisible)}
                    >
                      Core Contracts {isContractsVisible ? "▼" : "►"}
                    </h2>
                    {isContractsVisible && (
                      <ul className="space-y-2">
                        {Object.entries(addresses.core).map(([name, address]) => (
                          <li key={name} className="flex flex-col">
                            <span className="font-medium">{name}:</span>
                            <Address address={address} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Center and Right Panels */}
              <div className="md:col-span-2 space-y-8">
                <div className="card bg-base-200 shadow-xl glow">
                  <div className="card-body">
                    <GetUserBaskets />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card bg-base-200 shadow-xl glow">
                    <div className="card-body">
                      <h2 className="card-title">Create Basket</h2>
                      <CreateBasket />
                    </div>
                  </div>

                  <div className="card bg-base-200 shadow-xl glow">
                    <div className="card-body">
                      <h2 className="card-title">Sell Basket</h2>
                      <SellBasket />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-4">Please connect your wallet to use Smart Basket.</p>
            </div>
          )}
        </main>
        <footer className="bg-base-300 py-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <BugAntIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Tinker with your smart contract using the{" "}
                  <Link href="/debug" passHref className="link">
                    Debug Contracts
                  </Link>{" "}
                  tab.
                </p>
              </div>
              <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
                <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Explore your local transactions with the{" "}
                  <Link href="/blockexplorer" passHref className="link">
                    Block Explorer
                  </Link>{" "}
                  tab.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BasketProvider>
  );
};

export default Home;
