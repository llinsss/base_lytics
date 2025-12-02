import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useContractAddresses, BASE_DEX_ABI } from '../utils/contracts';
import { parseEther, formatEther } from 'viem';

export function useDEX() {
    const { BaseDEX } = useContractAddresses();
    const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const swap = async (tokenIn: string, tokenOut: string, amountIn: string, minAmountOut: string) => {
        return writeContract({
            address: BaseDEX,
            abi: BASE_DEX_ABI,
            functionName: 'swap',
            args: [tokenIn, tokenOut, parseEther(amountIn), parseEther(minAmountOut)],
        });
    };

    const addLiquidity = async (
        tokenA: string,
        tokenB: string,
        amountA: string,
        amountB: string,
        minLiquidityA: string,
        minLiquidityB: string
    ) => {
        return writeContract({
            address: BaseDEX,
            abi: BASE_DEX_ABI,
            functionName: 'addLiquidity',
            args: [
                tokenA,
                tokenB,
                parseEther(amountA),
                parseEther(amountB),
                parseEther(minLiquidityA),
                parseEther(minLiquidityB),
            ],
        });
    };

    const removeLiquidity = async (
        tokenA: string,
        tokenB: string,
        liquidity: string,
        minAmountA: string,
        minAmountB: string
    ) => {
        return writeContract({
            address: BaseDEX,
            abi: BASE_DEX_ABI,
            functionName: 'removeLiquidity',
            args: [
                tokenA,
                tokenB,
                parseEther(liquidity),
                parseEther(minAmountA),
                parseEther(minAmountB),
            ],
        });
    };

    const createPool = async (tokenA: string, tokenB: string, feeRate: number) => {
        return writeContract({
            address: BaseDEX,
            abi: BASE_DEX_ABI,
            functionName: 'createPool',
            args: [tokenA, tokenB, BigInt(feeRate)],
        });
    };

    return {
        swap,
        addLiquidity,
        removeLiquidity,
        createPool,
        isPending,
        isConfirming,
        isConfirmed,
        hash,
        writeError,
    };
}

export function useDEXQuote(tokenIn: string, tokenOut: string, amountIn: string) {
    const { BaseDEX } = useContractAddresses();

    return useReadContract({
        address: BaseDEX,
        abi: BASE_DEX_ABI,
        functionName: 'getQuote',
        args: [tokenIn, tokenOut, parseEther(amountIn || '0')],
        query: {
            enabled: !!tokenIn && !!tokenOut && !!amountIn && amountIn !== '0',
        },
    });
}

export function usePoolInfo(tokenA: string, tokenB: string) {
    const { BaseDEX } = useContractAddresses();

    return useReadContract({
        address: BaseDEX,
        abi: BASE_DEX_ABI,
        functionName: 'getPoolInfo',
        args: [tokenA, tokenB],
        query: {
            enabled: !!tokenA && !!tokenB,
        },
    });
}
