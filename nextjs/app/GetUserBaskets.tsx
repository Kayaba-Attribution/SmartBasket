import React, { useEffect, useState } from "react";
import addresses from "../contracts/addresses.json";
import SmartBasketABI from "../contracts/artifacts/SmartBasket.json";
import { usePortfolioContext } from "./PortfolioContext";
import { formatEther } from "ethers";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface BasketDetails {
  tokenAddresses: string[];
  tokenPercentages: number[];
  tokenAmounts: bigint[];
  tokenValues: bigint[];
  investmentValue: bigint;
  totalValue: bigint;
}

const GetUserBaskets: React.FC = () => {
  const { refreshBaskets, setRefreshBaskets, setRefreshTokenBalances } = usePortfolioContext();
  const { address } = useAccount();
  const [basketDetails, setBasketDetails] = useState<BasketDetails[]>([]);
  const [sellingBasketId, setSellingBasketId] = useState<number | null>(null);

  const {
    data: userBaskets,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: addresses.core.SmartBasket as `0x${string}`,
    abi: SmartBasketABI.abi,
    functionName: "getUserBaskets",
    args: [address],
  });

  // Sell Basket functionality
  const { writeContract: sellBasket, data: sellData } = useWriteContract();
  const { isLoading: isSelling, isSuccess: isSellSuccess } = useWaitForTransactionReceipt({
    hash: sellData,
  });

  const handleSellBasket = async (basketId: number) => {
    setSellingBasketId(basketId);
    sellBasket({
      address: addresses.core.SmartBasket as `0x${string}`,
      abi: SmartBasketABI.abi,
      functionName: "sellBasket",
      args: [basketId],
    });
  };

  useEffect(() => {
    if (isSellSuccess) {
      setRefreshBaskets(true);
      setRefreshTokenBalances(true);
      refetch();
      setSellingBasketId(null);
    }
  }, [isSellSuccess, setRefreshBaskets, setRefreshTokenBalances, refetch]);

  useEffect(() => {
    if (refreshBaskets) {
      refetch();
      setRefreshBaskets(false);
    }
  }, [refreshBaskets, refetch, setRefreshBaskets]);

  const basketCount = Array.isArray(userBaskets) ? userBaskets.length : 0;

  // @ts-ignore
  const assetDetailsResults = useReadContracts({
    contracts: Array.from({ length: basketCount }, (_, i) => ({
      address: addresses.core.SmartBasket as `0x${string}`,
      abi: SmartBasketABI.abi,
      functionName: "getBasketAssetDetails",
      args: [address, i],
    })),
  });

  // @ts-ignore
  const totalValueResults = useReadContracts({
    contracts: Array.from({ length: basketCount }, (_, i) => ({
      address: addresses.core.SmartBasket as `0x${string}`,
      abi: SmartBasketABI.abi,
      functionName: "getBasketTotalValue",
      args: [address, i],
    })),
  });

  useEffect(() => {
    if (basketCount > 0 && assetDetailsResults.data && totalValueResults.data && Array.isArray(userBaskets)) {
      const details: BasketDetails[] = assetDetailsResults.data.map((assetDetail, index) => {
        const [tokenAddresses, tokenPercentages, tokenAmounts, tokenValues] = assetDetail.result as [
          string[],
          bigint[],
          bigint[],
          bigint[],
        ];
        const totalValue = totalValueResults.data[index].result as bigint;
        const investmentValue = userBaskets[index].investmentValue;

        return {
          tokenAddresses,
          tokenPercentages: tokenPercentages.map(p => Number(p)),
          tokenAmounts,
          tokenValues,
          investmentValue,
          totalValue,
        };
      });
      setBasketDetails(details);
    }
  }, [basketCount, assetDetailsResults.data, totalValueResults.data, userBaskets]);

  if (isLoading || assetDetailsResults.isLoading || totalValueResults.isLoading) return <div>Loading...</div>;
  if (isError || assetDetailsResults.isError || totalValueResults.isError)
    return <div>Create some baskets to see the details here.</div>;

  const formatValue = (value: bigint) => {
    const formatted = parseFloat(formatEther(value)).toFixed(2);
    return formatted === "-0.00" ? "0.00" : formatted;
  };

  const calculateROI = (current: bigint, initial: bigint) => {
    const currentValue = Number(formatValue(current));
    const initialValue = Number(formatValue(initial));
    const roi = ((currentValue - initialValue) / initialValue) * 100;
    return roi.toFixed(2);
  };

  const tokenOptions = Object.entries(addresses.tokens).map(([name, address]) => ({ name, address }));

  const getTokenName = (address: string) => {
    const token = tokenOptions.find(t => t.address === address);
    return token ? token.name : "Unknown";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <h2 className="text-2xl font-semibold mb-4">Your Baskets </h2>
        <div className="ml-4 badge badge-lg">Total: {basketCount}</div>
      </div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Tokens</th>
            <th>Amounts</th>
            <th>Values (USDT)</th>
            <th>Initial Investment</th>
            <th>Current Value</th>
            <th>ROI</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {basketDetails.map((basket, basketIndex) => (
            <tr key={basketIndex}>
              <td>
                <ul>
                  {basket.tokenAddresses.map((address, i) => (
                    <li key={i}>
                      ({basket.tokenPercentages[i]}%) - {getTokenName(address)}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {basket.tokenAmounts.map((amount, i) => (
                    <li key={i}>{formatValue(amount)}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {basket.tokenValues.map((value, i) => (
                    <li key={i}>{formatValue(value)}</li>
                  ))}
                </ul>
              </td>
              <td>{formatValue(basket.investmentValue)} USDT</td>
              <td>{formatValue(basket.totalValue)} USDT</td>
              <td>
                <span className={Number(calculateROI(basket.totalValue, basket.investmentValue)) >= 0 ? "text-green-500" : "text-red-500"}>
                  {calculateROI(basket.totalValue, basket.investmentValue)}%
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleSellBasket(basketIndex)}
                  disabled={isSelling && sellingBasketId === basketIndex}
                  className="btn btn-primary btn-sm"
                >
                  {isSelling && sellingBasketId === basketIndex ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Sell"
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isSellSuccess && (
        <div className="alert alert-success mt-4">
          <span>Basket sold successfully!</span>
        </div>
      )}
    </div>
  );
};

export default GetUserBaskets;