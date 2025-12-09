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

export interface ContractAddresses {
  BaseToken: `0x${string}`;
  BaseNFT: `0x${string}`;
  BaseStaking: `0x${string}`;
  BalanceManager: `0x${string}`;
  BalanceTracker: `0x${string}`;
  BaseDEX: `0x${string}`;
  BaseMarketplace: `0x${string}`;
  BaseVesting: `0x${string}`;
  BaseGovernance: `0x${string}`;
}