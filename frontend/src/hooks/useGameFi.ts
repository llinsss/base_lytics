import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

interface Game {
  id: string;
  name: string;
  icon: string;
  category: 'strategy' | 'rpg' | 'puzzle' | 'action';
  players: number;
  rewards: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  unlocked: boolean;
}

export function useGameFi() {
  const { addNotification } = useNotifications();
  const [games] = useState<Game[]>([
    {
      id: '1',
      name: 'DeFi Defender',
      icon: '🛡️',
      category: 'strategy',
      players: 2500,
      rewards: '10-50 BLT',
      difficulty: 'Medium'
    },
    {
      id: '2',
      name: 'Yield Quest',
      icon: '⚔️',
      category: 'rpg',
      players: 1800,
      rewards: '5-25 BLT',
      difficulty: 'Easy'
    },
    {
      id: '3',
      name: 'Liquidity Puzzle',
      icon: '🧩',
      category: 'puzzle',
      players: 950,
      rewards: '15-75 BLT',
      difficulty: 'Hard'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'First Trade',
      description: 'Complete your first token swap',
      icon: '🎯',
      reward: 10,
      unlocked: true
    },
    {
      id: '2',
      name: 'Staking Master',
      description: 'Stake tokens for 30 days',
      icon: '💎',
      reward: 50,
      unlocked: false
    },
    {
      id: '3',
      name: 'NFT Collector',
      description: 'Own 10 NFTs',
      icon: '🖼️',
      reward: 25,
      unlocked: false
    }
  ]);

  const [playerStats] = useState({
    level: 12,
    xp: 2450,
    nextLevelXp: 3000,
    totalRewards: 245,
    gamesPlayed: 18,
    winRate: 67
  });

  const playGame = (gameId: string) => {
    addNotification({ title: 'Launching game...', type: 'info' });
    // Simulate game launch
    setTimeout(() => {
      addNotification({ title: 'Game completed! Rewards earned.', type: 'success' });
    }, 3000);
  };

  return { games, achievements, playerStats, playGame };
}