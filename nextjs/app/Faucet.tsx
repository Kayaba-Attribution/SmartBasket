import React, { useEffect } from "react";
import addresses from "../contracts/addresses.json";
import ERC20_BASE_ABI from "../contracts/artifacts/ERC20_BASE.json";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

function Faucet() {
  const tokenAddress = addresses.tokens.USDT as `0x${string}`;

  // Claim tokens from faucet
  const { writeContract: claimFaucet, data: claimData } = useWriteContract();

  const { isLoading: isClaiming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimData,
  });

  const handleClaim = async () => {
    console.log("Claiming tokens...");
    claimFaucet({
      address: tokenAddress,
      abi: ERC20_BASE_ABI.abi,
      functionName: "claimFaucet",
    });
  };

  useEffect(() => {
    if (isClaimSuccess) {
      // You can add any post-claim logic here, such as updating UI or refreshing balances
      console.log("Tokens claimed successfully!");
    }
  }, [isClaimSuccess]);

  return (
    <div className="my-2 bg-base-200 rounded-lg glow">
      <h3 className="text-lg font-bold mb-4">USDT Token Faucet</h3>

      <button onClick={handleClaim} disabled={isClaiming} className="btn btn-primary w-full">
        {isClaiming ? "Claiming..." : "Claim 1000 Tokens"}
      </button>
      {isClaimSuccess && (
        <div className="mt-4 p-4 bg-success text-success-content rounded-lg">Tokens claimed successfully!</div>
      )}
    </div>
  );
}

export default Faucet;
