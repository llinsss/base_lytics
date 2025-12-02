import { base, baseSepolia } from 'wagmi/chains';
import { BaseTokenABI, BaseNFTABI, BaseStakingABI } from './abis';

export interface ContractAddresses {
  BaseToken: `0x${string}`;
  BaseNFT: `0x${string}`;
  BaseStaking: `0x${string}`;
}

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [baseSepolia.id]: {
    BaseToken: '0x0000000000000000000000000000000000000000',
    BaseNFT: '0x0000000000000000000000000000000000000000',
    BaseStaking: '0x0000000000000000000000000000000000000000',
  },
  [base.id]: {
    BaseToken: '0x0000000000000000000000000000000000000000',
    BaseNFT: '0x0000000000000000000000000000000000000000',
    BaseStaking: '0x0000000000000000000000000000000000000000',
  },
};

export function getContractAddress(chainId: number, contractName: keyof ContractAddresses): `0x${string}` {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }
  return addresses[contractName];
}

export const ABIS = {
  BaseToken: BaseTokenABI,
  BaseNFT: BaseNFTABI,
  BaseStaking: BaseStakingABI,
} as const;

export function getContractABI(contractName: keyof ContractAddresses) {
  return ABIS[contractName];
}