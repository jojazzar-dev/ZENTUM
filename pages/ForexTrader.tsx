import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchFXPrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import { User, ForexOrder, HistoryOrder, MarketType } from '../types';

interface ForexProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const ForexTrader: React.FC<ForexProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('EURUSD');
  const [volume, setVolume] = useState(0.10);
  const [fxRates, setFxRates] = useState<any>({});
  
  // حالات التحكم في النوافذ المنبثقة
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // تبويبات المستطيل السفلي (Trade / History)
  const [bottomTab, setBottomTab] = useState<'TRADE' | 'HISTORY'>('TRADE');

  // جلب البيانات مباشرة من السحابة (عبر الـ Props المحدثة لحظياً)
  const orders = user.forexOrders || [];
  const history = user.tradeHistory || [];

  const pairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'XAUUSD', 'NAS100', 'US30'
  ];

  function getLivePrice(sym: string) {
    if (!fxRates || Object.keys(fxRates).length === 0) return 1.00;
    if (sym === 'XAUUSD') return 2035.50 + (Math.random() - 0.5);
    const base = sym.substring(0,3); const target = sym.substring(3,6);
    let price = (fxRates[target] || 1) / (fxRates[base] || 1);
    return price + (Math.random() - 0.5) * 0.0001; 
  }

  const calculatePL = (o: any) => {
    const currentP = getLivePrice(o.symbol);
    const diff = o.type === 'BUY' ? (currentP - o.openPrice) : (o.openPrice - currentP);
    const multiplier = o.symbol.includes('JPY') || o.symbol.includes('XAU') ? 100 : 10000;
    return diff * o.volume * multiplier;
  };

  const totalPL = orders.reduce((sum, o) => sum + calculatePL(o), 0);
  const equity = user.forexBalance + totalPL;
  const margin = orders.length * 200;
  const freeMargin = equity - margin;

  useEffect(() => {
    const sync = async () => {
      const r = await fetchFXPrices();
      if (r) setFxRates(r);
    };
    sync();
    const inv = setInterval(sync, 1000);
    return () => clearInterval(inv);
  }, []);

  const openOrder = async (type: 'BUY' | 'SELL') => {
    const requiredMargin = volume * 200;
    if (user.forexBalance <= 0) return alert("⚠️ Account balance is 0.00! Please deposit funds.");
    if (freeMargin < requiredMargin) return alert(`⚠️ Insufficient Margin!`);

    const price = getLivePrice(selected);
    const newOrder: ForexOrder = { id: Date.now(), symbol: selected, type, openPrice: price, volume };
    
    // مزامنة الصفقة الجديدة مع السحاب
    onSyncUserData({ forexOrders: [...orders, newOrder] });
  };

  const closeOrder = async (id: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      const currentPL = calculatePL(order);
      const closePrice = getLivePrice(order.symbol);

      // إنشاء كائن الصفقة التاريخية للأرشفة
      const closedTrade: HistoryOrder = {
        id: order.id,
        symbol: order.symbol,
        type: order.type,
        openPrice: order.openPrice,
        closePrice: closePrice,
        volume: order.volume,
        profit: currentPL,
        timestamp: Date.now(),
        marketType: MarketType.FOREX
      };

      // 1. تحديث الرصيد (إضافة/خصم الربح)
      onUpdateBalance('forex', currentPL);

      // 2. تحديث المصفوفات (حذف من النشطة وإضافة للسجل التاريخي)
      onSyncUserData({ 
        forexOrders: orders.filter(o => o.id !== id),
        tradeHistory: [closedTrade, ...history]
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-[#d1d4dc] text-[11px] overflow-hidden font-sans select-none">
      
      {/* --- Navbar المطور والشامل --- */}
      <nav className="h-16 border-b border-[#2b2f36] bg-[#181a20] flex items-center justify-between px-4 z-[100]">
        
        {/* جهة اليسار: Logo + Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="w-8 h-8" />
            <span className="font-bold text-white uppercase text-sm tracking-widest">ZENTUM</span>
          </div>
          
          <div className="flex items-center gap-5">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[11px] tracking-widest flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Home
            </button>
            <button onClick={() => setIsAccountOpen(true)} className="text-gray-400 hover:text-white transition-all uppercase font-black text-[11px] tracking-widest flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Account
            </button>
          </div>
        </div>

        {/* جهة اليمين: المالية + الخروج */}
        <div className="flex gap-4 items-center">
           <div className="bg-black/40 px-3 py-1.5 rounded border border-white/5 font-bold uppercase text-[10px]">
              <span className="text-gray-500 mr-2 uppercase text-[8px]">Equity:</span>
              <span className="text-white font-mono">${equity.toFixed(2)}</span>
           </div>
           
           <div className="flex gap-2">
             <button onClick={() => setIsDepositOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase shadow-lg hover:bg-blue-500 transition-all">Add Funds</button>
             <button onClick={() => alert("Withdrawal request pending admin review.")} className="border border-white/20 text-white px-5 py-2 rounded-xl font-black text-[11px] uppercase hover:bg-white/10 transition-all">Withdraw</button>
           </div>

           <button onClick={onLogout} className="text-gray-500 hover:text-red-500 ml-2 p-2 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Market Watch - Mobile Friendly Scroll */}
        <div className="w-full md:w-60 border-r border-[#2b2f36] bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar">
          {pairs.map(s => (
            <div key={s} onClick={() => setSelected(s)} className={`p-3 md:p-4 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === s ? 'bg-blue-600/20 border-l-4 border-l-blue-500' : 'hover:bg-white/5'}`}>
              <span className="font-bold text-[11px] md:text-sm uppercase text-white">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Trade Control Bar */}
          <div className="p-3 bg-[#181a20] border-b border-[#2b2f36] flex justify-between items-center gap-2">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">{selected}</h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-black rounded-xl border border-white/10 h-10 px-3">
                  <span className="text-[9px] text-gray-500 font-black mr-2 uppercase tracking-widest">Lot Size</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-16 bg-transparent border-none text-white text-xs font-bold outline-none" step="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-[#2b2f36] rounded-xl h-10 overflow-hidden shadow-2xl">
                  <button onClick={() => openOrder('SELL')} className="px-8 bg-red-600/20 text-red-500 border-r border-[#2b2f36] font-black text-[11px] uppercase hover:bg-red-600 transition-all">Sell</button>
                  <button onClick={() => openOrder('BUY')} className="px-8 bg-blue-600/20 text-blue-500 font-black text-[11px] uppercase hover:bg-blue-600 transition-all">Buy</button>
               </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 bg-black relative min-h-[300px]">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${selected === 'XAUUSD' ? 'OANDA:XAUUSD' : selected === 'NAS100' ? 'CAPITALCOM:US100' : 'FX_IDC:' + selected}&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} className="w-full h-full border-none" />
          </div>

          {/* --- MT5 Bottom Terminal (Trade & History) --- */}
          <div className="h-48 md:h-52 bg-[#181a20] border-t border-[#2b2f36] flex flex-col overflow-hidden shrink-0">
            {/* Tabs Selector */}
            <div className="flex bg-[#1e2329] text-[9px] text-gray-500 border-b border-[#2b2f36] font-black uppercase tracking-widest">
               <button onClick={() => setBottomTab('TRADE')} className={`px-8 py-3 border-r border-[#2b2f36] transition-all ${bottomTab === 'TRADE' ? 'bg-[#2b2f36] text-white font-bold' : 'hover:text-white'}`}>Active Trade</button>
               <button onClick={() => setBottomTab('HISTORY')} className={`px-8 py-3 border-r border-[#2b2f36] transition-all ${bottomTab === 'HISTORY' ? 'bg-[#2b2f36] text-white font-bold' : 'hover:text-white'}`}>Trade History</button>
            </div>

            {/* Account Stats Bar */}
            <div className="p-2 bg-[#0b0e11] border-b border-[#2b2f36] flex gap-5 text-[10px] text-gray-400 font-bold uppercase overflow-x-auto whitespace-nowrap scrollbar-hide">
               <div>Balance: <span className="text-white">${user.forexBalance.toFixed(2)}</span></div>
               <div className={totalPL >= 0 ? 'text-green-400' : 'text-red-400'}>Equity: <span className="text-white">${equity.toFixed(2)}</span></div>
               <div>Used Margin: <span className="text-white">${margin.toFixed(2)}</span></div>
               <div>Free Margin: <span className={`font-bold ${freeMargin < 0 ? 'text-red-500' : 'text-green-400'}`}>${freeMargin.toFixed(2)}</span></div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-2">
               <table className="w-full text-left text-white text-[10px]">
                <thead className="text-gray-500 border-b border-white/5 sticky top-0 bg-[#181a20]">
                  <tr><th className="p-2 font-black uppercase tracking-widest">Symbol</th><th>Type</th><th>Result</th><th className="text-right p-2">{bottomTab === 'TRADE' ? 'Close' : 'Date'}</th></tr>
                </thead>
                <tbody>
                  {bottomTab === 'TRADE' ? (
                    orders.map((o: any) => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-2 font-bold uppercase">{o.symbol}</td>
                        <td className={o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{o.type}</td>
                        <td className={`font-bold font-mono ${calculatePL(o) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calculatePL(o).toFixed(2)}</td>
                        <td className="text-right p-2"><button onClick={() => closeOrder(o.id)} className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg font-black text-[10px] uppercase">Close</button></td>
                      </tr>
                    ))
                  ) : (
                    history.filter(h => h.marketType === MarketType.FOREX).map((h: any) => (
                      <tr key={h.id} className="border-b border-white/5 opacity-60">
                        <td className="p-2 font-bold uppercase">{h.symbol}</td>
                        <td className={h.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{h.type}</td>
                        <td className={`font-black font-mono ${h.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{h.profit.toFixed(2)}</td>
                        <td className="text-right p-2 text-gray-500 font-mono">{new Date(h.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
               </table>
               {(bottomTab === 'TRADE' ? orders : history).length === 0 && <div className="text-center py-6 text-gray-700 uppercase font-black tracking-widest italic text-[9px]">No cloud records found</div>}
            </div>
          </div>
        </div>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} user={user} />
    </div>
  );
};

export default ForexTrader;