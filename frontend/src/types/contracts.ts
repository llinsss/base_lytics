import type { BaseTokenABI, BaseNFTABI, BaseStakingABI } from '../config/abis';

export type BaseTokenContract = {
  address: `0x${string}`;
  abi: typeof BaseTokenABI;
};

export type BaseNFTContract = {
  address: `0x${string}`;
  abi: typeof BaseNFTABI;
};

export type BaseStakingContract = {
  address: `0x${string}`;
  abi: typeof BaseStakingABI;
};

export type ContractConfig = {
  BaseToken: BaseTokenContract;
  BaseNFT: BaseNFTContract;
  BaseStaking: BaseStakingContract;
};