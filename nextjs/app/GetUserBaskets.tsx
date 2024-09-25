import React, { useEffect, useState } from "react";
import addresses from "../../Hardhat/addresses.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { useBasketContext } from "./BasketContext";
import { formatEther } from "ethers";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

interface BasketDetails {
  index: number;
  tokenAddresses: string[];
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
      refetch(); // Re-fetch the basket data
      setRefreshBaskets(false); // Reset the refresh flag
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
      const details: BasketDetails[] = assetDetailsResults.data.map((assetDetail, index) => {
        const [tokenAddresses, tokenAmounts, tokenValues] = assetDetail.result as [string[], bigint[], bigint[]];
        const totalValue = totalValueResults.data[index].result as bigint;

        return {
          index,
          tokenAddresses,
          tokenAmounts,
          tokenValues,
          totalValue,
        };
      });
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

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-evenly">
        <h2 className="text-2xl font-semibold mb-4">Your Baskets</h2>
        <h2 className="text-2xl font-semibold mb-4" >[ {basketCount} ]</h2>
      </div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Basket Index</th>
            <th>Tokens</th>
            <th>Amounts</th>
            <th>Values (USDT)</th>
            <th>Total Value (USDT)</th>
          </tr>
        </thead>
        <tbody>
          {basketDetails.map(basket => (
            <tr key={basket.index}>
              <td>{basket.index}</td>
              <td>
                <ul>
                  {basket.tokenAddresses.map((address, i) => (
                    <li key={i}>
                      {address.slice(0, 6)}...{address.slice(-4)}
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
