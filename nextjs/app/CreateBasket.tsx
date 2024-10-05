import React, { useEffect, useState } from "react";
import addresses from "../../Hardhat/addresses.json";
import ERC20_BASE_ABI from "../../Hardhat/artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { useBasketContext } from "./BasketContext";
import { parseEther } from "ethers";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const MAXUINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

const tokens = addresses.tokens;

const predefinedPlans = [
  {
    name: "Low Risk",
    allocations: [
      { tokenAddress: tokens.WNEO, percentage: 60, amount: 0 },
      { tokenAddress: tokens.WBTC, percentage: 20, amount: 0 },
      { tokenAddress: tokens.XRP, percentage: 20, amount: 0 },
    ],
  },
  {
    name: "Medium Risk",
    allocations: [
      { tokenAddress: tokens.UNI, percentage: 50, amount: 0 },
      { tokenAddress: tokens.LINK, percentage: 50, amount: 0 },
    ],
  },
  {
    name: "High Risk",
    allocations: [
      { tokenAddress: tokens.DOGE, percentage: 25, amount: 0 },
      { tokenAddress: tokens.SHIB, percentage: 25, amount: 0 },
      { tokenAddress: tokens.PEPE, percentage: 25, amount: 0 },
      { tokenAddress: tokens.FLOKI, percentage: 25, amount: 0 },
    ],
  },
];

const tokenOptions = Object.entries(tokens).map(([name, address]) => ({ name, address }));

function CreateBasket() {
  const { address: userAddress } = useAccount();
  const { setRefreshBaskets } = useBasketContext();

  const [allowance, setAllowance] = useState<bigint>(0n);
  const [basketAmount, setBasketAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"custom" | number>("custom");
  const [customAllocations, setCustomAllocations] = useState<
    Array<{ tokenAddress: string; percentage: number; amount: number }>
  >([]);

  const basketAddress = addresses.core.SmartBasket as `0x${string}`;
  const usdtAddress = addresses.tokens.USDT as `0x${string}`;

  // Check allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: usdtAddress,
    abi: ERC20_BASE_ABI.abi,
    functionName: "allowance",
    args: userAddress ? [userAddress, basketAddress] : undefined,
  });

  useEffect(() => {
    if (allowanceData !== undefined) {
      setAllowance(allowanceData as bigint);
    }
  }, [allowanceData]);

  // Approve tokens
  const { writeContract: approveTokens, data: approveData } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  const handleApprove = async () => {
    approveTokens({
      address: usdtAddress,
      abi: ERC20_BASE_ABI.abi,
      functionName: "approve",
      args: [basketAddress, MAXUINT256],
    });
  };

  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  // Create Basket
  const { writeContract: createBasket, data: createData } = useWriteContract();

  const { isLoading: isCreating, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createData,
  });

  const handlePlanChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedPlan(value === "custom" ? "custom" : parseInt(value));
  };

  const handleCustomAllocationChange = (index: number, field: "tokenAddress" | "percentage", value: string) => {
    const newAllocations = [...customAllocations];
    if (field === "tokenAddress") {
      newAllocations[index].tokenAddress = value;
    } else {
      newAllocations[index].percentage = parseInt(value) || 0;
    }
    setCustomAllocations(newAllocations);
  };

  const addCustomAllocation = () => {
    if (customAllocations.length < 5) {
      setCustomAllocations([...customAllocations, { tokenAddress: "", percentage: 0, amount: 0 }]);
    }
  };

  const removeCustomAllocation = (index: number) => {
    setCustomAllocations(customAllocations.filter((_, i) => i !== index));
  };

  const getAllocations = () => {
    if (selectedPlan === "custom") {
      return customAllocations.map(({ tokenAddress, percentage }) => ({ tokenAddress, percentage, amount: 0 }));
    }
    return predefinedPlans[selectedPlan].allocations;
  };

  const handleCreateBasket = async () => {
    const allocations = getAllocations();
    createBasket({
      address: basketAddress,
      abi: SmartBasketABI.abi,
      functionName: "createBasket",
      args: [allocations, parseEther(basketAmount)],
    });
  };

  useEffect(() => {
    if (isCreateSuccess) {
      setRefreshBaskets(true);
    }
  }, [isCreateSuccess, setRefreshBaskets]);

  const isCustomPlanValid =
    customAllocations.length > 0 &&
    customAllocations.every(allocation => allocation.tokenAddress && allocation.percentage > 0) &&
    customAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0) === 100;

  const isPlanValid = selectedPlan === "custom" ? isCustomPlanValid : true;

  const getTokenName = (address: string) => {
    const token = tokenOptions.find(t => t.address === address);
    return token ? token.name : "Unknown";
  };

  return (
    <div className="my-2 p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Create Basket</h3>

      {allowance === 0n ? (
        <div>
          <p className="mb-2">You need to approve the Smart Basket contract to use your USDT.</p>
          <button onClick={handleApprove} disabled={isApproving} className="btn btn-primary w-full">
            {isApproving ? "Approving..." : "Approve USDT"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Select Investment Plan</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedPlan === "custom" ? "custom" : selectedPlan}
              onChange={handlePlanChange}
            >
              <option value="custom">Custom Plan</option>
              {predefinedPlans.map((plan, index) => (
                <option key={index} value={index}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPlan !== "custom" && (
            <div className="bg-base-100 p-4 rounded-lg">
              <h4 className="font-bold mb-2">{predefinedPlans[selectedPlan].name} Plan Details:</h4>
              <ul className="list-disc list-inside">
                {predefinedPlans[selectedPlan].allocations.map((allocation, index) => (
                  <li key={index}>
                    {getTokenName(allocation.tokenAddress)}: {allocation.percentage}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedPlan === "custom" && (
            <div className="space-y-2">
              {customAllocations.map((allocation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    className="select select-bordered flex-grow"
                    value={allocation.tokenAddress}
                    onChange={e => handleCustomAllocationChange(index, "tokenAddress", e.target.value)}
                  >
                    <option value="">Select Token</option>
                    {tokenOptions.map(token => (
                      <option key={token.address} value={token.address}>
                        {token.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="input input-bordered w-24"
                    value={allocation.percentage}
                    onChange={e => handleCustomAllocationChange(index, "percentage", e.target.value)}
                    placeholder="%"
                  />
                  <button className="btn btn-square btn-sm" onClick={() => removeCustomAllocation(index)}>
                    X
                  </button>
                </div>
              ))}
              {customAllocations.length < 5 && (
                <button className="btn btn-secondary w-full" onClick={addCustomAllocation}>
                  Add Token
                </button>
              )}
              {selectedPlan === "custom" && !isCustomPlanValid && (
                <p className="text-error">
                  Please ensure all tokens are selected, percentages are greater than 0, and the total percentage is
                  100%.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="label">
              <span className="label-text">Amount in USDT</span>
            </label>
            <input
              type="text"
              value={basketAmount}
              onChange={e => setBasketAmount(e.target.value)}
              placeholder="Amount in USDT"
              className="input input-bordered w-full"
            />
          </div>

          <button
            onClick={handleCreateBasket}
            disabled={isCreating || !basketAmount || !isPlanValid}
            className="btn btn-primary w-full"
          >
            {isCreating ? "Creating Basket..." : "Create Basket"}
          </button>
        </div>
      )}

      {isCreateSuccess && (
        <div className="mt-4 p-4 bg-success text-success-content rounded-lg">Basket created successfully!</div>
      )}
    </div>
  );
}

export default CreateBasket;
