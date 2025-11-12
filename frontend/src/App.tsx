import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Status } from './pages/Status';
import { Activity } from './pages/Activity';
import { WalletConnect } from './components/WalletConnect';

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
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-base-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BL</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">BaseLytics</h1>
            </Link>
            <nav className="flex gap-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-base-100 text-base-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/activity" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/activity' 
                    ? 'bg-base-100 text-base-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Activity
              </Link>
              <Link 
                to="/status" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/status' 
                    ? 'bg-base-100 text-base-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Status
              </Link>
            </nav>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 BaseLytics. Built on Base Network.</p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <a href="#" className="hover:text-base-600">Documentation</a>
            <a href="#" className="hover:text-base-600">GitHub</a>
            <a href="#" className="hover:text-base-600">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/status" element={<Status />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;