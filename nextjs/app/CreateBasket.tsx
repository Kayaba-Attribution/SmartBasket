import React, { useEffect, useState } from "react";
import addresses from "../../Hardhat/addresses.json";
import ERC20_BASE_ABI from "../../Hardhat/artifacts/contracts/ERC20_BASE.sol/ERC20_BASE.json";
import SmartBasketABI from "../../Hardhat/artifacts/contracts/SmartBasket.sol/SmartBasket.json";
import { parseEther } from "ethers";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

function CreateBasket() {
  const MAXUINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

  const { address: userAddress } = useAccount();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [basketAmount, setBasketAmount] = useState("");

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
      args: [basketAddress, MAXUINT256], // Approve a large amount
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

  const handleCreateBasket = async () => {
    const allocations = [
      { tokenAddress: addresses.tokens.ETH, percentage: 50 },
      { tokenAddress: addresses.tokens.WBTC, percentage: 50 },
    ];

    createBasket({
      address: basketAddress,
      abi: SmartBasketABI.abi,
      functionName: "createBasket",
      args: [allocations, parseEther(basketAmount)],
    });
  };

  return (
    <div className="my-2">
      <h3 className="text-lg font-bold mb-2">Create Basket:</h3>
      {allowance === 0n ? (
        <div>
          <p>You need to approve the Smart Basket contract to use your USDT.</p>
          <button onClick={handleApprove} disabled={isApproving} className="btn btn-primary w-full">
            {isApproving ? "Approving..." : "Approve USDT"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <input
            type="text"
            value={basketAmount}
            onChange={e => setBasketAmount(e.target.value)}
            placeholder="Amount in USDT"
            className="input input-bordered w-full mb-2"
          />
          <button
            onClick={handleCreateBasket}
            disabled={isCreating || !basketAmount}
            className="btn btn-primary w-full"
          >
            {isCreating ? "Creating Basket..." : "Create Basket"}
          </button>
        </div>
      )}
      {isCreateSuccess && <p className="text-green-500 mt-2">Basket created successfully!</p>}
    </div>
  );
}

export default CreateBasket;
