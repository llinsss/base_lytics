import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    'wallet.connect': 'Connect Wallet',
    'wallet.disconnect': 'Disconnect',
    'wallet.connected': 'Connected',
    'dashboard.title': 'Dashboard',
    'analytics.title': 'Analytics',
    'defi.title': 'DeFi Hub',
    'governance.title': 'DAO Governance',
    'marketplace.title': 'NFT Marketplace',
    'advanced.title': 'Advanced Features'
  },
  es: {
    'wallet.connect': 'Conectar Billetera',
    'wallet.disconnect': 'Desconectar',
    'wallet.connected': 'Conectado',
    'dashboard.title': 'Panel de Control',
    'analytics.title': 'Análisis',
    'defi.title': 'Centro DeFi',
    'governance.title': 'Gobernanza DAO',
    'marketplace.title': 'Mercado NFT',
    'advanced.title': 'Funciones Avanzadas'
  },
  zh: {
    'wallet.connect': '连接钱包',
    'wallet.disconnect': '断开连接',
    'wallet.connected': '已连接',
    'dashboard.title': '仪表板',
    'analytics.title': '分析',
    'defi.title': 'DeFi中心',
    'governance.title': 'DAO治理',
    'marketplace.title': 'NFT市场',
    'advanced.title': '高级功能'
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}