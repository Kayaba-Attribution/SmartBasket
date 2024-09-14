import React, { useState } from "react";
import TokenABI from "../../Hardhat/artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";
import { formatEther } from "ethers";
import { useReadContract, useAccount } from "wagmi";

interface GetTokenBalanceProps {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  contractName: string;
}

const GetTokenBalance: React.FC<GetTokenBalanceProps> = ({ contractAddress, userAddress, contractName }) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { address: connectedAddress } = useAccount();

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
    // enabled: shouldFetch,
  });

  const handleFetchBalance = async () => {
    setShouldFetch(true);
    await refetchBalance();
  };

  if (!shouldFetch) {
    return (
      <button onClick={handleFetchBalance} className="btn btn-xs btn-primary">
        Fetch Balance
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
      {connectedAddress !== userAddress && (
        <span className="text-xs text-yellow-500">
          (Note: Querying balance for {userAddress.slice(0, 6)}...{userAddress.slice(-4)})
        </span>
      )}
    </div>
  );
};

export default GetTokenBalance;