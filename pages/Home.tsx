import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, INITIAL_FOREX_DATA, INITIAL_CRYPTO_DATA } from '../constants';
import Logo from '../components/Logo'; 
import TradingChart from '../components/TradingChart';
import { User } from '../types';

/**
 * ZENTUM HOME INTERFACE - ULTIMATE EDITION
 * ---------------------------------------
 * - Full PWA Installer Logic
 * - Mobile Portrait & Landscape Optimized
 * - No features or logic removed
 */

interface HomeProps {
  user: User | null;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // --- [1] حالات تثبيت التطبيق (PWA Installer Logic) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // التقاط حدث طلب التثبيت من المتصفح
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    } else {
      // دليل يدوي لمستخدمي آيفون أو في حال عدم دعم المتصفح
      alert("ZENTUM INSTALLATION: \n\nOn iPhone: Tap 'Share' then 'Add to Home Screen'. \nOn Android: Use the browser menu to 'Install App'.");
    }
  };

  const handleDownload = (platform: string) => {
    alert(`Initializing ZENTUM ${platform} Core Download... The encrypted installer will begin shortly.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* --- [A] NAVBAR: RESPONSIVE HEADER --- */}
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/5 bg-[#181a20]/80 backdrop-blur-xl sticky top-0 z-[100] shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-80 transition-all" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Logo className="w-10 h-10 md:w-16 md:h-16" />
          <div className="flex flex-col">
            <span className="text-xl md:text-3xl font-black tracking-tighter uppercase italic leading-none">{APP_NAME}</span>
            <span className="text-[7px] md:text-[9px] text-yellow-500 font-bold uppercase tracking-[0.3em] mt-1">Trading Terminal</span>
          </div>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              {/* إظهار الإيميل فقط في الشاشات الكبيرة لتوفير مساحة الموبايل */}
              <span className="text-gray-500 hidden lg:block text-[11px] font-bold uppercase tracking-widest border-r border-white/10 pr-4 italic">
                Authorized: {user.email}
              </span>
              
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="px-4 md:px-6 py-2 rounded-xl bg-yellow-600/10 border border-yellow-500/30 text-yellow-500 text-[10px] md:text-xs font-black uppercase hover:bg-yellow-600 hover:text-black transition-all shadow-lg"
                >
                  Admin
                </button>
              )}
              
              <button 
                onClick={onLogout}
                className="px-4 md:px-6 py-2 rounded-xl border border-white/10 text-gray-400 text-[10px] md:text-xs font-black uppercase hover:bg-white/5 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-6 md:px-12 py-3 rounded-full bg-yellow-600 text-black font-black text-[11px] md:text-xs uppercase tracking-widest shadow-xl shadow-yellow-900/20 active:scale-95 transition-all"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* --- [B] HERO SECTION: OPTIMIZED FOR PORTRAIT --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-32 flex flex-col items-center">
        
        <div className="text-center mb-16 md:mb-32 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-700 leading-[1.1] uppercase italic tracking-tighter shadow-sm">
            The Future <br className="hidden md:block" /> Of Trading <br /> Is Stealth.
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-10">
            <p className="text-yellow-500 text-xs md:text-2xl font-black uppercase tracking-[0.4em] animate-pulse">
              No KYC • No Verification • 1:5000 Leverage
            </p>
            
            <p className="text-gray-300 text-base md:text-2xl leading-relaxed italic font-medium opacity-90 border-l-2 border-yellow-500/30 pl-4 md:pl-0 border-none">
              "Trade in stealth without the need for any verification or complications, 
              with unlimited leverage and instant deposit/withdrawal volume without any ceiling."
            </p>
            
            <p className="text-gray-500 text-xs md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Experience lightning-fast execution on Forex and Global Crypto markets 
              with the most advanced interface ever built for the modern trader.
            </p>

            {/* PWA INSTALLER BUTTON - PRO VERSION */}
            {showInstallBtn && (
              <button 
                onClick={handleInstallApp}
                className="mt-8 px-10 md:px-16 py-5 md:py-6 bg-white text-black rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.3em] shadow-2xl flex items-center gap-4 mx-auto animate-bounce hover:scale-105 transition-all border-[4px] md:border-[6px] border-black"
              >
                <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Install Terminal App
              </button>
            )}
          </div>
        </div>

        {/* --- [C] SELECTION CARDS: GRID STACKING --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full mb-32">
          
          {/* Forex Card */}
          <div 
            onClick={() => navigate('/forex')}
            className="group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 md:p-16 cursor-pointer hover:border-blue-500/50 transition-all transform hover:-translate-y-3 shadow-2xl"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] group-hover:bg-blue-600/10 transition-all duration-700"></div>
            
            <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 uppercase italic tracking-tighter text-white">
              Forex <span className="text-blue-500 text-[10px] md:text-xs tracking-[0.5em] not-italic ml-2 uppercase font-bold opacity-60">Global Feed</span>
            </h2>
            <p className="text-gray-500 mb-10 font-medium text-sm md:text-lg leading-relaxed max-w-sm">
              Trade 50+ major and exotic currency pairs with institutional liquidity and ultra-tight spreads.
            </p>
            
            <div className="h-32 md:h-40 mb-10 opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105">
              <TradingChart color="#2962ff" dataCount={20} />
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-6 md:pt-8">
              <div className="flex -space-x-3 md:-space-x-4">
                {INITIAL_FOREX_DATA.slice(0, 3).map(f => (
                  <div key={f.symbol} className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-950 border-2 border-blue-500/30 flex items-center justify-center text-[7px] md:text-[10px] font-black tracking-tighter shadow-xl">
                    {f.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-blue-500 font-black uppercase text-[9px] md:text-[11px] tracking-[0.3em] group-hover:translate-x-3 transition-transform flex items-center gap-2">
                Launch Terminal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>

          {/* Crypto Card */}
          <div 
            onClick={() => navigate('/crypto')}
            className="group relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 md:p-16 cursor-pointer hover:border-yellow-500/50 transition-all transform hover:-translate-y-3 shadow-2xl"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-600/5 rounded-full blur-[80px] group-hover:bg-yellow-600/10 transition-all duration-700"></div>
            
            <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 uppercase italic tracking-tighter text-white">
              Crypto <span className="text-yellow-500 text-[10px] md:text-xs tracking-[0.5em] not-italic ml-2 uppercase font-bold opacity-60">Digital Pool</span>
            </h2>
            <p className="text-gray-500 mb-10 font-medium text-sm md:text-lg leading-relaxed max-w-sm">
              Instant settlement on leading digital assets with massive depth and anonymous liquidity pools.
            </p>
            
            <div className="h-32 md:h-40 mb-10 opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105">
              <TradingChart color="#f3ba2f" dataCount={20} />
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-6 md:pt-8">
              <div className="flex -space-x-3 md:-space-x-4">
                {INITIAL_CRYPTO_DATA.slice(0, 3).map(c => (
                  <div key={c.symbol} className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-yellow-950 border-2 border-yellow-500/30 flex items-center justify-center text-[7px] md:text-[10px] font-black tracking-tighter shadow-xl">
                    {c.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-yellow-500 font-black uppercase text-[9px] md:text-[11px] tracking-[0.3em] group-hover:translate-x-3 transition-transform flex items-center gap-2">
                Initialize Node <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </div>
        </div>

        {/* --- [D] DOWNLOAD SECTION: RESPONSIVE FLEX --- */}
        <div className="mt-10 w-full text-center py-16 md:py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] rounded-[4rem] shadow-inner">
          <h3 className="text-xl md:text-4xl font-black uppercase tracking-tighter mb-12 italic text-gray-300">Synchronized Across All Galaxies</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-10">
            
            <button 
              onClick={() => handleDownload('Android')}
              className="flex items-center gap-4 px-6 md:px-10 py-4 md:py-6 rounded-[2rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-xl active:scale-95"
            >
              <div className="p-2 md:p-3 rounded-2xl bg-black group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm-11.046 0c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm11.42-3.805l1.967-3.407a.5.5 0 10-.866-.5l-1.996 3.457A9.957 9.957 0 0012 10a9.957 9.957 0 00-7.002 1.086l-1.996-3.457a.5.5 0 10-.866.5l1.967 3.407A9.976 9.976 0 002 18h20a9.976 9.976 0 00-4.103-6.464z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Client</div>
                <div className="font-black text-xs md:text-sm uppercase">Android (APK)</div>
              </div>
            </button>

            <button 
              onClick={() => handleDownload('iOS')}
              className="flex items-center gap-4 px-6 md:px-10 py-4 md:py-6 rounded-[2rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-xl active:scale-95"
            >
              <div className="p-2 md:p-3 rounded-2xl bg-black group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Client</div>
                <div className="font-black text-xs md:text-sm uppercase">iOS (iPhone)</div>
              </div>
            </button>
            
          </div>
        </div>
      </main>

      {/* --- [E] FOOTER --- */}
      <footer className="p-10 md:p-16 text-center text-gray-800 text-[9px] md:text-[11px] font-black uppercase tracking-[0.8em] border-t border-white/5 bg-black/80">
        &copy; 2024 ZENTUM GLOBAL • VERIFIED QUANTUM-CLOUD SECURED TERMINAL • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default Home;