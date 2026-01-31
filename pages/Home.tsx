import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, INITIAL_FOREX_DATA, INITIAL_CRYPTO_DATA } from '../constants';
import Logo from '../components/Logo'; // استخدام المكون الذهبي الجديد
import TradingChart from '../components/TradingChart';
import { User } from '../types';

interface HomeProps {
  user: User | null;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // --- حالات تثبيت التطبيق (PWA Logic) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
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
      alert("To install: Tap 'Share' then 'Add to Home Screen' on iPhone, or use Browser Menu on Android.");
    }
  };

  const handleDownload = (platform: string) => {
    alert(`Initializing ZENTUM ${platform} Core Download... Please wait.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0e11] text-white font-sans selection:bg-yellow-500/30">
      
      {/* --- Header --- */}
      <nav className="p-4 md:p-6 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <Logo className="w-10 h-10 md:w-14 md:h-14" />
          <span className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">{APP_NAME}</span>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-gray-500 hidden lg:block text-[11px] font-bold uppercase tracking-widest border-r border-white/10 pr-4">Authorized: {user.email}</span>
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 rounded-xl bg-yellow-600/10 border border-yellow-500/30 text-yellow-500 text-[10px] md:text-xs font-black uppercase hover:bg-yellow-600 hover:text-black transition-all"
                >
                  Master Console
                </button>
              )}
              <button 
                onClick={onLogout}
                className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-[10px] md:text-xs font-black uppercase hover:bg-white/5 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-6 md:px-10 py-2.5 rounded-full bg-yellow-600 text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-900/20 active:scale-95"
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-12 md:py-24 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-24 space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600 leading-[1.1] tracking-tighter uppercase italic">
            The Future <br className="hidden md:block" /> Of Trading.
          </h1>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-yellow-500 text-sm md:text-xl font-black uppercase tracking-[0.3em] animate-pulse">
              No KYC • Zero Delay • 1:5000 Leverage
            </p>
            <p className="text-gray-400 text-base md:text-xl leading-relaxed font-medium">
              "Experience the ultimate stealth trading environment. No complications, 
              unlimited liquidity, and instant cloud execution for global markets."
            </p>
            
            {/* زر تثبيت التطبيق - يظهر للموبايل بشكل جذاب */}
            {showInstallBtn && (
              <button 
                onClick={handleInstallApp}
                className="mt-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all shadow-2xl flex items-center gap-3 mx-auto animate-bounce"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Install ZENTUM Web-App
              </button>
            )}
          </div>
        </div>

        {/* Selection Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full mb-20">
          
          {/* Forex Card */}
          <div 
            onClick={() => navigate('/forex')}
            className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 md:p-12 cursor-pointer hover:border-blue-500/40 transition-all transform hover:-translate-y-2 shadow-2xl"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-4 uppercase italic tracking-tighter">
              Forex <span className="text-blue-500 text-xs md:text-sm tracking-[0.3em] not-italic">GLOBAL</span>
            </h2>
            <p className="text-gray-500 mb-8 font-medium text-sm md:text-base">Trade majors and exotic pairs with lightning-fast cloud execution.</p>
            <div className="h-32 mb-8 grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
              <TradingChart color="#2962ff" dataCount={15} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-3">
                {INITIAL_FOREX_DATA.slice(0, 3).map(f => (
                  <div key={f.symbol} className="w-10 h-10 rounded-full bg-[#0b0e11] border-2 border-[#1e2329] flex items-center justify-center text-[9px] font-black text-blue-500">
                    {f.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-blue-500 font-black uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">Enter Terminal &rarr;</span>
            </div>
          </div>

          {/* Crypto Card */}
          <div 
            onClick={() => navigate('/crypto')}
            className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] p-8 md:p-12 cursor-pointer hover:border-yellow-500/40 transition-all transform hover:-translate-y-2 shadow-2xl"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-600/20 transition-all"></div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 flex items-center gap-4 uppercase italic tracking-tighter">
              Crypto <span className="text-yellow-500 text-xs md:text-sm tracking-[0.3em] not-italic">DIGITAL</span>
            </h2>
            <p className="text-gray-500 mb-8 font-medium text-sm md:text-base">Instant settlement on leading blockchain assets with deep pool liquidity.</p>
            <div className="h-32 mb-8 grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
              <TradingChart color="#f3ba2f" dataCount={15} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-3">
                {INITIAL_CRYPTO_DATA.slice(0, 3).map(c => (
                  <div key={c.symbol} className="w-10 h-10 rounded-full bg-[#0b0e11] border-2 border-[#1e2329] flex items-center justify-center text-[9px] font-black text-yellow-500">
                    {c.symbol.split('/')[0]}
                  </div>
                ))}
              </div>
              <span className="text-yellow-500 font-black uppercase text-[10px] tracking-widest group-hover:translate-x-2 transition-transform">Exchange Now &rarr;</span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mt-10 w-full text-center py-16 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] rounded-[3rem]">
          <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-10 italic text-gray-300">Synchronized Across All Systems</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <button 
              onClick={() => handleDownload('Android')}
              className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-xl"
            >
              <div className="p-3 rounded-2xl bg-black group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm-11.046 0c-.551 0-1-.449-1-1 0-.551.449-1 1-1 .551 0 1 .449 1 1 0 .551-.449 1-1 1zm11.42-3.805l1.967-3.407a.5.5 0 10-.866-.5l-1.996 3.457A9.957 9.957 0 0012 10a9.957 9.957 0 00-7.002 1.086l-1.996-3.457a.5.5 0 10-.866.5l1.967 3.407A9.976 9.976 0 002 18h20a9.976 9.976 0 00-4.103-6.464z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Client for</div>
                <div className="font-black text-sm uppercase">Android (APK)</div>
              </div>
            </button>
            <button 
              onClick={() => handleDownload('iOS')}
              className="flex items-center gap-4 px-8 py-5 rounded-[2rem] bg-[#1e2329] border border-white/5 hover:border-white/20 transition-all group shadow-xl"
            >
              <div className="p-3 rounded-2xl bg-black group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .76-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Client for</div>
                <div className="font-black text-sm uppercase">iOS (iPhone)</div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="p-10 text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.5em] border-t border-white/5 bg-black/40">
        &copy; 2024 {APP_NAME} GLOBAL LTD. SECURED CLOUD INFRASTRUCTURE.
      </footer>
    </div>
  );
};

export default Home;