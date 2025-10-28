export interface ContractAddresses {
  BaseToken: `0x${string}`;
  BaseNFT: `0x${string}`;
  BaseStaking: `0x${string}`;
  BalanceManager?: `0x${string}`;
  BalanceTracker?: `0x${string}`;
  BaseDEX?: `0x${string}`;
  BaseMarketplace?: `0x${string}`;
  BaseVesting?: `0x${string}`;
  BaseGovernance?: `0x${string}`;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply: bigint;
  balance: bigint;
}

export interface NFTInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  price: bigint;
  balance: number;
  mintingEnabled: boolean;
  paused: boolean;
}

export interface StakingInfo {
  totalStaked: bigint;
  userStaked: bigint;
  pendingRewards: bigint;
  rewardRate: number;
  apy: number;
}

export interface UserStats {
  tokenBalance: bigint;
  nftBalance: number;
  stakedAmount: bigint;
  pendingRewards: bigint;
}