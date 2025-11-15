import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface UserSettings {
  theme: Theme;
  notifications: {
    enabled: boolean;
    sound: boolean;
    duration: number;
  };
  analytics: {
    autoRefresh: boolean;
    refreshInterval: number;
  };
  display: {
    currency: 'ETH' | 'USD';
    decimals: number;
  };
}

const defaultSettings: UserSettings = {
  theme: 'light',
  notifications: {
    enabled: true,
    sound: false,
    duration: 5000,
  },
  analytics: {
    autoRefresh: true,
    refreshInterval: 30000,
  },
  display: {
    currency: 'ETH',
    decimals: 4,
  },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on mount
    const savedSettings = localStorage.getItem('baselytics-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('baselytics-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('baselytics-settings', JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}