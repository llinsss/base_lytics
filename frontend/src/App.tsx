import React, { Suspense } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { baseSepolia, base, celo } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Analytics,
  Activity,
  Status,
  Settings,
  DeFi,
  Governance,
  Marketplace,
  Advanced,
} from './hooks/useLazyRoutes';
import { ContractActivity } from './pages/ContractActivity';
import { Tools } from './pages/Tools';
import { ChartSkeleton } from './components/LoadingSkeleton';
import { WalletConnect } from './components/WalletConnect';
import { NetworkSwitcher } from './components/NetworkSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TransactionStatus } from './components/TransactionStatus';
import { VoiceControl } from './components/VoiceControl';
import { MobileNav } from './components/MobileNav';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { NotificationContainer } from './components/notifications/NotificationContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { loadDeploymentAddresses } from './utils/loadDeployments';
import { useMiniPay } from './hooks/useMiniPay';

// Wagmi configuration
const config = createConfig({
  chains: [baseSepolia, base, celo],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'your-project-id', // Replace with your WalletConnect project ID
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [celo.id]: http('https://forno.celo.org'),
  },
});

const queryClient = new QueryClient();

function Header() {
  const location = useLocation();
  useTheme(); // Apply theme changes

  return (
    <header className="bg-white shadow-sm border-b dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-base-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BL</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">BaseLytics</h1>
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/' ? 'page' : undefined}
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/analytics'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/analytics' ? 'page' : undefined}
              >
                Analytics
              </Link>
              <Link
                to="/activity"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/activity'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/activity' ? 'page' : undefined}
              >
                Activity
              </Link>
              <Link
                to="/status"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/status'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/status' ? 'page' : undefined}
              >
                Status
              </Link>
              <Link
                to="/defi"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/defi'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/defi' ? 'page' : undefined}
              >
                DeFi
              </Link>
              <Link
                to="/governance"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/governance'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/governance' ? 'page' : undefined}
              >
                Governance
              </Link>
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/marketplace'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/marketplace' ? 'page' : undefined}
              >
                Marketplace
              </Link>
              <Link
                to="/advanced"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/advanced'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/advanced' ? 'page' : undefined}
              >
                Advanced
              </Link>
              <Link
                to="/contracts"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/contracts'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/contracts' ? 'page' : undefined}
              >
                Contracts
              </Link>
              <Link
                to="/tools"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/tools'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/tools' ? 'page' : undefined}
              >
                Tools
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
                aria-current={location.pathname === '/settings' ? 'page' : undefined}
              >
                Settings
              </Link>
            </nav>
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NetworkSwitcher />
            <div className="hidden md:block">
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 BaseLytics. Built on Base Network.</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <a href="#" className="hover:text-base-600 dark:hover:text-base-400">Documentation</a>
            <a href="#" className="hover:text-base-600 dark:hover:text-base-400">GitHub</a>
            <a href="#" className="hover:text-base-600 dark:hover:text-base-400">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function MiniPayInit() {
  useMiniPay();
  return null;
}

function App() {
  // Load contract addresses on app start
  React.useEffect(() => {
    loadDeploymentAddresses();
  }, []);

  return (
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <NotificationProvider>
              <UserProfileProvider>
                <MiniPayInit />
                <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-black">
                  <Header />
                  {/* Skip to main content link for accessibility */}
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-base-600 focus:text-white focus:rounded-lg"
                  >
                    Skip to main content
                  </a>
                  <main id="main-content" tabIndex={-1}>
                    <ErrorBoundary>
                      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><ChartSkeleton /></div>}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/defi" element={<DeFi />} />
                          <Route path="/governance" element={<Governance />} />
                          <Route path="/marketplace" element={<Marketplace />} />
                          <Route path="/advanced" element={<Advanced />} />
                          <Route path="/activity" element={<Activity />} />
                          <Route path="/status" element={<Status />} />
                          <Route path="/contracts" element={<ContractActivity />} />
                          <Route path="/tools" element={<Tools />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <NotificationContainer />
                  <ConnectionStatus />
                  <TransactionStatus />
                  <VoiceControl />
                </div>
                </Router>
              </UserProfileProvider>
            </NotificationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;