import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useDEX } from '../hooks/useDEX';
import { useTransactionNotifications } from '../hooks/useTransactionNotifications';

export function Pool() {
    const { address } = useAccount();
    const { addLiquidity, removeLiquidity, createPool, isPending, isConfirming, isSuccess, hash, writeError } = useDEX();

    const [activeTab, setActiveTab] = useState<'add' | 'remove' | 'create'>('add');

    // Form states
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [liquidity, setLiquidity] = useState('');
    const [feeRate, setFeeRate] = useState('30'); // Default 0.3%

    useTransactionNotifications(
        { hash, isPending, isConfirming, isSuccess, error: writeError },
        {
            pendingTitle: 'Transaction Submitted',
            successTitle: 'Transaction Successful',
            errorTitle: 'Transaction Failed',
            onSuccess: () => {
                setAmountA('');
                setAmountB('');
                setLiquidity('');
            }
        }
    );

    const handleAddLiquidity = () => {
        if (!tokenA || !tokenB || !amountA || !amountB) return;
        // Using 0 for min amounts for simplicity in this demo UI
        addLiquidity(tokenA, tokenB, amountA, amountB, '0', '0');
    };

    const handleRemoveLiquidity = () => {
        if (!tokenA || !tokenB || !liquidity) return;
        // Using 0 for min amounts for simplicity in this demo UI
        removeLiquidity(tokenA, tokenB, liquidity, '0', '0');
    };

    const handleCreatePool = () => {
        if (!tokenA || !tokenB || !feeRate) return;
        createPool(tokenA, tokenB, Number(feeRate));
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Liquidity Pools</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'add'
                            ? 'bg-base-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    Add Liquidity
                </button>
                <button
                    onClick={() => setActiveTab('remove')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'remove'
                            ? 'bg-base-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    Remove Liquidity
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'create'
                            ? 'bg-base-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                >
                    Create Pool
                </button>
            </div>

            <div className="card">
                {activeTab === 'add' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Add Liquidity</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token A (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenA}
                                onChange={(e) => setTokenA(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token B (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenB}
                                onChange={(e) => setTokenB(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount A
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountA}
                                    onChange={(e) => setAmountA(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Amount B
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.0"
                                    value={amountB}
                                    onChange={(e) => setAmountB(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddLiquidity}
                            disabled={isPending || isConfirming || !tokenA || !tokenB || !amountA || !amountB}
                            className="btn-primary w-full"
                        >
                            {isPending || isConfirming ? 'Adding Liquidity...' : 'Add Liquidity'}
                        </button>
                    </div>
                )}

                {activeTab === 'remove' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Remove Liquidity</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token A (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenA}
                                onChange={(e) => setTokenA(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token B (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenB}
                                onChange={(e) => setTokenB(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Liquidity Amount (LP Tokens)
                            </label>
                            <input
                                type="number"
                                placeholder="0.0"
                                value={liquidity}
                                onChange={(e) => setLiquidity(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <button
                            onClick={handleRemoveLiquidity}
                            disabled={isPending || isConfirming || !tokenA || !tokenB || !liquidity}
                            className="btn-primary w-full"
                        >
                            {isPending || isConfirming ? 'Removing Liquidity...' : 'Remove Liquidity'}
                        </button>
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Pool</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token A (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenA}
                                onChange={(e) => setTokenA(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Token B (Address)
                            </label>
                            <input
                                type="text"
                                placeholder="0x..."
                                value={tokenB}
                                onChange={(e) => setTokenB(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fee Rate (Basis Points, e.g. 30 = 0.3%)
                            </label>
                            <input
                                type="number"
                                placeholder="30"
                                value={feeRate}
                                onChange={(e) => setFeeRate(e.target.value)}
                                className="input-field"
                            />
                        </div>
                        <button
                            onClick={handleCreatePool}
                            disabled={isPending || isConfirming || !tokenA || !tokenB || !feeRate}
                            className="btn-primary w-full"
                        >
                            {isPending || isConfirming ? 'Creating Pool...' : 'Create Pool'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
