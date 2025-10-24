import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';

// Contract ABIs (simplified for demo)
const TSD_ABI = [
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getStakingInfo",
    "outputs": [
      {"name": "amount", "type": "uint256"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "rewards", "type": "uint256"},
      {"name": "isStaked", "type": "bool"},
      {"name": "discount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const DEX_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"name": "user", "type": "address"},
          {"name": "tokenIn", "type": "address"},
          {"name": "tokenOut", "type": "address"},
          {"name": "amountIn", "type": "uint256"},
          {"name": "minAmountOut", "type": "uint256"},
          {"name": "deadline", "type": "uint256"},
          {"name": "salt", "type": "bytes32"},
          {"name": "maxSlippage", "type": "uint256"}
        ],
        "name": "order",
        "type": "tuple"
      }
    ],
    "name": "executeProtectedOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Contract addresses (Sepolia testnet)
const CONTRACT_ADDRESSES = {
  TSD: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8bF',
  TSP: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
  TSN: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  DEX: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
} as const;

export const useTSDToken = () => {
  const { address } = useAccount();
  
  const { data: stakingInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.TSD,
    abi: TSD_ABI,
    functionName: 'getStakingInfo',
    args: address ? [address] : undefined,
  });

  const { writeContract: stakeTSD, data: stakeHash } = useWriteContract();
  const { writeContract: unstakeTSD, data: unstakeHash } = useWriteContract();
  const { writeContract: claimRewards, data: claimHash } = useWriteContract();

  const stake = (amount: bigint) => {
    stakeTSD({
      address: CONTRACT_ADDRESSES.TSD,
      abi: TSD_ABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  const unstake = (amount: bigint) => {
    unstakeTSD({
      address: CONTRACT_ADDRESSES.TSD,
      abi: TSD_ABI,
      functionName: 'unstake',
      args: [amount],
    });
  };

  const claim = () => {
    claimRewards({
      address: CONTRACT_ADDRESSES.TSD,
      abi: TSD_ABI,
      functionName: 'claimRewards',
      args: [],
    });
  };

  return {
    stakingInfo,
    stake,
    unstake,
    claim,
    stakeHash,
    unstakeHash,
    claimHash,
  };
};

export const useDEX = () => {
  const { writeContract: executeOrder, data: orderHash } = useWriteContract();

  const executeTrade = (order: {
    user: `0x${string}`;
    tokenIn: `0x${string}`;
    tokenOut: `0x${string}`;
    amountIn: bigint;
    minAmountOut: bigint;
    deadline: bigint;
    salt: `0x${string}`;
    maxSlippage: bigint;
  }) => {
    executeOrder({
      address: CONTRACT_ADDRESSES.DEX,
      abi: DEX_ABI,
      functionName: 'executeProtectedOrder',
      args: [order],
    });
  };

  return {
    executeTrade,
    orderHash,
  };
};

export const useTransactionStatus = (hash: `0x${string}` | undefined) => {
  const { data: receipt, isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    receipt,
    isLoading,
    isSuccess,
  };
};
