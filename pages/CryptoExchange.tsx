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
 * Features: Atomic Balance Sync, Real-time P/L, Secure Portfolio Management
 */

interface CryptoProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const CryptoExchange: React.FC<CryptoProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- States ---
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01); // كمية الشراء/البيع
  const [livePrices, setLivePrices] = useState<any>({});
  
  // التحكم في النوافذ المنبثقة
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // تبويبات الجدول السفلي
  const [bottomTab, setBottomTab] = useState<'ASSETS' | 'HISTORY'>('ASSETS');

  // جلب البيانات من السحابة مباشرة عبر الـ Props
  const holdings = user.cryptoHoldings || [];
  const history = user.tradeHistory || [];

  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }, { s: 'TRX', n: 'TRON' }, { s: 'LTC', n: 'Litecoin' }
  ];

  // تحديث الأسعار اللحظية كل ثانيتين
  useEffect(() => {
    const updatePrices = async () => {
      const p = await fetchLivePrices();
      if (p) setLivePrices(p);
    };
    updatePrices();
    const inv = setInterval(updatePrices, 2000);
    return () => clearInterval(inv);
  }, []);

  // --- محرك التداول الاحترافي (Atomic Sync Logic) ---
  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) return alert("Connecting to global market feed... Please wait.");

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ Insufficient Funds: Please deposit more USDT to execute this trade.");
        return;
      }

      // حساب القيم الجديدة محلياً أولاً لضمان عدم حدوث تضارب
      const updatedBalance = user.cryptoBalance - cost;
      const newHolding: CryptoHolding = { 
        id: Date.now(),
        symbol: selected, 
        qty: volume, 
        buyPrice: price 
      };

      // إرسال تحديث سحابي واحد (الرصيد + قائمة الأصول)
      onSyncUserData({ 
        cryptoBalance: updatedBalance,
        cryptoHoldings: [...holdings, newHolding] 
      });
      
      alert(`Order Filled: Successfully purchased ${volume} ${selected}`);

    } else {
      // البحث عن الأصل في المحفظة
      const assetIdx = holdings.findIndex(h => h.symbol === selected);
      if (assetIdx > -1) {
        const asset = holdings[assetIdx];
        const gain = asset.qty * price; // القيمة الحالية للأصل عند البيع
        const netProfit = gain - (asset.qty * asset.buyPrice); // الربح أو الخسارة الصافية

        const updatedBalance = user.cryptoBalance + gain;

        // تسجيل العملية في السجل التاريخي للأرشفة
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
        
        // إرسال تحديث سحابي شامل (رصيد + أصول محدثة + سجل جديد)
        onSyncUserData({ 
          cryptoBalance: updatedBalance,
          cryptoHoldings: updatedHoldings, 
          tradeHistory: [historyItem, ...history] 
        });

        alert(`Trade Closed: Realized Profit/Loss ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} USDT`);
      } else {
        alert("⚠️ Inventory Error: You do not own this asset in your portfolio.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none text-[11px]">
      
      {/* --- Navbar المطور والشامل --- */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-6 z-[100] shadow-2xl">
        
        {/* جهة اليسار: الهوية والتنقل */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-black text-yellow-500 uppercase text-sm tracking-[0.2em] italic">ZENTUM</span>
          </div>
          
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[12px] tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Home
            </button>
            <button onClick={() => setIsAccountOpen(true)} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[12px] tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Account
            </button>
          </div>
        </div>
        
        {/* جهة اليمين: الأرصدة والتحكم المالي */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">AVAILABLE BALANCE</span>
            <span className="text-[16px] font-mono font-black text-yellow-500 tracking-tighter">
              {user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} 
              <span className="text-[10px] text-gray-400 ml-1 uppercase">USDT</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsDepositOpen(true)} className="bg-yellow-600 text-black px-6 py-2.5 rounded-xl font-black text-[11px] uppercase shadow-lg shadow-yellow-900/20 hover:bg-yellow-500 transition-all active:scale-95">Deposit</button>
            <button onClick={() => setIsWithdrawOpen(true)} className="border border-white/20 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase hover:bg-white/10 transition-all active:scale-95">Withdraw</button>
          </div>
          
          <button onClick={onLogout} className="text-gray-500 hover:text-red-500 transition-colors ml-4 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Sidebar: Market Watch */}
        <div className="w-full md:w-64 border-r border-white/5 bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 shadow-xl">
          <div className="hidden md:block p-4 text-[10px] text-gray-500 font-black uppercase border-b border-white/5 tracking-[0.2em]">Market Stream</div>
          {coins.map(c => (
            <div 
              key={c.s} 
              onClick={() => setSelected(c.s)} 
              className={`p-4 md:p-5 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500' : 'hover:bg-white/5'}`}
            >
              <div className="font-black text-xs md:text-sm uppercase text-white tracking-tight">{c.s} / USDT</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase font-bold mt-1">{c.n}</div>
            </div>
          ))}
        </div>

        {/* Workspace: Trade & Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          
          {/* Trade Control Bar */}
          <div className="p-4 bg-[#181A20] border-b border-white/5 flex justify-between items-center gap-4">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white italic">{selected} / <span className="text-gray-500">USDT</span></h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-black/50 rounded-xl border border-white/10 h-11 px-4 shadow-inner text-white">
                  <span className="text-[9px] text-gray-500 uppercase font-black mr-3 tracking-widest">Quantity</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-16 md:w-24 bg-transparent border-none text-white text-sm font-black outline-none font-mono" step="0.01" min="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-white/10 rounded-xl overflow-hidden shadow-2xl h-11">
                  <button onClick={() => handleTrade('SELL')} className="px-10 bg-red-600/20 text-red-500 border-r border-white/5 font-black uppercase text-[11px] hover:bg-red-600 hover:text-white transition-all tracking-widest active:bg-red-700">Sell</button>
                  <button onClick={() => handleTrade('BUY')} className="px-10 bg-[#02c076]/20 text-[#02c076] font-black uppercase text-[11px] hover:bg-[#02c076] hover:text-white transition-all tracking-widest active:bg-[#02c076]">Buy</button>
               </div>
            </div>
          </div>

          {/* Chart Engine */}
          <div className="flex-1 bg-black relative">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
              title="ZENTUM Real-time Crypto Chart" 
            />
          </div>

          {/* Bottom Terminal Panel */}
          <div className="h-52 md:h-64 bg-[#181a20] border-t border-white/10 flex flex-col overflow-hidden shrink-0 shadow-2xl">
             <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-white/5 font-black uppercase tracking-widest">
                <button onClick={() => setBottomTab('ASSETS')} className={`px-10 py-3.5 border-r border-white/5 transition-all ${bottomTab === 'ASSETS' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Active Portfolio</button>
                <button onClick={() => setBottomTab('HISTORY')} className={`px-10 py-3.5 border-r border-white/5 transition-all ${bottomTab === 'HISTORY' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Trade History Log</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#181a20]">
                <table className="w-full text-left text-white text-[11px]">
                   <thead className="text-gray-600 border-b border-white/5 uppercase font-black tracking-widest text-[9px]">
                     <tr><th className="pb-3">Asset Identity</th><th className="pb-3 text-center">Volume</th><th className="pb-3 text-center">Entry Price</th><th className="text-right pb-3">{bottomTab === 'ASSETS' ? 'Floating P/L' : 'Status'}</th></tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                     {bottomTab === 'ASSETS' ? (
                       holdings.map((h: any) => {
                         const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                         const pl = currentVal - (h.qty * h.buyPrice);
                         return (
                           <tr key={h.id} className="hover:bg-white/[0.01] transition-colors">
                             <td className="py-3 font-black text-white uppercase text-xs tracking-tighter">{h.symbol} / USDT</td>
                             <td className="py-3 text-center font-mono font-bold text-gray-300">{h.qty.toFixed(4)}</td>
                             <td className="py-3 text-center text-gray-500 font-mono">${h.buyPrice.toLocaleString()}</td>
                             <td className={`text-right py-3 font-black font-mono text-base ${pl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                               {pl >= 0 ? '+' : ''}{pl.toFixed(2)} <span className="text-[10px]">USDT</span>
                             </td>
                           </tr>
                         );
                       })
                     ) : (
                       history.filter(h => h.marketType === MarketType.CRYPTO).map((h: any) => (
                         <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                           <td className="py-3 font-black text-white uppercase text-xs">{h.symbol} / USDT</td>
                           <td className="py-3 text-center font-mono">{h.volume.toFixed(4)}</td>
                           <td className="py-3 text-center text-gray-500 font-mono">${h.openPrice.toLocaleString()}</td>
                           <td className={`text-right py-3 font-black font-mono text-base ${h.profit >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                             {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
                {(bottomTab === 'ASSETS' ? holdings : history).length === 0 && (
                  <div className="text-center py-12 text-gray-700 uppercase font-black tracking-[0.4em] italic opacity-50">Secure Cloud: No Records Found</div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} user={user} />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} walletType="crypto" />
    </div>
  );
};

export default CryptoExchange;