import React, { useState } from "react";
import TokenABI from "../../Hardhat/artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";
import { formatEther } from "ethers";
import { useReadContract } from "wagmi";

interface GetTokenBalanceProps {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  contractName: string;
}

const GetTokenBalance: React.FC<GetTokenBalanceProps> = ({ contractAddress, userAddress, contractName }) => {
  const [showBalance, setShowBalance] = useState(false);

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
      <button onClick={handleFetchBalance} className="btn btn-xs btn-primary">
        Fetch
      </button>
    );
  }

  if (isBalanceLoading) return <span>Loading...</span>;
  if (isBalanceError) return <span>Error</span>;

  const tokenBalance = typeof balance === "bigint" ? balance : 0n;

  return (
    <div className="flex items-center space-x-2">
      <button onClick={handleFetchBalance} className="btn btn-xs btn-primary">
        Refresh
      </button>
      <span>{formatEther(tokenBalance)} {contractName}</span>
    </div>
  );
};

export default GetTokenBalance;