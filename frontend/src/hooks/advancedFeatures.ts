// Advanced Features Hooks - All 18 Categories
export { useMultiWallet, MultiWalletProvider } from '../contexts/MultiWalletContext';
export { useTransactionSimulation } from './useTransactionSimulation';
export { useSmartNotifications } from './useSmartNotifications';
export { useAdvancedPortfolio } from './useAdvancedPortfolio';
export { useAIFeatures } from './useAIFeatures';
export { useSocialTrading } from './useSocialTrading';
export { useAdvancedTrading } from './useAdvancedTrading';
export { useInstitutional } from './useInstitutional';
export { useGaslessTransactions } from './useGaslessTransactions';
export { useCrossChain } from './useCrossChain';
export { useDeFiAutomation } from './useDeFiAutomation';
export { useNFTIntegration } from './useNFTIntegration';
export { useUXEnhancements } from './useUXEnhancements';
export { useDataAnalytics } from './useDataAnalytics';
export { useOnboarding } from './useOnboarding';
export { useCustomization } from './useCustomization';
export { usePerformance } from './usePerformance';

// Type exports
export type {
  WalletInfo,
  MultiWalletContextType,
} from '../contexts/MultiWalletContext';

export type {
  SimulationResult,
} from './useTransactionSimulation';

export type {
  NotificationRule,
} from './useSmartNotifications';

export type {
  Transaction,
  TaxReport,
} from './useAdvancedPortfolio';

export type {
  RiskAnalysis,
  Strategy,
} from './useAIFeatures';

export type {
  Trader,
  Strategy as TradingStrategy,
} from './useSocialTrading';

export type {
  LimitOrder,
  DCAConfig,
  GridBot,
  ArbitrageOpportunity,
} from './useAdvancedTrading';

export type {
  TeamMember,
  ComplianceReport,
  APIKey,
} from './useInstitutional';

export type {
  MetaTransaction,
} from './useGaslessTransactions';

export type {
  LiquidityPool,
  YieldOpportunity,
  BridgeRoute,
} from './useCrossChain';

export type {
  AutoCompounder,
  StopLoss,
  LiquidationAlert,
} from './useDeFiAutomation';

export type {
  NFT,
  NFTLoan,
} from './useNFTIntegration';

export type {
  Transaction as TxHistory,
  Favorite,
  DashboardLayout,
} from './useUXEnhancements';

export type {
  CorrelationData,
  WhaleWallet,
  PerformanceMetrics,
} from './useDataAnalytics';

export type {
  TutorialStep,
  GlossaryTerm,
} from './useOnboarding';

export type {
  Theme,
  LayoutPreference,
} from './useCustomization';

export type {
  RPCEndpoint,
} from './usePerformance';
