import React, { useEffect, useState } from "react";
import addresses from "../../Hardhat/addresses.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { useBasketContext } from "./BasketContext";
import { formatEther } from "ethers";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

interface BasketDetails {
  tokenAddresses: string[];
  tokenPercentages: number[];
  tokenAmounts: bigint[];
  tokenValues: bigint[];
  totalValue: bigint;
}

const GetUserBaskets: React.FC = () => {
  const { refreshBaskets, setRefreshBaskets } = useBasketContext();
  const { address } = useAccount();
  const [basketDetails, setBasketDetails] = useState<BasketDetails[]>([]);

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

  useEffect(() => {
    if (refreshBaskets) {
      refetch();
      setRefreshBaskets(false);
    }
  }, [refreshBaskets, refetch, setRefreshBaskets]);

  const basketCount = Array.isArray(userBaskets) ? userBaskets.length : 0;

  const assetDetailsResults = useReadContracts({
    contracts: Array.from({ length: basketCount }, (_, i) => ({
      address: addresses.core.SmartBasket as `0x${string}`,
      abi: SmartBasketABI.abi,
      functionName: "getBasketAssetDetails",
      args: [address, i],
    })),
  });

  const totalValueResults = useReadContracts({
    contracts: Array.from({ length: basketCount }, (_, i) => ({
      address: addresses.core.SmartBasket as `0x${string}`,
      abi: SmartBasketABI.abi,
      functionName: "getBasketTotalValue",
      args: [address, i],
    })),
  });

  useEffect(() => {
    if (basketCount > 0 && assetDetailsResults.data && totalValueResults.data) {
      console.log("Asset Details Results:", assetDetailsResults.data);
      const details: BasketDetails[] = assetDetailsResults.data.map((assetDetail, index) => {
        const [tokenAddresses, tokenPercentages, tokenAmounts, tokenValues] = assetDetail.result as [string[], bigint[], bigint[], bigint[]];
        const totalValue = totalValueResults.data[index].result as bigint;

        return {
          tokenAddresses,
          tokenPercentages: tokenPercentages.map(p => Number(p)), // Convert bigint to number
          tokenAmounts,
          tokenValues,
          totalValue,
        };
      });
      console.log("Processed Basket Details:", details);
      setBasketDetails(details);
    }
  }, [basketCount, assetDetailsResults.data, totalValueResults.data]);

  if (isLoading || assetDetailsResults.isLoading || totalValueResults.isLoading) return <div>Loading...</div>;
  if (isError || assetDetailsResults.isError || totalValueResults.isError)
    return <div>Error fetching basket information</div>;

  const formatValue = (value: bigint) => {
    const formatted = parseFloat(formatEther(value)).toFixed(2);
    return formatted === "-0.00" ? "0.00" : formatted;
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
            <th>Total Value (USDT)</th>
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
              <td>{formatValue(basket.totalValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GetUserBaskets;
