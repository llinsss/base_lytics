import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
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
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-base-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BL</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">BaseLytics</h1>
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