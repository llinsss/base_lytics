import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useDEX, useDEXQuote } from '../hooks/useDEX';
import { useTransactionNotifications } from '../hooks/useTransactionNotifications';

export function Swap() {
    const { address } = useAccount();
    const { swap, isPending, isConfirming, isSuccess, hash, writeError } = useDEX();

    const [tokenIn, setTokenIn] = useState('');
    const [tokenOut, setTokenOut] = useState('');
    const [amountIn, setAmountIn] = useState('');
    const [minAmountOut, setMinAmountOut] = useState('');

    // Get quote
    const { data: quoteData, isLoading: isQuoteLoading } = useDEXQuote(tokenIn, tokenOut, amountIn);

    useEffect(() => {
        if (quoteData) {
            // quoteData is [amountOut, priceImpact]
            const amountOut = (quoteData as [bigint, bigint])[0];
            // Set min amount out with 0.5% slippage tolerance
            const minOut = (amountOut * BigInt(995)) / BigInt(1000);
            setMinAmountOut(formatEther(minOut));
        } else {
            setMinAmountOut('');
        }
    }, [quoteData]);

    useTransactionNotifications(
        { hash, isPending, isConfirming, isSuccess, error: writeError },
        {
            pendingTitle: 'Swap Submitted',
            successTitle: 'Swap Successful',
            errorTitle: 'Swap Failed',
            onSuccess: () => {
                setAmountIn('');
            }
        }
    );

    const handleSwap = () => {
        if (!tokenIn || !tokenOut || !amountIn || !minAmountOut) return;
        swap(tokenIn, tokenOut, amountIn, minAmountOut);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Swap Tokens</h1>

            <div className="card">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Token In (Address)
                        </label>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={tokenIn}
                            onChange={(e) => setTokenIn(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Token Out (Address)
                        </label>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={tokenOut}
                            onChange={(e) => setTokenOut(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount In
                        </label>
                        <input
                            type="number"
                            placeholder="0.0"
                            value={amountIn}
                            onChange={(e) => setAmountIn(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {!!quoteData && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Estimated Output:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatEther((quoteData as [bigint, bigint])[0])}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Price Impact:</span>
                                <span className={`font-medium ${Number((quoteData as [bigint, bigint])[1]) > 500 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                    {(Number((quoteData as [bigint, bigint])[1]) / 100).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Minimum Received (0.5% slippage):</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {minAmountOut}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSwap}
                        disabled={isPending || isConfirming || !tokenIn || !tokenOut || !amountIn || !minAmountOut}
                        className="btn-primary w-full"
                    >
                        {isPending || isConfirming ? 'Swapping...' : 'Swap'}
                    </button>
                </div>
            </div>
        </div>
    );
}
