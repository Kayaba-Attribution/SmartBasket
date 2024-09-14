import React, { useState } from "react";
import TokenABI from "../../Hardhat/artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";
import { formatEther } from "ethers";
import { useReadContract } from "wagmi";

function GetTokenBalance({
  contractAddress,
  userAddress,
}: {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
}) {
  const [showBalance, setShowBalance] = useState(false);

  // Fetch the token balance using the payment token address
  const {
    data: balance,
    isError: isBalanceError,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: contractAddress,
    abi: TokenABI.abi,
    functionName: "balanceOf",
    args: [userAddress],
  });

  const handleFetchBalance = async () => {
    setShowBalance(true);
    await refetchBalance();
  };

  if (!showBalance) {
    return (
      <div className="flex justify-center">
        <button onClick={handleFetchBalance} className="btn btn-primary">
          Fetch Balance
        </button>
      </div>
    );
  }

  if (isBalanceLoading) return <div className="text-center">Fetching balance…</div>;
  if (isBalanceError) return <div className="text-center">Error fetching balance</div>;

  const tokenBalance = typeof balance === "bigint" ? balance : 0n;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-4">
        <button onClick={handleFetchBalance} className="btn btn-primary">
          Refresh Balance
        </button>
        <span className="font-semibold">Your Token Balance:</span>
        <span>{formatEther(tokenBalance)} tokens</span>
      </div>
    </div>
  );
}

export default GetTokenBalance;
