import React, { useEffect, useState } from "react";
import addresses from "../contracts/addresses.json";
import SmartBasketABI from "../contracts/artifacts/SmartBasket.json";
import { usePortfolioContext } from "./PortfolioContext";
import { formatEther } from "ethers";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

function SellBasket() {
  const { address: userAddress } = useAccount();
  const { setRefreshBaskets, setRefreshTokenBalances } = usePortfolioContext();
  const [selectedBasket, setSelectedBasket] = useState<number | null>(null);
  const [userBaskets, setUserBaskets] = useState<any[]>([]);

  const basketAddress = addresses.core.SmartBasket as `0x${string}`;

  // Fetch user baskets
  const {
    data: basketsData,
    isError,
    isLoading,
    refetch: refetchBaskets,
  } = useReadContract({
    address: basketAddress,
    abi: SmartBasketABI.abi,
    functionName: "getUserBaskets",
    args: [userAddress],
  });

  useEffect(() => {
    if (Array.isArray(basketsData)) {
      setUserBaskets(basketsData);
    }
  }, [basketsData]);

  // Sell Basket
  const { writeContract: sellBasket, data: sellData } = useWriteContract();

  const { isLoading: isSelling, isSuccess: isSellSuccess } = useWaitForTransactionReceipt({
    hash: sellData,
  });

  const handleSellBasket = async () => {
    if (selectedBasket === null) return;

    sellBasket({
      address: basketAddress,
      abi: SmartBasketABI.abi,
      functionName: "sellBasket",
      args: [selectedBasket],
    });
  };

  useEffect(() => {
    if (isSellSuccess) {
      setRefreshBaskets(true); // Trigger a refresh of the user's baskets
      setRefreshTokenBalances(true); // Trigger a refresh of token balances
      refetchBaskets(); // Refetch the baskets for this component
      setSelectedBasket(null); // Reset the selection
    }
  }, [isSellSuccess, setRefreshBaskets, setRefreshTokenBalances, refetchBaskets]);

  if (isLoading) return <div>Loading baskets...</div>;
  if (isError) return <div>Error loading baskets</div>;

  return (
    <div className="my-2">
      <h3 className="text-lg font-bold mb-2">Sell Basket:</h3>
      {userBaskets.length > 0 ? (
        <div className="flex flex-col">
          <select
            value={selectedBasket !== null ? selectedBasket : ""}
            onChange={e => setSelectedBasket(Number(e.target.value))}
            className="select select-bordered w-full mb-2"
          >
            <option value="" disabled>
              Select a basket to sell
            </option>
            {userBaskets.map((basket, index) => (
              <option key={index} value={index}>
                Basket {index} - Total Value: {formatEther(basket.investmentValue)} USDT
              </option>
            ))}
          </select>
          <button
            onClick={handleSellBasket}
            disabled={isSelling || selectedBasket === null}
            className="btn btn-primary w-full"
          >
            {isSelling ? "Selling Basket..." : "Sell Basket"}
          </button>
        </div>
      ) : (
        <p>You dont have any baskets to sell.</p>
      )}
      {isSellSuccess && <p className="text-green-500 mt-2">Basket sold successfully!</p>}
    </div>
  );
}

export default SellBasket;