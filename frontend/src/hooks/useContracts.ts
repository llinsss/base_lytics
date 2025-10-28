import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, BASE_TOKEN_ABI, BASE_NFT_ABI, BASE_STAKING_ABI } from '../utils/contracts';
import { TokenInfo, NFTInfo, StakingInfo } from '../types/contracts';

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'decimals',
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'maxSupply',
  });

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
    totalSupply: totalSupply as bigint,
    maxSupply: maxSupply as bigint,
  };
}

export function useTokenBalance(address?: `0x${string}`) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return balance as bigint;
}

export function useNFTInfo() {
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'symbol',
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'getCurrentTokenId',
  });

  const { data: price } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'PRICE',
  });

  const { data: mintingEnabled } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'mintingEnabled',
  });

  const { data: paused } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'paused',
  });

  return {
    name: name as string,
    symbol: symbol as string,
    totalSupply: Number(totalSupply || 0),
    price: price as bigint,
    mintingEnabled: mintingEnabled as boolean,
    paused: paused as boolean,
  };
}

export function useNFTBalance(address?: `0x${string}`) {
  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  return Number(balance || 0);
}

export function useStakingInfo(userAddress?: `0x${string}`) {
  const { data: totalStaked } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'totalStaked',
  });

  const { data: rewardRate } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'rewardRate',
  });

  const { data: userStake } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'stakes',
    args: userAddress ? [userAddress] : undefined,
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'calculateReward',
    args: userAddress ? [userAddress] : undefined,
  });

  return {
    totalStaked: totalStaked as bigint,
    rewardRate: Number(rewardRate || 0),
    userStaked: userStake ? (userStake as any)[0] : 0n,
    pendingRewards: pendingRewards as bigint,
    apy: Number(rewardRate || 0) * 365 / 100, // Convert basis points to APY
  };
}

export function useContractWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    writeContract,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}