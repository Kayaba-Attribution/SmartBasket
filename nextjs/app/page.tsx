"use client";

import React from "react";
import Link from "next/link";
import addresses from "../../Hardhat/addresses.json";
import { BasketProvider } from "./BasketContext";
import CreateBasket from "./CreateBasket";
import SellBasket from "./SellBasket";
import GetTokenBalance from "./GetTokenBalance";
import GetUserBaskets from "./GetUserBaskets";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const contractAddress = addresses.core.SmartBasket;

  return (
    <BasketProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-8 ">
          <h1 className="text-4xl font-bold text-center mb-8 glow">Smart Basket Portfolio Manager</h1>

          {connectedAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="col-span-1 md:col-span-2 glow">
                <div className="bg-base-200 rounded-lg p-6 shadow-lg flex justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Your Account</h2>
                    <p className="mb-2">
                      Connected Address: <Address address={connectedAddress} />
                    </p>
                    <p>
                      Smart Basket Contract: <Address address={contractAddress} />
                    </p>
                  </div>
                  <div>
                    <div className="mt-4 md:mt-0">
                      <h3 className="text-xl font-semibold mb-2">Core Contracts</h3>
                      <ul className="space-y-2">
                        {Object.entries(addresses.core).map(([name, address]) => (
                          <li key={name} className="flex flex-col">
                            <span className="font-medium">{name}:</span>
                            <Address address={address} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="glow">
                <div className="bg-base-200 rounded-lg p-6 shadow-lg h-full">
                  <h2 className="text-2xl font-semibold mb-4">Create Basket</h2>
                  <CreateBasket />
                </div>
              </section>

              <section className="glow">
                <div className="bg-base-200 rounded-lg p-6 shadow-lg h-full">
                  <GetUserBaskets />
                </div>
              </section>

              <section className="glow">
                <div className="bg-base-300 rounded-lg p-6 shadow-lg h-full">
                  <h2 className="text-2xl font-semibold mb-4">Sell Basket</h2>
                  <SellBasket />
                </div>
              </section>

              <section className="glow">
                <div className="bg-base-300 rounded-lg p-6 shadow-lg h-full">
                  <h2 className="text-2xl font-semibold mb-4">Basket Details</h2>
                  <p className="text-gray-500">Feature coming soon...</p>
                </div>
              </section>

              <section className="col-span-1 md:col-span-2">
                <div className="bg-base-200 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">Your Token Balances</h2>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Address</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(addresses.tokens).map(([name, address]) => (
                          <tr key={name}>
                            <td>{name}</td>
                            <td>
                              <Address address={address} />
                            </td>
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
                </div>
              </section>
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
