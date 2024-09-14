"use client";

import React from "react";
import Link from "next/link";
import addresses from "../../Hardhat/addresses.json";
import { ContractProvider, useContractContext } from "./ContractContext";
import GetTokenBalance from "./GetTokenBalance";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  return (
    <ContractProvider>
      <HomeContent />
    </ContractProvider>
  );
};

const HomeContent: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const { contractAddress } = useContractContext();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-4">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Lottery Game Encode - Group 1</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            {connectedAddress && <Address address={connectedAddress} />}
          </div>
        </div>

        <PageBody />

        {connectedAddress && (
          <div className="mt-8 p-4 bg-base-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Deployed Contracts and Balances</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Contract Name</th>
                    <th>Address</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(addresses).slice(3).map(([name, address]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>
                        <Address address={address} />
                      </td>
                      <td>
                        <GetTokenBalance
                          contractAddress={address as `0x${string}`}
                          userAddress={connectedAddress}
                          contractName={name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {contractAddress && (
          <div className="mt-8 py-4 bg-base-200 rounded-lg">
            <div className="text-center max-w-2xl mx-auto my-4 p-2 bg-base-300 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Current Lottery Contract</h2>
              <div className="bg-base-100 rounded-md overflow-hidden">
                <p className="font-mono text-sm break-all">{contractAddress}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
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
      </div>
    </>
  );
};

const PageBody: React.FC = () => {
  return (
    <>
      <p className="text-center text-lg">Start by getting some Sepolia ETH through Faucet!</p>
    </>
  );
};

export default Home;
