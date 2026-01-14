import { useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

interface LayoutPreference {
  sidebar: 'left' | 'right' | 'hidden';
  density: 'compact' | 'comfortable' | 'spacious';
  chartType: 'line' | 'candle' | 'area';
}

export function useCustomization() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('baselytics_theme');
    return saved ? JSON.parse(saved) : themes[0];
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('baselytics_language') || 'en';
  });

  const [layoutPrefs, setLayoutPrefs] = useState<LayoutPreference>(() => {
    const saved = localStorage.getItem('baselytics_layout_prefs');
    return saved ? JSON.parse(saved) : {
      sidebar: 'left',
      density: 'comfortable',
      chartType: 'line',
    };
  });

  const themes: Theme[] = [
    {
      id: 'base-dark',
      name: 'Base Dark',
      colors: {
        primary: '#0052FF',
        secondary: '#00D4FF',
        background: '#000000',
        surface: '#111111',
        text: '#FFFFFF',
        accent: '#FF6B00',
      },
    },
    {
      id: 'base-light',
      name: 'Base Light',
      colors: {
        primary: '#0052FF',
        secondary: '#00D4FF',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        accent: '#FF6B00',
      },
    },
    {
      id: 'ocean',
      name: 'Ocean',
      colors: {
        primary: '#006994',
        secondary: '#00B4D8',
        background: '#001219',
        surface: '#003049',
        text: '#FFFFFF',
        accent: '#F77F00',
      },
    },
    {
      id: 'forest',
      name: 'Forest',
      colors: {
        primary: '#2D6A4F',
        secondary: '#52B788',
        background: '#081C15',
        surface: '#1B4332',
        text: '#FFFFFF',
        accent: '#95D5B2',
      },
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: {
        primary: '#E63946',
        secondary: '#F77F00',
        background: '#1D3557',
        surface: '#457B9D',
        text: '#F1FAEE',
        accent: '#FCBF49',
      },
    },
  ];

  const translations: Record<string, Record<string, string>> = {
    en: {
      'wallet.connect': 'Connect Wallet',
      'wallet.disconnect': 'Disconnect',
      'swap.title': 'Swap Tokens',
      'stake.title': 'Stake & Earn',
    },
    es: {
      'wallet.connect': 'Conectar Billetera',
      'wallet.disconnect': 'Desconectar',
      'swap.title': 'Intercambiar Tokens',
      'stake.title': 'Apostar y Ganar',
    },
    zh: {
      'wallet.connect': '连接钱包',
      'wallet.disconnect': '断开连接',
      'swap.title': '交换代币',
      'stake.title': '质押赚取',
    },
    ja: {
      'wallet.connect': 'ウォレット接続',
      'wallet.disconnect': '切断',
      'swap.title': 'トークン交換',
      'stake.title': 'ステーキング',
    },
  };

  useEffect(() => {
    localStorage.setItem('baselytics_theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('baselytics_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('baselytics_layout_prefs', JSON.stringify(layoutPrefs));
  }, [layoutPrefs]);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const changeTheme = (themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId);
    if (newTheme) setTheme(newTheme);
  };

  const createCustomTheme = (colors: Theme['colors']): Theme => {
    const customTheme: Theme = {
      id: 'custom-' + Date.now(),
      name: 'Custom Theme',
      colors,
    };
    return customTheme;
  };

  const translate = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
  };

  const updateLayoutPrefs = (prefs: Partial<LayoutPreference>) => {
    setLayoutPrefs(prev => ({ ...prev, ...prefs }));
  };

  return {
    theme,
    themes,
    language,
    layoutPrefs,
    changeTheme,
    createCustomTheme,
    translate,
    changeLanguage,
    updateLayoutPrefs,
  };
}
