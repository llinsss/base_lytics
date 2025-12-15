import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { useNotifications } from '../contexts/NotificationContext';

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Passed' | 'Failed';
  endTime: Date;
}

export function useGovernance() {
  const { addNotification } = useNotifications();
  const { writeContract, isPending } = useWriteContract();

  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'Increase Staking Rewards',
      description: 'Proposal to increase staking APY from 12% to 15%',
      votesFor: 1250,
      votesAgainst: 340,
      status: 'Active',
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: 'Add New Token Pair',
      description: 'Add USDC/BLT trading pair to the DEX',
      votesFor: 890,
      votesAgainst: 120,
      status: 'Active',
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  const vote = async (proposalId: number, support: boolean) => {
    try {
      addNotification({ title: 'Submitting vote...', type: 'info' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      addNotification({ title: `Vote ${support ? 'for' : 'against'} submitted!`, type: 'success' });
    } catch (error) {
      addNotification({ title: 'Vote failed', type: 'error' });
    }
  };

  const createProposal = async (title: string, description: string) => {
    try {
      addNotification({ title: 'Creating proposal...', type: 'info' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      addNotification({ title: 'Proposal created successfully!', type: 'success' });
    } catch (error) {
      addNotification({ title: 'Failed to create proposal', type: 'error' });
    }
  };

  return { proposals, vote, createProposal, isPending };
}