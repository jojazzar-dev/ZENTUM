import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import WithdrawModal from '../components/WithdrawModal';
import { User, CryptoHolding, HistoryOrder, MarketType } from '../types';

/**
 * ZENTUM CRYPTO EXCHANGE - ULTIMATE CLOUD EDITION
 * --------------------------------------------------
 * - Fix: Mobile Portrait Responsiveness (Horizontal Scroll)
 * - Fix: Atomic Cloud Sync (Balance Persistence)
 * - Feature: Trade History & Real-time P/L
 * - Full Navigation: Home, Account, Deposit, Withdraw
 */

interface CryptoProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const CryptoExchange: React.FC<CryptoProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- حالات الصفحة (States) ---
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01);
  const [livePrices, setLivePrices] = useState<any>({});
  
  // حالات التحكم في النوافذ المنبثقة
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // تبويبات التيرمينال السفلي
  const [bottomTab, setBottomTab] = useState<'ASSETS' | 'HISTORY'>('ASSETS');

  // جلب البيانات من السحابة (Firebase)
  const holdings = user.cryptoHoldings || [];
  const history = user.tradeHistory || [];

  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }, { s: 'TRX', n: 'TRON' }, { s: 'LTC', n: 'Litecoin' }
  ];

  // تحديث الأسعار كل ثانيتين للعمليات الحسابية
  useEffect(() => {
    const updatePrices = async () => {
      const p = await fetchLivePrices();
      if (p) setLivePrices(p);
    };
    updatePrices();
    const inv = setInterval(updatePrices, 2000);
    return () => clearInterval(inv);
  }, []);

  // --- محرك التداول (التحديث السحابي الواحد لمنع التضارب) ---
  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) return alert("Market data loading...");

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ Insufficient Balance!");
        return;
      }

      // حساب القيم الجديدة محلياً أولاً لضمان الثبات
      const updatedBalance = user.cryptoBalance - cost;
      const newHolding: CryptoHolding = { 
        id: Date.now(), symbol: selected, qty: volume, buyPrice: price 
      };

      // تحديث سحابي واحد
      onSyncUserData({ 
        cryptoBalance: updatedBalance,
        cryptoHoldings: [...holdings, newHolding] 
      });
      
      alert(`Purchased ${volume} ${selected}`);

    } else {
      const assetIdx = holdings.findIndex(h => h.symbol === selected);
      if (assetIdx > -1) {
        const asset = holdings[assetIdx];
        const gain = asset.qty * price;
        const profit = gain - (asset.qty * asset.buyPrice);
        const updatedBalance = user.cryptoBalance + gain;

        const historyItem: HistoryOrder = {
          id: Date.now(), symbol: asset.symbol, type: 'SELL', openPrice: asset.buyPrice,
          closePrice: price, volume: asset.qty, profit: profit, timestamp: Date.now(),
          marketType: MarketType.CRYPTO
        };

        const updatedHoldings = [...holdings];
        updatedHoldings.splice(assetIdx, 1);
        
        onSyncUserData({ 
          cryptoBalance: updatedBalance,
          cryptoHoldings: updatedHoldings, 
          tradeHistory: [historyItem, ...history] 
        });

        alert(`Asset Sold. Result: ${profit.toFixed(2)} USDT`);
      } else {
        alert("⚠️ You don't own this asset.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none text-[11px]">
      
      {/* --- Navbar (Responsive Header) --- */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-3 z-[100] shadow-2xl shrink-0">
        
        {/* جهة اليسار: Logo + Nav */}
        <div className="flex items-center gap-2 sm:gap-10">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="font-bold text-yellow-500 uppercase text-[10px] sm:text-sm tracking-tighter">ZENTUM</span>
          </div>
          <div className="flex gap-2 sm:gap-6">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[9px] sm:text-[12px] flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2.5"/></svg>
               <span className="hidden xs:inline">Home</span>
            </button>
            <button onClick={() => setIsAccountOpen(true)} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[9px] sm:text-[12px] flex items-center gap-1">
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth="2.5"/></svg>
               <span className="hidden xs:inline">Account</span>
            </button>
          </div>
        </div>

        {/* جهة اليمين: المالية */}
        <div className="flex gap-2 sm:gap-4 items-center">
           <div className="flex flex-col items-end mr-1 sm:mr-3">
              <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest">Balance</span>
              <span className="text-white font-mono text-[11px] sm:text-[14px] font-black">${user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
           </div>
           <div className="flex gap-1">
             <button onClick={() => setIsDepositOpen(true)} className="bg-yellow-600 text-black px-2 py-1.5 rounded-lg font-black text-[8px] sm:text-[11px] uppercase shadow-lg">Deposit</button>
             <button onClick={() => setIsWithdrawOpen(true)} className="border border-white/20 text-white px-2 py-1.5 rounded-lg font-black text-[8px] sm:text-[11px] uppercase hover:bg-white/10">Withdraw</button>
           </div>
           <button onClick={onLogout} className="text-gray-500 hover:text-red-500 ml-1 p-1">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* --- Sidebar (Market Strip for Mobile) --- */}
        <div className="w-full md:w-60 border-r border-white/5 bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 shadow-xl">
          {coins.map(c => (
            <div 
              key={c.s} 
              onClick={() => setSelected(c.s)} 
              className={`p-3 md:p-5 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500' : 'hover:bg-white/5'}`}
            >
              <div className="font-black text-[11px] md:text-sm uppercase text-white tracking-tight">{c.s}</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase mt-1">{c.n}</div>
            </div>
          ))}
        </div>

        {/* --- Main Workspace (Chart & Control) --- */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          
          <div className="p-2 md:p-3 bg-[#181a20] border-b border-white/5 flex justify-between items-center gap-2">
            <h2 className="text-[11px] md:text-lg font-black uppercase text-white tracking-tighter italic">{selected}/USDT</h2>
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-black/50 rounded-xl border border-white/10 h-8 px-2">
                  <span className="hidden xs:inline text-[7px] text-gray-500 font-black mr-1 uppercase">Qty</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-10 md:w-20 bg-transparent border-none text-white text-[11px] font-black outline-none font-mono" step="0.01" min="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-white/10 rounded-lg h-8 overflow-hidden shadow-2xl">
                  <button onClick={() => handleTrade('SELL')} className="px-4 md:px-10 bg-red-600/20 text-red-500 border-r border-white/5 font-black uppercase text-[9px] md:text-[11px] hover:bg-red-600 transition-all">Sell</button>
                  <button onClick={() => handleTrade('BUY')} className="px-4 md:px-10 bg-[#02c076]/20 text-[#02c076] font-black uppercase text-[9px] md:text-[11px] hover:bg-[#02c076] transition-all">Buy</button>
               </div>
            </div>
          </div>

          <div className="flex-1 bg-black relative min-h-[300px]">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
              title="Crypto Live Chart" 
            />
          </div>

          {/* --- Bottom Terminal (Assets & History) --- */}
          <div className="h-44 md:h-60 bg-[#181a20] border-t border-white/10 flex flex-col overflow-hidden shrink-0 shadow-2xl">
             <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-white/5 font-black uppercase tracking-widest">
                <button onClick={() => setBottomTab('ASSETS')} className={`px-8 py-3 border-r border-white/5 transition-all ${bottomTab === 'ASSETS' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Active Portfolio</button>
                <button onClick={() => setBottomTab('HISTORY')} className={`px-8 py-3 border-r border-white/5 transition-all ${bottomTab === 'HISTORY' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Trade History</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <table className="w-full text-left text-white text-[10px]">
                   <tbody className="divide-y divide-white/[0.03]">
                     {bottomTab === 'ASSETS' ? (
                       holdings.map((h: any) => {
                         const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                         const pl = currentVal - (h.qty * h.buyPrice);
                         return (
                           <tr key={h.id} className="hover:bg-white/[0.01]">
                             <td className="py-2 font-black text-white uppercase">{h.symbol}</td>
                             <td className="font-mono">{h.qty.toFixed(4)}</td>
                             <td className={`text-right font-black font-mono ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                               {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
                             </td>
                           </tr>
                         );
                       })
                     ) : (
                       history.filter((h: any) => h.marketType === MarketType.CRYPTO).map((h: any) => (
                         <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                           <td className="py-2 font-black uppercase">{h.symbol}</td>
                           <td className="font-mono">{h.volume.toFixed(4)}</td>
                           <td className={`text-right font-black font-mono ${h.profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                             {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
                {(bottomTab === 'ASSETS' ? holdings : history).length === 0 && <div className="p-10 text-center text-gray-700 font-black uppercase italic tracking-widest opacity-40">No Cloud Records</div>}
             </div>
          </div>
        </div>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} user={user} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} walletType="crypto" />
    </div>
  );
};

export default CryptoExchange;