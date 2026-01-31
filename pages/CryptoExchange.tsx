import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import WithdrawModal from '../components/WithdrawModal';
import { User, CryptoHolding, HistoryOrder, MarketType } from '../types';

/**
 * ZENTUM CRYPTO EXCHANGE - ULTIMATE CLOUD EDITION (V4.0)
 * ---------------------------------------------------------
 * DEVELOPED BY: ZENTUM GLOBAL CORE
 * FEATURES:
 * - Atomic Cloud Sync (Prevents balance jump-back)
 * - Real-time Portfolio P/L Calculation
 * - Integrated History Logs for all closed trades
 * - Mobile Portrait Responsiveness (Market Strip)
 * - High-end Professional UI with No Shortcuts
 */

interface CryptoProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const CryptoExchange: React.FC<CryptoProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- [1] حالات الصفحة (States) التفصيلية ---
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01); // كمية التداول
  const [livePrices, setLivePrices] = useState<any>({});
  
  // حالات التحكم في النوافذ المنبثقة
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // حالات التيرمينال السفلي (Assets / History)
  const [bottomTab, setBottomTab] = useState<'ASSETS' | 'HISTORY'>('ASSETS');

  // جلب البيانات السحابية من كائن المستخدم المحدث لحظياً
  const holdings = user.cryptoHoldings || [];
  const history = user.tradeHistory || [];

  // قائمة العملات المدعومة
  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }, { s: 'TRX', n: 'TRON' }, { s: 'LTC', n: 'Litecoin' },
    { s: 'NEAR', n: 'Near' }, { s: 'APT', n: 'Aptos' }, { s: 'PEPE', n: 'Pepe' }
  ];

  // --- [2] محرك المزامنة المستمرة ---
  useEffect(() => {
    const updatePrices = async () => {
      const p = await fetchLivePrices();
      if (p) setLivePrices(p);
    };
    updatePrices();
    const priceInv = setInterval(updatePrices, 2000); // تحديث كل ثانيتين للحسابات
    return () => clearInterval(priceInv);
  }, []);

  // --- [3] محرك التداول السحابي المطور (Atomic Logic) ---
  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) {
      alert("⚠️ Synchronizing market data... please wait.");
      return;
    }

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ INSUFFICIENT BALANCE: Please deposit USDT to complete this order.");
        return;
      }

      // حساب القيم الجديدة محلياً أولاً لضمان الثبات المطلق
      const updatedCryptoBalance = user.cryptoBalance - cost;
      const newHolding: CryptoHolding = { 
        id: Date.now(),
        symbol: selected, 
        qty: volume, 
        buyPrice: price 
      };

      // إرسال تحديث سحابي واحد (رصيد + محفظة)
      onSyncUserData({ 
        cryptoBalance: updatedCryptoBalance,
        cryptoHoldings: [...holdings, newHolding] 
      });
      
      alert(`ORDER CONFIRMED: Bought ${volume} ${selected} at $${price.toLocaleString()}`);

    } else {
      // البحث عن العملة في محفظة الأصول
      const assetIdx = holdings.findIndex(h => h.symbol === selected);
      if (assetIdx > -1) {
        const asset = holdings[assetIdx];
        const gain = asset.qty * price; // القيمة الحالية عند البيع
        const netProfit = gain - (asset.qty * asset.buyPrice);

        // حساب الرصيد الجديد
        const updatedCryptoBalance = user.cryptoBalance + gain;

        // إعداد سجل التاريخ
        const historyItem: HistoryOrder = {
          id: Date.now(), 
          symbol: asset.symbol, 
          type: 'SELL', 
          openPrice: asset.buyPrice,
          closePrice: price, 
          volume: asset.qty, 
          profit: netProfit, 
          timestamp: Date.now(),
          marketType: MarketType.CRYPTO
        };

        const updatedHoldings = [...holdings];
        updatedHoldings.splice(assetIdx, 1);
        
        // تحديث سحابي شامل (رصيد + أصول + سجل) في طلب واحد
        onSyncUserData({ 
          cryptoBalance: updatedCryptoBalance,
          cryptoHoldings: updatedHoldings, 
          tradeHistory: [historyItem, ...history] 
        });

        alert(`ASSET LIQUIDATED: Result ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} USDT`);
      } else {
        alert("⚠️ PORTFOLIO ERROR: You do not own this asset.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none text-[11px]">
      
      {/* --- NAVBAR: NAVIGATION LEFT, FINANCE RIGHT --- */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-6 z-[100] shadow-2xl shrink-0">
        
        {/* جهة اليسار: Logo + Home + Account (خط كبير) */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-yellow-500 uppercase text-sm tracking-[0.2em] italic">ZENTUM</span>
          </div>
          
          <div className="flex items-center gap-10">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[13px] tracking-widest flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Home
            </button>
            <button onClick={() => setIsAccountOpen(true)} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[13px] tracking-widest flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Account
            </button>
          </div>
        </div>
        
        {/* جهة اليمين: المالية والتحكم */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-6 text-right">
            <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest leading-none mb-1">AVAILABLE BALANCE</span>
            <span className="text-[16px] font-mono font-black text-yellow-500 tracking-tighter shadow-sm">
              {user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} 
              <span className="text-[10px] text-gray-400 ml-1 uppercase">USDT</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsDepositOpen(true)} className="bg-yellow-600 text-black px-7 py-3 rounded-2xl font-black text-[12px] uppercase shadow-lg shadow-yellow-900/30 hover:bg-yellow-500 transition-all active:scale-95">Deposit</button>
            <button onClick={() => setIsWithdrawOpen(true)} className="border border-white/20 text-white px-7 py-3 rounded-2xl font-black text-[12px] uppercase hover:bg-white/10 active:scale-95 transition-all">Withdraw</button>
          </div>
          
          <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors ml-3 p-2">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* --- SIDEBAR: ASSETS STRIP (Mobile Friendly) --- */}
        <div className="w-full md:w-64 border-r border-white/5 bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 shadow-xl">
          <div className="hidden md:block p-5 text-[11px] text-gray-500 font-black uppercase border-b border-white/5 tracking-[0.2em] bg-black/10">Market Watch</div>
          {coins.map(c => (
            <div 
              key={c.s} 
              onClick={() => setSelected(c.s)} 
              className={`p-4 md:p-6 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500 shadow-inner' : 'hover:bg-white/[0.02]'}`}
            >
              <div className="font-black text-[12px] md:text-[14px] uppercase text-white tracking-tighter">{c.s} / USDT</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase font-bold mt-1 opacity-60">{c.n}</div>
            </div>
          ))}
        </div>

        {/* --- MAIN AREA: CHART & TERMINAL --- */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          
          {/* Quick Trade Bar */}
          <div className="p-4 bg-[#181A20] border-b border-white/5 flex justify-between items-center gap-4 shadow-md">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white italic">{selected} <span className="text-gray-600 not-italic">/ Live</span></h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-black/60 rounded-2xl border border-white/10 h-12 px-5 shadow-inner">
                  <span className="text-[10px] text-gray-500 font-black mr-4 uppercase tracking-widest">QUANTITY</span>
                  <input 
                    type="number" 
                    value={volume} 
                    onChange={e => setVolume(parseFloat(e.target.value))} 
                    className="w-16 md:w-28 bg-transparent border-none text-white text-[15px] font-black outline-none font-mono text-center" 
                    step="0.01" 
                    min="0.01" 
                  />
               </div>
               <div className="flex bg-[#1e2329] border border-white/10 rounded-2xl h-12 overflow-hidden shadow-2xl">
                  <button onClick={() => handleTrade('SELL')} className="px-10 md:px-16 bg-red-600/20 text-red-500 border-r border-white/5 font-black uppercase text-[13px] hover:bg-red-600 hover:text-white transition-all tracking-widest active:scale-95">Sell</button>
                  <button onClick={() => handleTrade('BUY')} className="px-10 md:px-16 bg-[#02c076]/20 text-[#02c076] font-black uppercase text-[13px] hover:bg-[#02c076] hover:text-white transition-all tracking-widest active:scale-95">Buy</button>
               </div>
            </div>
          </div>

          {/* Full-width Crypto Chart */}
          <div className="flex-1 bg-black relative shadow-inner">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
              title="Cloud Engine Chart" 
            />
          </div>

          {/* --- [C] BOTTOM TERMINAL PANEL --- */}
          <div className="h-60 md:h-72 bg-[#181a20] border-t border-white/10 flex flex-col overflow-hidden shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
             <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-white/5 font-black uppercase tracking-widest">
                <button onClick={() => setBottomTab('ASSETS')} className={`px-12 py-4 border-r border-white/5 transition-all ${bottomTab === 'ASSETS' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Active Portfolio</button>
                <button onClick={() => setBottomTab('HISTORY')} className={`px-12 py-4 border-r border-white/5 transition-all ${bottomTab === 'HISTORY' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Trade History</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#181a20]">
                <table className="w-full text-left text-white border-collapse">
                   <thead className="text-gray-600 border-b border-white/5 uppercase font-black tracking-widest text-[9px]">
                     <tr>
                        <th className="pb-4 pr-4">Identity</th>
                        <th className="pb-4 pr-4 text-center">Volume</th>
                        <th className="pb-4 pr-4 text-center">Entry Price</th>
                        <th className="text-right pb-4">{bottomTab === 'ASSETS' ? 'Current P/L' : 'Closed Result'}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                     {bottomTab === 'ASSETS' ? (
                       holdings.map((h: any) => {
                         const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                         const pl = currentVal - (h.qty * h.buyPrice);
                         return (
                           <tr key={h.id} className="hover:bg-white/[0.01] transition-colors group">
                             <td className="py-5 font-black text-white uppercase text-xs tracking-tighter">{h.symbol} / USDT</td>
                             <td className="py-5 text-center font-mono font-black text-gray-300 text-sm">{h.qty.toFixed(4)}</td>
                             <td className="py-5 text-center text-gray-500 font-mono italic">${h.buyPrice.toLocaleString()}</td>
                             <td className={`text-right py-5 font-black font-mono text-base ${pl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                               {pl >= 0 ? '+' : ''}{pl.toFixed(2)} <span className="text-[10px] opacity-50">USDT</span>
                             </td>
                           </tr>
                         );
                       })
                     ) : (
                       history.filter(h => h.marketType === MarketType.CRYPTO).map((h: any) => (
                         <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                           <td className="py-5 font-black text-white uppercase text-xs">{h.symbol} / USDT</td>
                           <td className="py-5 text-center font-mono text-sm">{h.volume.toFixed(4)}</td>
                           <td className="py-5 text-center text-gray-500 font-mono italic">${h.openPrice.toLocaleString()}</td>
                           <td className={`text-right py-5 font-black font-mono text-base ${h.profit >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                             {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
                {(bottomTab === 'ASSETS' ? holdings : history).length === 0 && (
                  <div className="p-20 text-center text-gray-800 font-black uppercase tracking-[0.4em] italic opacity-30">No Cloud Records Found</div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* --- [D] POPUPS --- */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} user={user} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} walletType="crypto" />
    </div>
  );
};

export default CryptoExchange;