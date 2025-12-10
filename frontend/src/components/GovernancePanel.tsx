import React, { useState } from 'react';
import { useGovernance } from '../hooks/useGovernance';

export function GovernancePanel() {
  const { proposals, vote, createProposal, isPending } = useGovernance();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreateProposal = () => {
    if (newTitle && newDescription) {
      createProposal(newTitle, newDescription);
      setNewTitle('');
      setNewDescription('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">🏛️ DAO Governance</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          Create Proposal
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Create New Proposal</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Proposal title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <textarea
              placeholder="Proposal description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateProposal}
                disabled={isPending || !newTitle || !newDescription}
                className="btn-primary"
              >
                Submit Proposal
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">{proposal.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{proposal.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                proposal.status === 'Passed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {proposal.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">For: {proposal.votesFor}</span>
                <span className="text-red-600">Against: {proposal.votesAgainst}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` 
                  }}
                />
              </div>

              {proposal.status === 'Active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => vote(proposal.id, true)}
                    disabled={isPending}
                    className="btn-primary flex-1"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => vote(proposal.id, false)}
                    disabled={isPending}
                    className="btn-secondary flex-1"
                  >
                    Vote Against
                  </button>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Ends: {proposal.endTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}