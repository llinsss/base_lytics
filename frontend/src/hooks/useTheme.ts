import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export function useTheme() {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  return settings.theme;
}