import React, { useState } from 'react';
import { useAnalyzer } from '../hooks/useAnalyzer';
import { useContractAddresses } from '../utils/contracts';

export function Analyzer() {
    const [inputAddress, setInputAddress] = useState('');
    const [analyzedAddress, setAnalyzedAddress] = useState('');

    const { data, loading, isValidAddress } = useAnalyzer(analyzedAddress);
    const knownAddresses = useContractAddresses();

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        setAnalyzedAddress(inputAddress);
    };

    const loadKnownContract = (name: string, address: string) => {
        setInputAddress(address);
        setAnalyzedAddress(address);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Smart Contract Analyzer
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Enter a contract address to view its details, or select from our known ecosystem contracts.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input and Quick Links */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Analyze Contract
                        </h2>
                        <form onSubmit={handleAnalyze} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Contract Address
                                </label>
                                <input
                                    type="text"
                                    value={inputAddress}
                                    onChange={(e) => setInputAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-base-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!inputAddress}
                                className="w-full px-4 py-2 bg-base-600 hover:bg-base-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Analyze
                            </button>
                        </form>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Known Contracts
                        </h2>
                        <div className="space-y-2">
                            {Object.entries(knownAddresses).map(([name, addr]) => {
                                const address = addr as string;
                                if (!address) return null;
                                return (
                                    <button
                                        key={name}
                                        onClick={() => loadKnownContract(name, address)}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors flex justify-between items-center group"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{name}</span>
                                        <span className="text-gray-400 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                            {address.slice(0, 6)}...{address.slice(-4)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-base-600"></div>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Overview Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Overview
                                        </h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${data.isContract
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                            {data.isContract ? 'Smart Contract' : 'EOA / Address'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{data.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Native Balance</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{parseFloat(data.balance).toFixed(4)} ETH</p>
                                    </div>
                                    {data.isContract && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contract Type</p>
                                                <p className="text-base font-medium text-gray-900 dark:text-gray-100 uppercase">{data.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Code Size</p>
                                                <p className="text-base font-medium text-gray-900 dark:text-gray-100">{data.bytecodeSize} bytes</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Token Info Card (if detected) */}
                            {data.tokenInfo && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Token Details
                                        </h2>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{data.tokenInfo.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Symbol</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{data.tokenInfo.symbol || 'N/A'}</p>
                                        </div>
                                        {data.tokenInfo.decimals !== undefined && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Decimals</p>
                                                <p className="text-base font-medium text-gray-900 dark:text-gray-100">{data.tokenInfo.decimals}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Supply</p>
                                            <p className="text-base font-medium text-gray-900 dark:text-gray-100 truncate" title={data.tokenInfo.totalSupply}>
                                                {data.tokenInfo.totalSupply ?
                                                    (data.tokenInfo.decimals ? (Number(data.tokenInfo.totalSupply) / Math.pow(10, data.tokenInfo.decimals)).toLocaleString() : data.tokenInfo.totalSupply)
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No Contract Selected</h3>
                            <p>Enter an address or select a known contract to begin analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
