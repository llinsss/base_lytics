import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useNotifications } from '../contexts/NotificationContext';

export function Settings() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { addNotification } = useNotifications();

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    addNotification({
      type: 'success',
      title: 'Theme Updated',
      message: `Switched to ${theme} mode`,
      duration: 3000
    });
  };

  const handleNotificationToggle = (key: keyof typeof settings.notifications, value: boolean | number) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const handleAnalyticsToggle = (key: keyof typeof settings.analytics, value: boolean | number) => {
    updateSettings({
      analytics: {
        ...settings.analytics,
        [key]: value
      }
    });
  };

  const handleDisplayChange = (key: keyof typeof settings.display, value: string | number) => {
    updateSettings({
      display: {
        ...settings.display,
        [key]: value
      }
    });
  };

  const handleReset = () => {
    resetSettings();
    addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'All settings have been reset to defaults',
      duration: 3000
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Customize your BaseLytics experience</p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-4 py-2 rounded-lg border ${
                    settings.theme === 'light'
                      ? 'bg-base-600 text-white border-base-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-4 py-2 rounded-lg border ${
                    settings.theme === 'dark'
                      ? 'bg-base-600 text-white border-base-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable Notifications</label>
                <p className="text-xs text-gray-500">Show toast notifications for transactions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => handleNotificationToggle('enabled', e.target.checked)}
                className="h-4 w-4 text-base-600 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Sound Effects</label>
                <p className="text-xs text-gray-500">Play sounds for notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.sound}
                onChange={(e) => handleNotificationToggle('sound', e.target.checked)}
                className="h-4 w-4 text-base-600 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Auto-dismiss Duration: {settings.notifications.duration / 1000}s
              </label>
              <input
                type="range"
                min="3000"
                max="10000"
                step="1000"
                value={settings.notifications.duration}
                onChange={(e) => handleNotificationToggle('duration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Auto Refresh</label>
                <p className="text-xs text-gray-500">Automatically refresh analytics data</p>
              </div>
              <input
                type="checkbox"
                checked={settings.analytics.autoRefresh}
                onChange={(e) => handleAnalyticsToggle('autoRefresh', e.target.checked)}
                className="h-4 w-4 text-base-600 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh Interval: {settings.analytics.refreshInterval / 1000}s
              </label>
              <input
                type="range"
                min="10000"
                max="60000"
                step="5000"
                value={settings.analytics.refreshInterval}
                onChange={(e) => handleAnalyticsToggle('refreshInterval', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Display</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Currency Display</label>
              <select
                value={settings.display.currency}
                onChange={(e) => handleDisplayChange('currency', e.target.value)}
                className="input-field"
              >
                <option value="ETH">ETH</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Decimal Places: {settings.display.decimals}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={settings.display.decimals}
                onChange={(e) => handleDisplayChange('decimals', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Reset</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset All Settings</p>
              <p className="text-xs text-gray-500">Restore all settings to default values</p>
            </div>
            <button
              onClick={handleReset}
              className="btn-secondary text-red-600 hover:bg-red-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}