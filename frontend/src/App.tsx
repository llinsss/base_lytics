import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Activity } from './pages/Activity';
import { Status } from './pages/Status';
import { Settings } from './pages/Settings';
import { DeFi } from './pages/DeFi';
import { Governance } from './pages/Governance';
import { Marketplace } from './pages/Marketplace';
import { Advanced } from './pages/Advanced';
import { WalletConnect } from './components/WalletConnect';
import { NetworkSwitcher } from './components/NetworkSwitcher';
import { ThemeToggle } from './components/ThemeToggle';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TransactionStatus } from './components/TransactionStatus';
import { VoiceControl } from './components/VoiceControl';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { NotificationContainer } from './components/notifications/NotificationContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { loadDeploymentAddresses } from './utils/loadDeployments';

// Wagmi configuration
const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'your-project-id', // Replace with your WalletConnect project ID
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
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
            <nav className="flex gap-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/analytics"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/analytics'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Analytics
              </Link>
              <Link
                to="/activity"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/activity'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Activity
              </Link>
              <Link
                to="/status"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/status'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Status
              </Link>
              <Link
                to="/defi"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/defi'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                DeFi
              </Link>
              <Link
                to="/governance"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/governance'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Governance
              </Link>
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/marketplace'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Marketplace
              </Link>
              <Link
                to="/advanced"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/advanced'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Advanced
              </Link>
              <Link
                to="/settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/settings'
                  ? 'bg-base-100 text-base-700 dark:bg-base-600 dark:text-white'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                  }`}
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NetworkSwitcher />
            <WalletConnect />
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
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-black">
                  <Header />
                  <main>
                    <ErrorBoundary>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/defi" element={<DeFi />} />
                        <Route path="/governance" element={<Governance />} />
                        <Route path="/marketplace" element={<Marketplace />} />
                        <Route path="/advanced" element={<Advanced />} />
                        <Route path="/activity" element={<Activity />} />
                        <Route path="/status" element={<Status />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <NotificationContainer />
                  <ConnectionStatus />
                  <TransactionStatus />
                  <VoiceControl />
                </div>
              </Router>
            </NotificationProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;