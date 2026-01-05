import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserProfile {
  address: string;
  username?: string;
  avatar?: string;
  level: number;
  xp: number;
  totalTrades: number;
  totalVolume: number;
  winRate: number;
  achievements: Achievement[];
  joinedAt: Date;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  unlockAchievement: (achievementId: string) => void;
  addXP: (amount: number) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (address && !profile) {
      const savedProfile = localStorage.getItem(`profile_${address}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        const newProfile: UserProfile = {
          address,
          level: 1,
          xp: 0,
          totalTrades: 0,
          totalVolume: 0,
          winRate: 0,
          achievements: [
            { id: 'first_connect', name: 'First Connection', description: 'Connected wallet for the first time', icon: '🔗', unlocked: true, unlockedAt: new Date() },
            { id: 'first_trade', name: 'First Trade', description: 'Complete your first trade', icon: '💱', unlocked: false },
            { id: 'hodler', name: 'Diamond Hands', description: 'Hold tokens for 30 days', icon: '💎', unlocked: false },
            { id: 'whale', name: 'Whale Status', description: 'Trade over $10,000 volume', icon: '🐋', unlocked: false }
          ],
          joinedAt: new Date()
        };
        setProfile(newProfile);
        localStorage.setItem(`profile_${address}`, JSON.stringify(newProfile));
      }
    }
  }, [address, profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem(`profile_${profile.address}`, JSON.stringify(updatedProfile));
    }
  };

  const unlockAchievement = (achievementId: string) => {
    if (profile) {
      const updatedAchievements = profile.achievements.map(achievement =>
        achievement.id === achievementId && !achievement.unlocked
          ? { ...achievement, unlocked: true, unlockedAt: new Date() }
          : achievement
      );
      updateProfile({ achievements: updatedAchievements });
    }
  };

  const addXP = (amount: number) => {
    if (profile) {
      const newXP = profile.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;
      updateProfile({ xp: newXP, level: newLevel });
    }
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile, unlockAchievement, addXP }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}