import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, INITIAL_FOREX_DATA, INITIAL_CRYPTO_DATA } from '../constants';
import Logo from '../components/Logo'; // استخدام المكون الذهبي الاحترافي
import TradingChart from '../components/TradingChart';
import { User } from '../types';

/**
 * ZENTUM HOME INTERFACE - PROFESSIONAL ULTIMATE EDITION (V4.2)
 * ---------------------------------------------------------
 * DEVELOPED BY: ZENTUM GLOBAL CORE
 * FEATURES:
 * - Full PWA Installer Logic (Manual & Auto Prompt)
 * - Optimized Mobile Portrait Stacking (Vertical Layout)
 * - Retained all UI decorations, shadows, and gradients
 * - Secure Cloud Navigation (Admin Console Sync)
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
    // التقاط حدث طلب التثبيت لتمكين الزر اليدوي (حل مشكلة عدم ظهور الرسالة في إندونيسيا)
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
      // دليل يدوي لمستخدمي آيفون أو المتصفحات المقيدة
      alert("ZENTUM WEB-APP INSTALLATION: \n\n1. On iPhone (Safari): Tap the 'Share' icon and select 'Add to Home Screen'. \n2. On Android: Open the browser menu and select 'Install App'.");
    }
  };

  const handleDownload = (platform: string) => {
    alert(`Initializing ZENTUM ${platform} Core Download... The encrypted installer package will begin shortly.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11] text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* --- [A] NAVBAR: RESPONSIVE DUAL-LAYER --- */}
      <nav className="p-4 md:p-8 flex justify-between items-center border-b border-white/5 bg-[#181a20]/80 backdrop-blur-2xl sticky top-0 z-[100] shadow-2xl">
        
        {/* جهة اليسار: الهوية (Logo + Brand) */}
        <div className="flex items-center gap-3 md:gap-5 cursor-pointer hover:opacity-90 transition-all" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Logo className="w-10 h-10 md:w-16 md:h-16 shadow-lg rounded-2xl" />
          <div className="flex flex-col">
            <span className="text-xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">{APP_NAME}</span>
            <span className="text-[7px] md:text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] mt-1 opacity-80">Global Terminal</span>
          </div>
        </div>
        
        {/* جهة اليمين: الدخول والخروج (متجاوب) */}
        <div className="flex gap-3 md:gap-6 items-center">
          {user ? (
            <div className="flex items-center gap-3 md:gap-6">
              {/* إخفاء الإيميل في شاشات الموبايل الصغيرة جداً */}
              <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-4">
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest leading-none mb-1">Session Authorized</span>
                <span className="text-[11px] text-green-500 font-bold tracking-wider italic truncate max-w-[120px]">{user.email}</span>
              </div>
              
              {/* التوجيه بناءً على الرتبة */}
              <button 
                onClick={() => navigate(user.role === 'ADMIN' ? '/admin' : '/crypto')}
                className="px-5 md:px-8 py-2.5 rounded-xl bg-yellow-600 text-black text-[11px] md:text-xs font-black uppercase shadow-xl shadow-yellow-900/20 hover:bg-yellow-500 transition-all active:scale-95"
              >
                {user.role === 'ADMIN' ? 'Master Console' : 'Enter Dashboard'}
              </button>
              
              <button 
                onClick={onLogout}
                className="text-gray-500 hover:text-white uppercase font-black text-[10px] md:text-xs tracking-[0.2em] transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-8 md:px-14 py-3 md:py-4 rounded-full bg-yellow-600 text-black font-black text-xs md:text-sm uppercase tracking-[0.2em] shadow-2xl shadow-yellow-900/20 active:scale-95 transition-all hover:bg-yellow-500"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* --- [B] HERO SECTION: CENTERED & POWERFUL --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 md:py-32 flex flex-col items-center">
        
        {/* Hero Content */}
        <div className="text-center mb-20 md:mb-40 space-y-10 md:space-y-14 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-700 leading-[1] uppercase italic tracking-tighter shadow-sm">
            Stealth Trading <br className="hidden md:block" /> Reimagined.
          </h1>
          
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="flex flex-col items-center gap-4">
              <p className="text-yellow-500 text-sm md:text-2xl font-black uppercase tracking-[0.5em] animate-pulse">
                No KYC • Zero Limits • 1:5000 Leverage
              </p>
              <div className="h-0.5 w-24 bg-yellow-500/20 rounded-full"></div>
            </div>
            
            <p className="text-gray-400 text-lg md:text-3xl leading-relaxed italic font-medium opacity-90 max-w-3xl mx-auto">
              "Trade the world's most liquid financial markets with absolute privacy and instant cloud-encrypted execution. No boundaries, just results."
            </p>
            
            <p className="text-gray-600 text-xs md:text-lg font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
              Built on a decentralized server architecture to ensure 99.9% uptime for both Forex and Crypto professional terminals.
            </p>

            {/* PWA INSTALLER - MOBILE PROMPT */}
            {showInstallBtn && (
              <div className="mt-12 p-1 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-[2.5rem] shadow-2xl inline-block">
                <button 
                  onClick={handleInstallApp} 
                  className="px-12 md:px-16 py-5 md:py-7 bg-[#0b0e11] text-white rounded-[2.2rem] font-black uppercase text-[11px] md:text-xs tracking-[0.4em] flex items-center gap-4 hover:bg-black transition-all active:scale-95"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Install ZENTUM App
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- [C] SELECTION CARDS: RESPONSIVE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full mb-40">
          
          {/* Forex Card */}
          <div 
            onClick={() => navigate('/forex')}
            className="group relative overflow-hidden rounded-[4rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-10 md:p-20 cursor-pointer hover:border-blue-500/50 transition-all transform hover:-translate-y-4 shadow-2xl"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] group-hover:bg-blue-600/15 transition-all duration-700"></div>
            
            <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter text-white">
              Forex <span className="text-blue-500 text-[10px] md:text-xs tracking-[0.5em] not-italic ml-4 uppercase font-bold opacity-60 italic">Global</span>
            </h2>
            <p className="text-gray-500 mb-16 font-medium text-lg md:text-xl leading-relaxed max-w-xs">
              Access 50+ currency pairs with institutional liquidity and ultra-tight institutional spreads.
            </p>
            
            <div className="h-32 md:h-44 mb-16 opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110">
               <TradingChart color="#2962ff" dataCount={25} />
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-8">
               <span className="text-blue-500 font-black uppercase text-[10px] md:text-[11px] tracking-[0.4em] group-hover:translate-x-4 transition-transform inline-block underline decoration-blue-500/20 underline-offset-[12px]">Launch Cloud Terminal &rarr;</span>
               <div className="flex -space-x-4 opacity-50 group-hover:opacity-100 transition-opacity">
                 {INITIAL_FOREX_DATA.slice(0, 3).map((f, i) => (
                    <div key={f.symbol} className="w-12 h-12 rounded-full bg-blue-950 border-2 border-blue-500/30 flex items-center justify-center text-[10px] font-black tracking-tighter shadow-2xl" style={{zIndex: 3-i}}>
                        {f.symbol.split('/')[0]}
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Crypto Card */}
          <div 
            onClick={() => navigate('/crypto')}
            className="group relative overflow-hidden rounded-[4rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-10 md:p-20 cursor-pointer hover:border-yellow-500/50 transition-all transform hover:-translate-y-4 shadow-2xl"
          >
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-yellow-600/5 rounded-full blur-[100px] group-hover:bg-yellow-600/15 transition-all duration-700"></div>
            
            <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase italic tracking-tighter text-white">
              Crypto <span className="text-yellow-500 text-[10px] md:text-xs tracking-[0.5em] not-italic ml-4 uppercase font-bold opacity-60 italic">Digital</span>
            </h2>
            <p className="text-gray-500 mb-16 font-medium text-lg md:text-xl leading-relaxed max-w-xs">
              Instant settlement across major high-liquidity digital assets and decentralized pools.
            </p>
            
            <div className="h-32 md:h-44 mb-16 opacity-30 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110">
               <TradingChart color="#f3ba2f" dataCount={25} />
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-8">
               <span className="text-yellow-500 font-black uppercase text-[10px] md:text-[11px] tracking-[0.4em] group-hover:translate-x-4 transition-transform inline-block underline decoration-yellow-500/20 underline-offset-[12px]">Initialize Cloud Node &rarr;</span>
               <div className="flex -space-x-4 opacity-50 group-hover:opacity-100 transition-opacity">
                 {INITIAL_CRYPTO_DATA.slice(0, 3).map((c, i) => (
                    <div key={c.symbol} className="w-12 h-12 rounded-full bg-yellow-950 border-2 border-yellow-500/30 flex items-center justify-center text-[10px] font-black tracking-tighter shadow-2xl" style={{zIndex: 3-i}}>
                        {c.symbol.split('/')[0]}
                    </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* --- [D] MOBILE APP DOWNLOADS --- */}
        <div className="w-full text-center py-20 md:py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] rounded-[5rem] shadow-inner mb-32 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <h3 className="text-2xl md:text-5xl font-black uppercase tracking-tighter mb-12 italic text-gray-300 relative z-10">Synchronized Global Infrastructure</h3>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 relative z-10">
            
            <button 
              onClick={() => handleDownload('Android')}
              className="flex items-center gap-5 px-10 md:px-14 py-5 md:py-8 rounded-[2.5rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-2xl active:scale-95"
            >
              <div className="p-3 md:p-4 rounded-3xl bg-black group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-7 h-7 md:w-10 md:h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm-11.046 0c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm11.42-3.805l1.967-3.407a.5.5 0 10-.866-.5l-1.996 3.457A9.957 9.957 0 0012 10a9.957 9.957 0 00-7.002 1.086l-1.996-3.457a.5.5 0 10-.866.5l1.967 3.407A9.976 9.976 0 002 18h20a9.976 9.976 0 00-4.103-6.464z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Global Mobile OS</div>
                <div className="font-black text-sm md:text-xl uppercase tracking-tighter">Android (APK)</div>
              </div>
            </button>

            <button 
              onClick={() => handleDownload('iOS')}
              className="flex items-center gap-5 px-10 md:px-14 py-5 md:py-8 rounded-[2.5rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-2xl active:scale-95"
            >
              <div className="p-3 md:p-4 rounded-3xl bg-black group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-7 h-7 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Apple Mobile OS</div>
                <div className="font-black text-sm md:text-xl uppercase tracking-tighter">iOS (iPhone)</div>
              </div>
            </button>
            
          </div>
        </div>
      </main>

      {/* --- [E] FOOTER --- */}
      <footer className="p-16 text-center text-gray-800 text-[11px] font-black uppercase tracking-[1em] border-t border-white/5 bg-black/80">
        &copy; 2024 ZENTUM GLOBAL • VERIFIED SATELLITE CLOUD INFRASTRUCTURE • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default Home;