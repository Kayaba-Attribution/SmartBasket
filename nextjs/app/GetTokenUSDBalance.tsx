import { useReadContract,  useAccount } from 'wagmi';
import { formatEther } from 'ethers';
import { Address } from '~~/components/scaffold-eth';
import TokenABI from '~~/contracts/TokenABI.json';
import addresses from '~~/contracts/addresses.json';

const GetUSDTBalance: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const usdtAddress = addresses.tokens.USDT;

  const {
    data: balance,
    isError,
    isLoading,
  } = useReadContract({
    address: usdtAddress,
    abi: TokenABI.abi,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  if (isLoading) return <span>Loading...</span>;
  if (isError) return <span>Error fetching balance</span>;

  const usdtBalance = typeof balance === "bigint" ? balance : 0n;

  return (
    <div className="flex items-center space-x-2">
      <span>USDT Balance: {formatEther(usdtBalance)} USDT</span>
      <Address address={usdtAddress} />
    </div>
  );
};

export default GetUSDTBalance;
