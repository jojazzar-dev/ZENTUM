import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import WithdrawModal from '../components/WithdrawModal';
import { User, CryptoHolding, HistoryOrder, MarketType } from '../types';

/**
 * ZENTUM CRYPTO EXCHANGE - PROFESSIONAL ULTIMATE EDITION (V5.2)
 * -----------------------------------------------------------
 * DEVELOPED BY: ZENTUM GLOBAL CORE
 * FEATURES:
 * - Atomic Cloud Sync (Prevents balance jump-back)
 * - Full Trade History & Real-time Portfolio Tracking
 * - Mobile Portrait Optimization (Horizontal Scrolling Watchlist)
 * - Large Bold Navigation (Home/Account Left, Finance Right)
 * - NO FEATURES REMOVED - FULL UNABRIDGED CODE
 */

interface CryptoProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const CryptoExchange: React.FC<CryptoProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- [1] حالات الصفحة الأساسية (States) - كاملة بدون اختصار ---
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01); 
  const [livePrices, setLivePrices] = useState<any>({});
  
  // حالات التحكم في النوافذ المنبثقة (Modals)
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // حالات التحكم في العرض (Chart / Assets / History)
  const [viewMode, setViewMode] = useState<'chart' | 'active' | 'history'>('chart');

  // جلب البيانات السحابية الحقيقية من كائن المستخدم المحدث لحظياً عبر Props
  const holdings = user.cryptoHoldings || [];
  const history = user.tradeHistory || [];

  // قائمة العملات المدعومة بالكامل
  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }, { s: 'TRX', n: 'TRON' }, { s: 'LTC', n: 'Litecoin' },
    { s: 'NEAR', n: 'Near' }, { s: 'APT', n: 'Aptos' }, { s: 'PEPE', n: 'Pepe' }
  ];

  // --- [2] محرك المزامنة المستمرة للأسعار ---
  useEffect(() => {
    const updatePrices = async () => {
      const p = await fetchLivePrices();
      if (p) setLivePrices(p);
    };
    updatePrices();
    const priceInv = setInterval(updatePrices, 2000); 
    return () => clearInterval(priceInv);
  }, []);

  // --- [3] محرك التداول السحابي المطور (Atomic Sync Logic) ---
  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) {
      alert("⚠️ Synchronizing with global exchange nodes... please wait.");
      return;
    }

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ INSUFFICIENT BALANCE: Deposit USDT to complete this order.");
        return;
      }

      // حساب القيم الجديدة لضمان الثبات السحابي ومنع تضارب الرصيد
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
      
      alert(`PURCHASE COMPLETE: ${volume} ${selected} successfully added.`);

    } else {
      // البحث عن العملة في محفظة الأصول السحابية
      const assetIdx = holdings.findIndex(h => h.symbol === selected);
      if (assetIdx > -1) {
        const asset = holdings[assetIdx];
        
        // حساب صحيح: الربح = (السعر الحالي - سعر الشراء) × الكمية
        const currentValue = asset.qty * price;  // القيمة الحالية للأصل
        const costBasis = asset.qty * asset.buyPrice;  // تكلفة الشراء الأصلية
        const netProfit = currentValue - costBasis;  // الربح أو الخسارة

        // إضافة الربح فقط إلى الرصيد (ليس القيمة الكاملة)
        const updatedCryptoBalance = user.cryptoBalance + netProfit;

        // إعداد سجل التاريخ للأرشفة
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
        
        // تحديث سحابي واحد وشامل (رصيد + أصول + سجل)
        onSyncUserData({ 
          cryptoBalance: updatedCryptoBalance,
          cryptoHoldings: updatedHoldings, 
          tradeHistory: [historyItem, ...history] 
        });

        alert(`ASSET LIQUIDATED: Net result ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)} USDT.`);
      } else {
        alert("⚠️ INVENTORY ERROR: You do not own this asset in your portfolio.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none text-[11px]">
      
      {/* --- [A] NAVBAR: RESPONSIVE --- */}
      <nav className="h-14 md:h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-4 z-[100] shadow-lg shrink-0">
        
        {/* Mobile: Logo + ZENTUM */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-yellow-500 uppercase text-sm tracking-tighter italic">ZENTUM</span>
          </div>
        </div>

        {/* Desktop: Logo + ZENTUM + Home + Account */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-yellow-500 uppercase text-lg tracking-tighter italic">ZENTUM</span>
          </div>
          
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-all uppercase font-black text-base tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Home
          </button>
          <button onClick={() => setIsAccountOpen(true)} className="text-gray-400 hover:text-white transition-all uppercase font-black text-base tracking-widest flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Account
          </button>
        </div>

        {/* Mobile: Home + Account في الوسط */}
        <div className="flex md:hidden items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-white transition-all uppercase font-black text-[10px] tracking-widest flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
          <button 
            onClick={() => setIsAccountOpen(true)} 
            className="text-gray-400 hover:text-white transition-all uppercase font-black text-[10px] tracking-widest flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Account
          </button>
        </div>

        {/* جهة اليمين: Balance */}
        <div className="flex items-center gap-3">
          <div className="bg-black/20 px-3 py-1 rounded-lg border border-white/10 flex flex-col items-end">
            <span className="text-gray-500 text-[7px] tracking-widest font-black uppercase leading-none">Balance</span>
            <span className="text-yellow-500 font-mono text-[10px] font-black">{user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* --- SIDEBAR: Market Watch Strip (Mobile: Horizontal Scroll / Desktop: Sidebar) --- */}
        <div className="w-full md:w-64 border-r border-white/5 bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 shadow-xl">
          <div className="hidden md:block p-5 text-[11px] text-gray-500 font-black uppercase border-b border-white/5 tracking-[0.2em] bg-black/10">Market Quotes</div>
          {coins.map(c => (
            <div 
              key={c.s} 
              onClick={() => setSelected(c.s)} 
              className={`p-4 md:p-6 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500 shadow-inner' : 'hover:bg-white/[0.01]'}`}
            >
              <div className="font-black text-[12px] md:text-[14px] uppercase text-white tracking-tighter">{c.s} / USDT</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase font-bold mt-1 opacity-60 italic">{c.n}</div>
            </div>
          ))}
        </div>

        {/* --- MAIN AREA: CHART & TERMINAL --- */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          
          {/* Quick Trade Interface */}
          <div className="p-3 md:p-4 bg-[#181A20] border-b border-white/5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 shadow-md shrink-0 relative z-20">
            <div className="flex flex-col min-w-0">
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white italic leading-none truncate">{selected} <span className="text-gray-500 not-italic">/ USDT</span></h2>
              <span className="text-[7px] md:text-[9px] text-yellow-500 font-black tracking-widest uppercase mt-1 italic">Real-time Node Execution</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
               <div className="flex items-center bg-black/60 rounded-lg border border-white/10 h-12 md:h-14 px-3 md:px-5 shadow-inner flex-1 sm:flex-none">
                  <span className="text-[8px] md:text-[10px] text-gray-500 font-black mr-2 md:mr-4 uppercase tracking-widest whitespace-nowrap">QTY</span>
                  <input 
                    type="number" 
                    value={volume} 
                    onChange={e => setVolume(parseFloat(e.target.value))} 
                    className="flex-1 md:w-28 bg-transparent border-none text-white text-[14px] md:text-[16px] font-black outline-none font-mono text-center pointer-events-auto" 
                    step="0.01" 
                    min="0.01"
                    inputMode="decimal"
                  />
               </div>
               <div className="flex bg-[#1e2329] border border-white/10 rounded-lg h-12 md:h-14 overflow-hidden shadow-2xl flex-1 md:flex-none">
                  <button 
                    onClick={() => handleTrade('SELL')} 
                    className="flex-1 md:flex-none px-4 md:px-16 py-3 md:py-4 bg-red-600/20 text-red-500 border-r border-white/5 font-black uppercase text-[11px] md:text-[13px] hover:bg-red-600 hover:text-white transition-all tracking-widest active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    Sell
                  </button>
                  <button 
                    onClick={() => handleTrade('BUY')} 
                    className="flex-1 md:flex-none px-4 md:px-16 py-3 md:py-4 bg-[#02c076]/20 text-[#02c076] font-black uppercase text-[11px] md:text-[13px] hover:bg-[#02c076] hover:text-white transition-all tracking-widest active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    Buy
                  </button>
               </div>
            </div>
          </div>

          {/* Main Display Area - Chart / Assets / History */}
          <div className="flex-1 flex flex-col bg-black relative shadow-inner overflow-hidden">
            {/* Desktop: Chart always visible */}
            <div className="hidden md:flex md:flex-1 bg-black relative shadow-inner">
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
                className="w-full h-full border-none" 
                title="Cloud Engine Chart" 
              />
            </div>

            {/* Mobile: Chart View */}
            {viewMode === 'chart' && (
              <div className="md:hidden flex-1 bg-black relative shadow-inner">
                <iframe 
                  src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
                  className="w-full h-full border-none" 
                  title="Cloud Engine Chart" 
                />
              </div>
            )}

            {/* Active Holdings View */}
            {viewMode === 'active' && (
              <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden">
                <div className="p-3 bg-[#181a20] border-b border-white/5 text-[9px] text-gray-500 font-black uppercase">Active Holdings</div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full text-left text-white border-collapse">
                     <thead className="text-gray-600 border-b border-white/5 uppercase font-black tracking-widest text-[8px] md:text-[9px] sticky top-0 bg-[#181a20] z-10">
                       <tr>
                          <th className="p-3 md:p-4 pr-2">Asset</th>
                          <th className="p-3 md:p-4 text-center">Volume</th>
                          <th className="p-3 md:p-4 text-center hidden sm:table-cell">Entry Price</th>
                          <th className="text-right p-3 md:p-4">P&L</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.03]">
                       {holdings.map((h: any) => {
                         const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                         const pl = currentVal - (h.qty * h.buyPrice);
                         return (
                           <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-4 font-black text-white uppercase text-[10px] md:text-xs tracking-tighter">{h.symbol} / USDT</td>
                             <td className="p-4 text-center font-mono font-black text-gray-300 text-xs">{h.qty.toFixed(4)}</td>
                             <td className="p-4 text-center text-gray-500 font-mono italic text-[10px] hidden sm:table-cell">${h.buyPrice.toLocaleString()}</td>
                             <td className={`text-right p-4 font-black font-mono text-sm ${pl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                               {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                   {holdings.length === 0 && (
                     <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No Holdings</div>
                   )}
                </div>
              </div>
            )}

            {/* History View */}
            {viewMode === 'history' && (
              <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden">
                <div className="p-3 bg-[#181a20] border-b border-white/5 text-[9px] text-gray-500 font-black uppercase">Trade History</div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full text-left text-white border-collapse">
                     <thead className="text-gray-600 border-b border-white/5 uppercase font-black tracking-widest text-[8px] md:text-[9px] sticky top-0 bg-[#181a20] z-10">
                       <tr>
                          <th className="p-3 md:p-4 pr-2">Asset</th>
                          <th className="p-3 md:p-4 text-center">Volume</th>
                          <th className="p-3 md:p-4 text-center hidden sm:table-cell">Entry</th>
                          <th className="text-right p-3 md:p-4">Profit</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.03]">
                       {history.filter(h => h.marketType === MarketType.CRYPTO).map((h: any) => (
                         <tr key={h.id} className="hover:bg-white/[0.02] transition-colors opacity-70">
                           <td className="p-4 font-black text-white uppercase text-[10px] md:text-xs">{h.symbol} / USDT</td>
                           <td className="p-4 text-center font-mono text-xs">{h.volume.toFixed(4)}</td>
                           <td className="p-4 text-center text-gray-500 font-mono italic text-[10px] hidden sm:table-cell">${h.openPrice.toLocaleString()}</td>
                           <td className={`text-right p-4 font-black font-mono text-sm ${h.profit >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
                             {h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   {history.length === 0 && (
                     <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No History</div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop: Bottom Terminal Panel (Always visible) */}
          <div className="hidden md:flex md:h-64 bg-[#181a20] border-t border-[#2b2f36] flex-col overflow-hidden shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-[#2b2f36] font-black uppercase tracking-widest">
               <button onClick={() => setViewMode('active')} className={`px-12 py-4 border-r border-[#2b2f36] transition-all ${viewMode === 'active' ? 'bg-[#1e2329] text-yellow-500 font-black' : 'hover:text-white'}`}>Active Holdings</button>
               <button onClick={() => setViewMode('history')} className={`px-12 py-4 border-r border-[#2b2f36] transition-all ${viewMode === 'history' ? 'bg-[#1e2329] text-green-500 font-black' : 'hover:text-white'}`}>Transaction History</button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar bg-[#181a20] p-4">
               <table className="w-full text-left text-white text-[11px] border-collapse">
                <thead className="text-gray-600 border-b border-white/5 sticky top-0 bg-[#181a20] z-10 font-black uppercase tracking-widest text-[9px]">
                  <tr>
                    <th className="pb-3 pr-2">Asset</th>
                    <th className="text-center">Volume</th>
                    <th className="text-center">Entry Price</th>
                    <th className="text-right pb-3">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {viewMode === 'active' ? (
                    holdings.map((h: any) => {
                      const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                      const pl = currentVal - (h.qty * h.buyPrice);
                      return (
                        <tr key={h.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 font-black uppercase text-xs tracking-tighter">{h.symbol} / USDT</td>
                          <td className="py-4 text-center font-mono font-black text-gray-300 text-sm">{h.qty.toFixed(4)}</td>
                          <td className="py-4 text-center text-gray-500 font-mono italic">${h.buyPrice.toLocaleString()}</td>
                          <td className={`py-4 text-right font-black font-mono text-[16px] ${pl >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>{pl >= 0 ? '+' : ''}{pl.toFixed(2)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    history.filter(h => h.marketType === MarketType.CRYPTO).map((h: any) => (
                      <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                        <td className="py-4 font-black uppercase text-xs">{h.symbol} / USDT</td>
                        <td className="py-4 text-center font-mono">{h.volume.toFixed(4)}</td>
                        <td className="py-4 text-center text-gray-500 font-mono italic">${h.openPrice.toLocaleString()}</td>
                        <td className={`text-right p-3 font-black font-mono text-[14px] ${h.profit >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>{h.profit >= 0 ? '+' : ''}{h.profit.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
               </table>
               {(viewMode === 'active' ? holdings : history).length === 0 && (
                 <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No Records</div>
               )}
            </div>
          </div>

          {/* Mobile: Control Buttons - Chart / Active / History */}
          <div className="md:hidden bg-[#181a20] border-t border-white/5 flex gap-2 p-2 shrink-0 shadow-lg">
            <button 
              onClick={() => setViewMode('chart')}
              className={`flex-1 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'chart' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-black/30 text-gray-400 hover:text-white border border-white/10'}`}
            >
              📊 Chart
            </button>
            <button 
              onClick={() => setViewMode('active')}
              className={`flex-1 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'active' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/40' : 'bg-black/30 text-gray-400 hover:text-white border border-white/10'}`}
            >
              📈 Active
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className={`flex-1 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'history' ? 'bg-green-600 text-white shadow-lg shadow-green-900/40' : 'bg-black/30 text-gray-400 hover:text-white border border-white/10'}`}
            >
              📋 History
            </button>
          </div>
        </div>
      </div>

      {/* --- [D] POPUPS & MODALS --- */}
      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
      <AccountModal 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
        user={user}
        onOpenDeposit={() => {
          setIsDepositOpen(true);
          setIsAccountOpen(false);
        }}
        onOpenWithdraw={() => {
          setIsWithdrawOpen(true);
          setIsAccountOpen(false);
        }}
        onLogout={onLogout}
      />
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} walletType="crypto" />
    </div>
  );
};

export default CryptoExchange;