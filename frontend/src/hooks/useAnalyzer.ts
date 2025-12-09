import { useState, useEffect } from 'react';
import { usePublicClient, useBalance, useBytecode } from 'wagmi';
import { getAddress, isAddress, formatEther, parseAbi, ContractFunctionExecutionError } from 'viem';

export type ContractType = 'unknown' | 'erc20' | 'erc721';

export interface AnalyzerData {
    address: string;
    isValid: boolean;
    isContract: boolean;
    bytecodeSize: number;
    balance: string;
    type: ContractType;
    tokenInfo?: {
        name?: string;
        symbol?: string;
        decimals?: number;
        totalSupply?: string;
    };
    error?: string;
}

const COMMON_ABI = parseAbi([
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function tokenURI(uint256) view returns (string)',
    'function ownerOf(uint256) view returns (address)',
]);

export function useAnalyzer(addressInput: string) {
    const [data, setData] = useState<AnalyzerData | null>(null);
    const [loading, setLoading] = useState(false);
    const publicClient = usePublicClient();

    // Basic validation
    const isValidAddress = isAddress(addressInput);
    const formattedAddress = isValidAddress ? getAddress(addressInput) : undefined;

    // Hooks for basic chain data
    const { data: balanceData } = useBalance({
        address: formattedAddress,
        query: { enabled: !!formattedAddress },
    });

    const { data: bytecode } = useBytecode({
        address: formattedAddress,
        query: { enabled: !!formattedAddress },
    });

    useEffect(() => {
        async function analyze() {
            if (!formattedAddress || !publicClient) return;
            if (!bytecode) return; // Wait for bytecode to confirm it's a contract

            setLoading(true);
            try {
                const isContract = bytecode && bytecode.length > 2;

                const result: AnalyzerData = {
                    address: formattedAddress,
                    isValid: true,
                    isContract: !!isContract,
                    bytecodeSize: bytecode ? (bytecode.length - 2) / 2 : 0,
                    balance: balanceData ? formatEther(balanceData.value) : '0',
                    type: 'unknown',
                };

                if (isContract) {
                    // Try to detect ERC20/721 properties
                    // We use a "best effort" approach here
                    const [name, symbol, decimals, totalSupply] = await Promise.all([
                        publicClient.readContract({ address: formattedAddress, abi: COMMON_ABI, functionName: 'name' }).catch(() => undefined),
                        publicClient.readContract({ address: formattedAddress, abi: COMMON_ABI, functionName: 'symbol' }).catch(() => undefined),
                        publicClient.readContract({ address: formattedAddress, abi: COMMON_ABI, functionName: 'decimals' }).catch(() => undefined),
                        publicClient.readContract({ address: formattedAddress, abi: COMMON_ABI, functionName: 'totalSupply' }).catch(() => undefined),
                    ]);

                    // Simple heuristics
                    if (decimals !== undefined) {
                        result.type = 'erc20';
                    } else if (name && symbol && totalSupply) {
                        // Could be NFT or Token without decimals, defaulting to generic token-like
                        // Checking for NFT specific methods like ownerOf(1) or tokenURI(1) would be better but requires knowing existing IDs.
                        // For now, let's assume if it has decimals it's ERC20, if not but has name/symbol it might be ERC721 or weird ERC20.
                        result.type = 'erc721';
                    }

                    if (name || symbol) {
                        result.tokenInfo = {
                            name,
                            symbol,
                            decimals,
                            totalSupply: totalSupply ? totalSupply.toString() : undefined,
                        };
                    }
                }

                setData(result);
            } catch (err) {
                console.error("Analysis failed", err);
                setData(prev => prev ? { ...prev, error: 'Analysis failed' } : null);
            } finally {
                setLoading(false);
            }
        }

        if (isValidAddress && bytecode) {
            analyze();
        } else if (isValidAddress && bytecode === undefined) {
            // Loading bytecode...
            setLoading(true);
        } else if (isValidAddress && bytecode === null) {
            // Not a contract (EOA)
            if (formattedAddress && balanceData) {
                setData({
                    address: formattedAddress,
                    isValid: true,
                    isContract: false,
                    bytecodeSize: 0,
                    balance: formatEther(balanceData.value),
                    type: 'unknown',
                });
                setLoading(false);
            }
        }

    }, [formattedAddress, bytecode, balanceData, publicClient]);

    return {
        data,
        loading: loading,
        isValidAddress,
    };
}
