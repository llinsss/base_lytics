import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useContractAddresses, BASE_TOKEN_ABI, BASE_NFT_ABI, BASE_STAKING_ABI } from '../utils/contracts';

export function useContracts() {
  const addresses = useContractAddresses();
  return {
    addresses,
    abis: {
      BaseToken: BASE_TOKEN_ABI,
      BaseNFT: BASE_NFT_ABI,
      BaseStaking: BASE_STAKING_ABI,
    }
  };
}

export function useTokenInfo() {
  const { BaseToken } = useContractAddresses();

  const { data: name } = useReadContract({
    address: BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'decimals',
  });

  const { data: totalSupply } = useReadContract({
    address: BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  const { data: maxSupply } = useReadContract({
    address: BaseToken,
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

export function useNFTInfo() {
  const { BaseNFT } = useContractAddresses();

  const { data: name } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'symbol',
  });

  const { data: price } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'PRICE',
  });

  const { data: totalSupply } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'getCurrentTokenId',
  });

  const { data: mintingEnabled } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'mintingEnabled',
  });

  return {
    name: name as string,
    symbol: symbol as string,
    price: price as bigint,
    totalSupply: totalSupply as bigint,
    mintingEnabled: mintingEnabled as boolean,
  };
}

export function useStakingInfo() {
  const { BaseStaking } = useContractAddresses();

  const { data: totalStaked } = useReadContract({
    address: BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'totalStaked',
  });

  const { data: rewardRate } = useReadContract({
    address: BaseStaking,
    abi: BASE_STAKING_ABI,
    functionName: 'rewardRate',
  });

  return {
    totalStaked: totalStaked as bigint,
    rewardRate: rewardRate as bigint,
  };
}

export function useTokenBalance(address?: `0x${string}`) {
  const { BaseToken } = useContractAddresses();
  const { data } = useReadContract({
    address: BaseToken,
    abi: BASE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
  return data as bigint;
}

export function useNFTBalance(address?: `0x${string}`) {
  const { BaseNFT } = useContractAddresses();
  const { data } = useReadContract({
    address: BaseNFT,
    abi: BASE_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
  return data as bigint;
}

export function useContractWrite() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    writeContract,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}