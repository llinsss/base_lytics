import { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  action?: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
}

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>(() => {
    const saved = localStorage.getItem('baselytics_tutorials_completed');
    return saved ? JSON.parse(saved) : [];
  });
  const [showTutorial, setShowTutorial] = useState(false);

  const tutorials: Record<string, TutorialStep[]> = {
    'first-time': [
      {
        id: 'welcome',
        title: 'Welcome to BaseLytics',
        description: 'Your all-in-one DeFi super-app for Base network',
        target: 'body',
      },
      {
        id: 'connect-wallet',
        title: 'Connect Your Wallet',
        description: 'Click here to connect MetaMask or Coinbase Wallet',
        target: '[data-tutorial="wallet-connect"]',
        action: 'click',
      },
      {
        id: 'explore-features',
        title: 'Explore Features',
        description: 'Navigate through trading, staking, and analytics',
        target: '[data-tutorial="nav-menu"]',
      },
    ],
    'trading': [
      {
        id: 'swap-intro',
        title: 'Token Swapping',
        description: 'Learn how to swap tokens with best prices',
        target: '[data-tutorial="swap-form"]',
      },
      {
        id: 'limit-orders',
        title: 'Limit Orders',
        description: 'Set price targets for automatic execution',
        target: '[data-tutorial="limit-orders"]',
      },
    ],
  };

  const glossary: GlossaryTerm[] = [
    {
      term: 'APY',
      definition: 'Annual Percentage Yield - The rate of return earned on an investment over a year',
      category: 'DeFi',
      relatedTerms: ['APR', 'Yield Farming'],
    },
    {
      term: 'Slippage',
      definition: 'The difference between expected and actual trade execution price',
      category: 'Trading',
      relatedTerms: ['DEX', 'Liquidity'],
    },
    {
      term: 'Gas',
      definition: 'Transaction fee paid to execute operations on the blockchain',
      category: 'Blockchain',
      relatedTerms: ['Wei', 'Gwei'],
    },
  ];

  useEffect(() => {
    localStorage.setItem('baselytics_tutorials_completed', JSON.stringify(completed));
  }, [completed]);

  const startTutorial = (tutorialId: string) => {
    setCurrentStep(0);
    setShowTutorial(true);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const completeTutorial = (tutorialId: string) => {
    setCompleted(prev => [...prev, tutorialId]);
    setShowTutorial(false);
  };

  const skipTutorial = () => {
    setShowTutorial(false);
  };

  const searchGlossary = (query: string): GlossaryTerm[] => {
    return glossary.filter(term =>
      term.term.toLowerCase().includes(query.toLowerCase()) ||
      term.definition.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getRiskWarning = (action: string): string => {
    const warnings: Record<string, string> = {
      'swap': 'Always verify token addresses. Beware of scam tokens.',
      'stake': 'Staked tokens are locked. Understand unlock periods.',
      'lend': 'Lending carries smart contract risk. Only use audited protocols.',
      'leverage': 'Leveraged positions can be liquidated. Use stop losses.',
    };
    return warnings[action] || 'Always do your own research (DYOR).';
  };

  return {
    tutorials,
    glossary,
    currentStep,
    completed,
    showTutorial,
    startTutorial,
    nextStep,
    completeTutorial,
    skipTutorial,
    searchGlossary,
    getRiskWarning,
  };
}
