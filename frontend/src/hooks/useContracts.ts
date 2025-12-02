import { useChainId } from 'wagmi';
import { getContractAddress, getContractABI, ContractAddresses } from '../config/contracts';

export function useContracts() {
  const chainId = useChainId();

  const getAddress = (contractName: keyof ContractAddresses) => {
    try {
      return getContractAddress(chainId, contractName);
    } catch {
      return '0x0000000000000000000000000000000000000000' as `0x${string}`;
    }
  };

  return {
    addresses: {
      BaseToken: getAddress('BaseToken'),
      BaseNFT: getAddress('BaseNFT'),
      BaseStaking: getAddress('BaseStaking'),
    },
    abis: {
      BaseToken: getContractABI('BaseToken'),
      BaseNFT: getContractABI('BaseNFT'),
      BaseStaking: getContractABI('BaseStaking'),
    },
    chainId,
  };
}