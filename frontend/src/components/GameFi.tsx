import React, { useState } from 'react';
import { useGameFi } from '../hooks/useGameFi';

export function GameFi() {
  const { games, achievements, playerStats, playGame } = useGameFi();
  const [activeTab, setActiveTab] = useState<'games' | 'achievements' | 'profile'>('games');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">🎮 GameFi Hub</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'games' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Games
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'achievements' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-base-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Profile
          </button>
        </div>
      </div>

      {activeTab === 'games' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="card">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">{game.icon}</div>
                <h3 className="text-lg font-semibold dark:text-white">{game.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{game.category}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Players</span>
                  <span className="dark:text-white">{game.players.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rewards</span>
                  <span className="text-green-600 font-medium">{game.rewards}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty</span>
                  <span className={`font-medium ${
                    game.difficulty === 'Easy' ? 'text-green-600' :
                    game.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => playGame(game.id)}
                className="btn-primary w-full"
              >
                Play Now
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`card ${achievement.unlocked ? 'border-green-500' : 'opacity-60'}`}>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold dark:text-white">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-600 font-medium">+{achievement.reward} BLT</span>
                    {achievement.unlocked && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200">
                        Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Player Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Level</span>
                <span className="text-2xl font-bold text-base-600">{playerStats.level}</span>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                  <span className="dark:text-white">{playerStats.xp} / {playerStats.nextLevelXp}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-base-600 h-2 rounded-full"
                    style={{ width: `${(playerStats.xp / playerStats.nextLevelXp) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Rewards</span>
                <span className="font-semibold text-green-600">{playerStats.totalRewards} BLT</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Games Played</span>
                <span className="font-semibold dark:text-white">{playerStats.gamesPlayed}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                <span className="font-semibold dark:text-white">{playerStats.winRate}%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-medium dark:text-white">Won DeFi Defender</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">+25 BLT earned</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-medium dark:text-white">Achievement Unlocked</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">First Trade completed</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="text-2xl">⚔️</span>
                <div>
                  <div className="font-medium dark:text-white">Completed Yield Quest</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">+15 BLT earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}