import { ContractAddresses } from '../types/contracts';

// Contract addresses - update these with your deployed addresses
export const CONTRACT_ADDRESSES: ContractAddresses = {
  BaseToken: '0x0000000000000000000000000000000000000000',
  BaseNFT: '0x0000000000000000000000000000000000000000',
  BaseStaking: '0x0000000000000000000000000000000000000000',
};

// Contract ABIs (minimal for demo - add full ABIs from artifacts)
export const BASE_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function maxSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function mint(address to, uint256 amount)',
  'function burn(address from, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const;

export const BASE_NFT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function getCurrentTokenId() view returns (uint256)',
  'function PRICE() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function mintingEnabled() view returns (bool)',
  'function paused() view returns (bool)',
  'function mint() payable',
  'function ownerMint(address to, uint256 quantity)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
] as const;

export const BASE_STAKING_ABI = [
  'function stakingToken() view returns (address)',
  'function totalStaked() view returns (uint256)',
  'function rewardRate() view returns (uint256)',
  'function stakes(address) view returns (uint256 amount, uint256 timestamp)',
  'function calculateReward(address user) view returns (uint256)',
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function claimReward()',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
] as const;

export const CHAIN_CONFIG = {
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://sepolia.base.org'] },
      public: { http: ['https://sepolia.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
    },
  },
  base: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
      public: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
  },
};