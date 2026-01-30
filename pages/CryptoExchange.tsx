import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import WithdrawModal from '../components/WithdrawModal';
import { User, CryptoHolding, HistoryOrder, MarketType } from '../types';

/**
 * ZENTUM CRYPTO EXCHANGE - PRO CLOUD EDITION
 * Features: Atomic Sync, Trade History, Dynamic Assets, Mobile Friendly
 */

interface CryptoProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const CryptoExchange: React.FC<CryptoProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- States (الحالات) ---
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01);
  const [livePrices, setLivePrices] = useState<any>({});
  
  // حالات التحكم في النوافذ
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // تبويبات الجدول السفلي
  const [bottomTab, setBottomTab] = useState<'ASSETS' | 'HISTORY'>('ASSETS');

  // البيانات السحابية القادمة من Firebase عبر Props
  const holdings = user.cryptoHoldings || [];
  const history = user.tradeHistory || [];

  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }
  ];

  // مزامنة الأسعار كل ثانيتين للعمليات الحسابية
  useEffect(() => {
    const updatePrices = async () => {
      const p = await fetchLivePrices();
      if (p) setLivePrices(p);
    };
    updatePrices();
    const inv = setInterval(updatePrices, 2000);
    return () => clearInterval(inv);
  }, []);

  // --- محرك التداول (Atomic Sync Logic) ---
  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) return alert("Synchronizing market data...");

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ Insufficient Balance: Please deposit more USDT.");
        return;
      }

      // حساب القيم الجديدة لضمان عدم ضياع الرصيد (Atomic Update)
      const updatedBalance = user.cryptoBalance - cost;
      const newHolding: CryptoHolding = { 
        id: Date.now(),
        symbol: selected, 
        qty: volume, 
        buyPrice: price 
      };

      onSyncUserData({ 
        cryptoBalance: updatedBalance,
        cryptoHoldings: [...holdings, newHolding] 
      });
      
      alert(`Success: Bought ${volume} ${selected} at $${price.toLocaleString()}`);

    } else {
      const assetIdx = holdings.findIndex(h => h.symbol === selected);
      if (assetIdx > -1) {
        const asset = holdings[assetIdx];
        const gain = asset.qty * price;
        const profit = gain - (asset.qty * asset.buyPrice);

        // حساب الرصيد الجديد محلياً قبل الإرسال
        const updatedBalance = user.cryptoBalance + gain;

        // تسجيل الصفقة في السجل التاريخي
        const historyItem: HistoryOrder = {
          id: Date.now(), 
          symbol: asset.symbol, 
          type: 'SELL', 
          openPrice: asset.buyPrice,
          closePrice: price, 
          volume: asset.qty, 
          profit: profit, 
          timestamp: Date.now(),
          marketType: MarketType.CRYPTO
        };

        const updatedHoldings = [...holdings];
        updatedHoldings.splice(assetIdx, 1);
        
        // تحديث سحابي واحد وشامل يمنع تضارب البيانات
        onSyncUserData({ 
          cryptoBalance: updatedBalance,
          cryptoHoldings: updatedHoldings, 
          tradeHistory: [historyItem, ...history] 
        });

        alert(`Asset Sold: Net result ${profit >= 0 ? '+' : ''}${profit.toFixed(2)} USDT`);
      } else {
        alert("⚠️ You do not own any " + selected + " to sell.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none text-[11px]">
      
      {/* --- Navbar الرئيسي المطور --- */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-6 z-[100] shadow-xl">
        
        {/* جهة اليسار: Logo + Home + Account */}
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-black text-yellow-500 uppercase text-sm tracking-widest italic">ZENTUM</span>
          </div>
          
          <div className="flex items-center gap-6">
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
        
        {/* جهة اليمين: المالية والتحكم */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Available Balance</span>
            <span className="text-[15px] font-mono font-bold text-yellow-500">{user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-[10px] text-gray-400 uppercase">USDT</span></span>
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
        
        {/* Market Sidebar (متجاوب) */}
        <div className="w-full md:w-64 border-r border-[#2b2f36] bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10">
          <div className="hidden md:block p-4 text-[10px] text-gray-500 font-black uppercase border-b border-white/5 tracking-widest">Market Assets</div>
          {coins.map(c => (
            <div key={c.s} onClick={() => setSelected(c.s)} className={`p-4 md:p-5 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500' : 'hover:bg-white/5'}`}>
              <div className="font-black text-xs md:text-sm uppercase text-white">{c.s} / USDT</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase mt-1">{c.n}</div>
            </div>
          ))}
        </div>

        {/* Workspace: Chart & Trade */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          <div className="p-3 bg-[#181A20] border-b border-white/5 flex justify-between items-center gap-2">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white italic">{selected} / USDT</h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-black/40 rounded-xl border border-white/10 h-10 px-3">
                  <span className="text-[9px] text-gray-500 font-black mr-2 uppercase tracking-widest">Quantity</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-16 md:w-24 bg-transparent border-none text-white text-xs font-bold outline-none" step="0.01" min="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-[#2b2f36] rounded-xl h-10 overflow-hidden shadow-2xl">
                  <button onClick={() => handleTrade('SELL')} className="px-10 bg-red-600/20 text-red-500 border-r border-[#2b2f36] font-black text-[11px] uppercase hover:bg-red-600 hover:text-white transition-all tracking-widest">Sell</button>
                  <button onClick={() => handleTrade('BUY')} className="px-10 bg-[#02c076]/20 text-[#02c076] font-black text-[11px] uppercase hover:bg-[#02c076] hover:text-white transition-all tracking-widest">Buy</button>
               </div>
            </div>
          </div>

          <div className="flex-1 bg-black relative min-h-[300px]">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} className="w-full h-full border-none" title="Crypto Live Chart" />
          </div>

          {/* Bottom Terminal (Assets & History) */}
          <div className="h-52 md:h-64 bg-[#181a20] border-t border-white/10 flex flex-col overflow-hidden shrink-0 shadow-2xl">
             <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-[#2b2f36] font-black uppercase tracking-widest">
                <button onClick={() => setBottomTab('ASSETS')} className={`px-10 py-3.5 border-r border-[#2b2f36] transition-all ${bottomTab === 'ASSETS' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Active Portfolio</button>
                <button onClick={() => setBottomTab('HISTORY')} className={`px-10 py-3.5 border-r border-[#2b2f36] transition-all ${bottomTab === 'HISTORY' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Trade History</button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 bg-[#181a20]">
                <table className="w-full text-left text-white text-[11px]">
                   <thead className="text-gray-600 border-b border-white/5 uppercase font-black tracking-widest text-[9px]">
                     <tr><th className="p-2">Asset</th><th>Volume</th><th>Entry Price</th><th className="text-right p-2">{bottomTab === 'ASSETS' ? 'Floating P/L' : 'Closed Date'}</th></tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.03]">
                     {bottomTab === 'ASSETS' ? (
                       holdings.map((h: any) => {
                         const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                         const pl = currentVal - (h.qty * h.buyPrice);
                         return (
                           <tr key={h.id} className="hover:bg-white/[0.01] transition-colors">
                             <td className="p-2 font-black uppercase">{h.symbol} / USDT</td>
                             <td className="font-mono">{h.qty.toFixed(4)}</td>
                             <td className="text-gray-500 font-mono">${h.buyPrice.toLocaleString()}</td>
                             <td className={`text-right p-2 font-black font-mono text-[14px] ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                               {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
                             </td>
                           </tr>
                         );
                       })
                     ) : (
                       history.filter(h => h.marketType === MarketType.CRYPTO).map((h: any) => (
                         <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                           <td className="p-2 font-black uppercase">{h.symbol} / USDT</td>
                           <td className="font-mono">{h.volume.toFixed(4)}</td>
                           <td className={`font-black font-mono text-[14px] ${h.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                             {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                           </td>
                           <td className="text-right p-2 text-gray-500 font-mono">{new Date(h.timestamp).toLocaleDateString()}</td>
                         </tr>
                       ))
                     )}
                   </tbody>
                </table>
                {(bottomTab === 'ASSETS' ? holdings : history).length === 0 && <div className="text-center py-10 text-gray-700 font-black uppercase tracking-[0.3em] italic opacity-50">Empty Records Found</div>}
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