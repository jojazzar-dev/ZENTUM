
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, Logo, INITIAL_FOREX_DATA, INITIAL_CRYPTO_DATA } from '../constants';
import TradingChart from '../components/TradingChart';
import { User } from '../types';

interface HomeProps {
  user: User | null;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleDownload = (platform: string) => {
    alert(`Downloading ZENTUM App for ${platform}... The installer will begin shortly.`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-14 h-14" />
          <span className="text-3xl font-bold tracking-tighter text-white">{APP_NAME}</span>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 hidden md:block">Welcome, {user.email}</span>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 rounded-full border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
                >
                  Admin
                </button>
              )}
              <button 
                onClick={onLogout}
                className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white font-semibold hover:opacity-90 transition-all shadow-lg"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 leading-tight">
            The Future of Trading <br /> Is Stealth.
          </h1>
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-yellow-500 text-lg md:text-xl font-medium uppercase tracking-widest animate-pulse">
              No KYC • No Verification • Unlimited Leverage
            </p>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed italic">
              "Trade in stealth without the need for any verification or complications, with unlimited leverage and instant deposit/withdrawal volume without any ceiling."
            </p>
            <p className="text-gray-500 text-md">
              Experience lightning-fast execution on Forex and Global Crypto markets with the most advanced interface ever built.
            </p>
          </div>
        </div>

        {/* Main Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Forex Card */}
          <div 
            onClick={() => navigate('/forex')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 cursor-pointer hover:border-blue-500/50 transition-all transform hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <div className="w-24 h-24 text-blue-500">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 flex items-center gap-3">
              Forex <span className="text-blue-500 text-lg uppercase tracking-widest">Global</span>
            </h2>
            <p className="text-gray-400 mb-6">Trade 30+ currency pairs with low spreads and high leverage.</p>
            <div className="h-40 mb-6 opacity-60">
              <TradingChart color="#2962ff" dataCount={15} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {INITIAL_FOREX_DATA.slice(0, 3).map(f => (
                  <div key={f.symbol} className="w-10 h-10 rounded-full bg-blue-900 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                    {f.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-blue-400 font-medium group-hover:translate-x-2 transition-transform">Start Trading &rarr;</span>
            </div>
          </div>

          {/* Crypto Card */}
          <div 
            onClick={() => navigate('/crypto')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 cursor-pointer hover:border-yellow-500/50 transition-all transform hover:-translate-y-2"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <div className="w-24 h-24 text-yellow-500">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 flex items-center gap-3">
              Crypto <span className="text-yellow-500 text-lg uppercase tracking-widest">Digital</span>
            </h2>
            <p className="text-gray-400 mb-6">Buy and sell leading digital assets with deep liquidity.</p>
            <div className="h-40 mb-6 opacity-60">
              <TradingChart color="#f3ba2f" dataCount={15} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {INITIAL_CRYPTO_DATA.slice(0, 3).map(c => (
                  <div key={c.symbol} className="w-10 h-10 rounded-full bg-yellow-900 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">
                    {c.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-yellow-400 font-medium group-hover:translate-x-2 transition-transform">Exchange Now &rarr;</span>
            </div>
          </div>
        </div>

        {/* Mobile App Downloads */}
        <div className="mt-20 w-full text-center py-12 border-t border-white/5">
          <h3 className="text-2xl font-semibold mb-8">Take ZENTUM with you</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => handleDownload('Android')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm-11.046 0c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm11.42-3.805l1.967-3.407a.5.5 0 10-.866-.5l-1.996 3.457A9.957 9.957 0 0012 10a9.957 9.957 0 00-7.002 1.086l-1.996-3.457a.5.5 0 10-.866.5l1.967 3.407A9.976 9.976 0 002 18h20a9.976 9.976 0 00-4.103-6.464z"/></svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download for</div>
                <div className="font-bold">Android (APK)</div>
              </div>
            </button>
            <button 
              onClick={() => handleDownload('iOS')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download for</div>
                <div className="font-bold">iOS (iPhone)</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-600 text-sm border-t border-white/5">
        &copy; 2024 {APP_NAME} GLOBAL LTD. All rights reserved. Stealth Trading enabled.
      </footer>
    </div>
  );
};

export default Home;
