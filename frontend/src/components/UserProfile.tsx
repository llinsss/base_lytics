import React, { useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';

export function UserProfile() {
  const { profile, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || '');

  if (!profile) return null;

  const handleSave = () => {
    updateProfile({ username });
    setIsEditing(false);
  };

  const progressToNextLevel = ((profile.xp % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-base-500 to-base-700 rounded-full flex items-center justify-center text-2xl text-white">
            {profile.username ? profile.username[0].toUpperCase() : '👤'}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button onClick={handleSave} className="btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold dark:text-white">
                    {profile.username || 'Anonymous Trader'}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✏️
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                  {profile.address.slice(0, 8)}...{profile.address.slice(-6)}
                </p>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-base-600">Level {profile.level}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{profile.xp} XP</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="dark:text-white">Progress to Level {profile.level + 1}</span>
            <span className="dark:text-white">{profile.xp % 1000}/1000 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-base-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">{profile.totalTrades}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">${profile.totalVolume.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">{profile.winRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold dark:text-white">
              {profile.achievements.filter(a => a.unlocked).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">🏆 Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-medium dark:text-white">{achievement.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </div>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-xs text-green-600 mt-1">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}