import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function ThemeToggle() {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {settings.theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}