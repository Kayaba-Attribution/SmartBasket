import React from "react";
import addresses from "../../Hardhat/addresses.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { useAccount, useReadContract } from "wagmi";

const GetUserBaskets: React.FC = () => {
  const { address } = useAccount();

  const {
    data: userBaskets,
    isError,
    isLoading,
  } = useReadContract({
    address: addresses.core.SmartBasket as `0x${string}`,
    abi: SmartBasketABI.abi,
    functionName: "getUserBaskets",
    args: [address],
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching basket count</div>;

  const basketCount = Array.isArray(userBaskets) ? userBaskets.length : 0;

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-2">Your Baskets</h3>
      <p>You have {basketCount} basket(s)</p>
    </div>
  );
};

export default GetUserBaskets;
