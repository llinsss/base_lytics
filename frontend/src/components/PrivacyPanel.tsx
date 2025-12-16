import React, { useState } from 'react';
import { useZKPrivacy } from '../hooks/useZKPrivacy';
import { useAccountAbstraction } from '../hooks/useAccountAbstraction';

export function PrivacyPanel() {
  const { isPrivateMode, zkProofs, generateZKProof, togglePrivateMode } = useZKPrivacy();
  const { gaslessEnabled, setGaslessEnabled, socialRecovery, executeGaslessTransaction, initiateSocialRecovery } = useAccountAbstraction();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handlePrivateTransfer = () => {
    if (amount && recipient) {
      generateZKProof(amount, recipient);
      setAmount('');
      setRecipient('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">🔒 Privacy & Security</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Zero-Knowledge Privacy</h3>
          
          <div className="flex items-center justify-between mb-4">
            <span className="dark:text-white">Private Mode</span>
            <button
              onClick={togglePrivateMode}
              className={`w-12 h-6 rounded-full ${isPrivateMode ? 'bg-green-500' : 'bg-gray-300'} relative transition-colors`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isPrivateMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {isPrivateMode && (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={handlePrivateTransfer}
                className="btn-primary w-full"
              >
                Send Private Transaction
              </button>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-medium mb-2 dark:text-white">Recent Private Transactions</h4>
            {zkProofs.length === 0 ? (
              <p className="text-gray-500 text-sm">No private transactions yet</p>
            ) : (
              <div className="space-y-2">
                {zkProofs.slice(0, 3).map((proof) => (
                  <div key={proof.id} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="dark:text-white">Private Transfer</span>
                    <span className="text-green-600">✓ Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Account Abstraction</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="dark:text-white">Gasless Transactions</span>
              <button
                onClick={() => setGaslessEnabled(!gaslessEnabled)}
                className={`w-12 h-6 rounded-full ${gaslessEnabled ? 'bg-green-500' : 'bg-gray-300'} relative transition-colors`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${gaslessEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Social Recovery</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p>Guardians: {socialRecovery.guardians.length}</p>
                <p>Threshold: {socialRecovery.threshold}/{socialRecovery.guardians.length}</p>
              </div>
              <button
                onClick={initiateSocialRecovery}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Test Recovery
              </button>
            </div>

            <button
              onClick={() => executeGaslessTransaction({})}
              className="btn-primary w-full"
              disabled={!gaslessEnabled}
            >
              Execute Gasless Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}