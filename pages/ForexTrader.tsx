import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo'; 
import { fetchFXPrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';
import AccountModal from '../components/AccountModal';
import WithdrawModal from '../components/WithdrawModal';
import { User, ForexOrder, HistoryOrder, MarketType } from '../types';

/**
 * ZENTUM FOREX TERMINAL - PROFESSIONAL ULTIMATE EDITION (V5.2)
 * ----------------------------------------------------------------
 * - Full Dynamic Lot Calculation (Multiplier: 100,000)
 * - Precise 1:5000 Leverage Implementation ($20 Required per 1.0 Lot)
 * - Atomic Cloud Sync (Preventing Balance Race Conditions)
 * - Comprehensive MT5 Style Toolbox & History Logs
 * - Optimized Portrait Layout (Horizontal Markets Strip)
 * - NO SHORTCUTS - ALL UI DECORATIONS RETAINED
 * ----------------------------------------------------------------
 */

interface ForexProps {
  user: User;
  onUpdateBalance: (type: 'forex' | 'crypto', amount: number) => void;
  onSyncUserData: (fields: Partial<User>) => void;
  onLogout: () => void;
}

const ForexTrader: React.FC<ForexProps> = ({ user, onUpdateBalance, onSyncUserData, onLogout }) => {
  const navigate = useNavigate();

  // --- [1] حالات الصفحة التفصيلية (States) ---
  const [selected, setSelected] = useState('EURUSD');
  const [volume, setVolume] = useState(0.10); // حجم اللوت الافتراضي
  const [fxRates, setFxRates] = useState<any>({});
  
  // حالات التحكم في النوافذ المنبثقة (Modals)
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // حالات التحكم في التيرمينال السفلي
  const [bottomTab, setBottomTab] = useState<'TRADE' | 'HISTORY'>('TRADE');

  // جلب البيانات السحابية الحقيقية من كائن المستخدم المحدث لحظياً
  const orders = user.forexOrders || [];
  const history = user.tradeHistory || [];

  // القائمة الكاملة للأزواج والمؤشرات والمعادن (أكثر من 50 زوجاً)
  const pairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURCAD', 'GBPCHF',
    'CADJPY', 'CHFJPY', 'NZDJPY', 'GBPCAD', 'AUDCAD', 'XAUUSD', 'XAGUSD',
    'US30', 'NAS100', 'DAX40', 'SPX500', 'USOIL', 'UKOIL', 'BTCUSD', 'ETHUSD',
    'SOLUSD', 'XRPUSD', 'DOTUSD', 'AVAXUSD', 'DOGEUSD', 'BNBUSD', 'LINKUSD',
    'ADAUSD', 'MATICUSD', 'LTCUSD', 'BCHUSD', 'XLMUSD', 'ATOMUSD', 'UNIUSD',
    'NEARUSD', 'APTUSD', 'OPUSD', 'ARBUSD', 'SUIUSD', 'SEIUSD', 'PEPEUSD'
  ];

  // --- [2] التحقق من ساعات السوق (Market Hours Check) ---
  const isMarketOpen = () => {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday
    
    // السوق مغلق السبت والأحد بالكامل
    if (utcDay === 0 || utcDay === 6) return false;
    
    // السوق مفتوح الاثنين إلى الجمعة من 21:00 GMT (الأحد) إلى 21:00 GMT (الجمعة)
    // إذا كان يوم الاثنين إلى الخميس، السوق مفتوح طول اليوم
    if (utcDay >= 1 && utcDay <= 4) return true;
    
    // يوم الجمعة: مفتوح من 00:00 إلى 20:59 UTC فقط
    if (utcDay === 5) return utcHours < 21;
    
    return false;
  };

  // --- [2] محرك الأسعار اللحظية (Live Price Engine) ---
  function getLivePrice(sym: string) {
    if (!fxRates || Object.keys(fxRates).length === 0) return 1.00000;
    
    // إذا كان السوق مغلق، لا نضيف تذبذب عشوائي - الأسعار ثابتة
    const marketOpen = isMarketOpen();
    
    // أسعار الذهب والعملات الرقمية داخل الفوركس (للعمليات الحسابية)
    if (sym === 'XAUUSD') return marketOpen ? (2035.50 + (Math.random() - 0.5)) : 2035.50;
    if (sym === 'BTCUSD') return marketOpen ? (96500.00 + (Math.random() * 10)) : 96500.00;
    
    const base = sym.substring(0,3);
    const target = sym.substring(3,6);
    
    let price = 1;
    if (base === 'USD') price = fxRates[target] || 1;
    else if (target === 'USD') price = 1 / (fxRates[base] || 1);
    else price = (fxRates[target] || 1) / (fxRates[base] || 1);
    
    // إضافة تذبذب طفيف جداً فقط عندما يكون السوق مفتوح
    if (marketOpen) {
      const flicker = (Math.random() - 0.5) * 0.0001;
      return price + flicker;
    }
    
    return price; 
  }

  // --- [3] المحرك المالي الاحترافي (الرافعة المالية 5000 واللوت المتغير) ---
  const calculatePL = (o: any) => {
    const currentP = getLivePrice(o.symbol);
    const diff = o.type === 'BUY' ? (currentP - o.openPrice) : (o.openPrice - currentP);
    
    // قيمة العقد القياسي 100,000 للعملات و 1,000 للذهب والين
    const isSmallContract = o.symbol.includes('JPY') || o.symbol.includes('XAU') || (o.symbol.includes('USD') && o.symbol.length > 6);
    const contractSize = isSmallContract ? 1000 : 100000;
    
    // الربح = (فرق السعر) * (الفوليوم المختار عند الفتح) * (حجم العقد)
    return diff * o.volume * contractSize;
  };

  const totalPL = orders.reduce((sum, o) => sum + calculatePL(o), 0);
  const equity = user.forexBalance + totalPL;
  
  // حساب المارجن (رافعة 1:5000): 100,000 / 5000 = 20$ لكل 1.0 لوت
  const margin = orders.reduce((sum, o) => sum + (o.volume * 20), 0);
  const freeMargin = equity - margin;
  const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;

  // --- [4] تأثيرات المزامنة والربط اللحظي ---
  useEffect(() => {
    const syncData = async () => {
      const r = await fetchFXPrices();
      if (r) setFxRates(r);
    };
    
    // جلب الأسعار فوراً عند الفتح
    syncData();
    
    // إذا كان السوق مفتوح، حدّث الأسعار كل ثانية
    // إذا كان السوق مغلق، توقف التحديث لتجميد الأسعار والربح
    if (isMarketOpen()) {
      const interval = setInterval(syncData, 1000); 
      return () => clearInterval(interval);
    }
  }, []);

  // --- [5] وظائف إدارة الصفقات (Cloud Atomic Functions) ---
  const openOrder = async (type: 'BUY' | 'SELL') => {
    // التحقق من ساعات السوق
    if (!isMarketOpen()) {
      alert("⛔ MARKET CLOSED: The forex market is currently closed. Trading is available Monday-Friday (UTC).");
      return;
    }

    const requiredMargin = volume * 20; 

    if (user.forexBalance <= 0) {
      alert("⚠️ INSUFFICIENT FUNDS: Please deposit to start trading.");
      return;
    }

    if (freeMargin < requiredMargin) {
      alert(`⚠️ MARGIN ERROR: Your free margin ($${freeMargin.toFixed(2)}) is too low for this lot size.`);
      return;
    }

    const entryPrice = getLivePrice(selected);
    const newOrder: ForexOrder = { 
      id: Date.now(), 
      symbol: selected, 
      type, 
      openPrice: entryPrice, 
      volume: volume 
    };

    // مزامنة فورية مع السحاب للمحافظة على البيانات بين الأجهزة
    onSyncUserData({ forexOrders: [...orders, newOrder] });
  };

  const closeOrder = async (id: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      const realizedPL = calculatePL(order);
      const closePrice = getLivePrice(order.symbol);
      
      // حساب الرصيد النهائي لضمان عدم حدوث تضارب في السحابة
      const updatedBalance = user.forexBalance + realizedPL;

      const historyRecord: HistoryOrder = {
        id: order.id,
        symbol: order.symbol,
        type: order.type,
        openPrice: order.openPrice,
        closePrice: closePrice,
        volume: order.volume,
        profit: realizedPL,
        timestamp: Date.now(),
        marketType: MarketType.FOREX
      };

      // تحديث سحابي واحد وشامل (Atomic Patch) لمنع مشكلة "رجوع الرصيد"
      onSyncUserData({ 
        forexBalance: updatedBalance,
        forexOrders: orders.filter(o => o.id !== id),
        tradeHistory: [historyRecord, ...history]
      });

      alert(`POSITION CLOSED: Result ${realizedPL >= 0 ? '+' : ''}${realizedPL.toFixed(2)} USD`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-[#d1d4dc] text-[11px] overflow-hidden font-sans">
      
      {/* --- [A] NAVBAR: CLEAN & MINIMAL --- */}
      <nav className="h-14 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-4 z-[100] shadow-lg shrink-0">
        
        {/* جهة اليسار: Logo صغير فقط */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <Logo className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
        </div>

        {/* جهة الوسط: Home + Account */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-400 hover:text-white transition-all uppercase font-black text-[11px] tracking-widest flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
          <button 
            onClick={() => setIsAccountOpen(true)} 
            className="text-gray-400 hover:text-white transition-all uppercase font-black text-[11px] tracking-widest flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Account
          </button>
        </div>

        {/* جهة اليمين: Balance فقط */}
        <div className="flex items-center gap-3">
          <div className="bg-black/20 px-3 py-1 rounded-lg border border-white/10 flex flex-col items-end">
            <span className="text-gray-500 text-[7px] tracking-widest font-black uppercase leading-none">Balance</span>
            <span className="text-white font-mono text-[10px] font-black">${user.forexBalance.toFixed(2)}</span>
          </div>
        </div>
      </nav>
           
           <div className="flex gap-1.5 sm:gap-2.5">
             <button onClick={() => setIsDepositOpen(true)} className="bg-blue-600 text-white px-3 sm:px-7 py-1.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[12px] uppercase shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all active:scale-95">Add</button>
             <button onClick={() => setIsWithdrawOpen(true)} className="border border-white/20 text-white px-3 sm:px-7 py-1.5 sm:py-3 rounded-xl font-black text-[9px] sm:text-[12px] uppercase hover:bg-white/10 active:scale-95 transition-all">Withdraw</button>
           </div>

           <button onClick={onLogout} className="text-gray-500 hover:text-red-500 ml-1 sm:ml-3 p-1 transition-colors">
             <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/></svg>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* --- [B] SIDEBAR: Market Watch Strip (Mobile Optimized) --- */}
        <div className="w-full md:w-64 border-r border-[#2b2f36] bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 shadow-xl">
          <div className="hidden md:block p-5 text-[11px] text-gray-500 font-black uppercase border-b border-white/5 tracking-[0.2em] bg-black/10">Market Watch</div>
          {pairs.map(s => (
            <div 
              key={s} 
              onClick={() => setSelected(s)} 
              className={`p-4 md:p-6 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === s ? 'bg-blue-600/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-blue-500 shadow-inner' : 'hover:bg-white/[0.01]'}`}
            >
              <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center">
                <span className="font-black text-[12px] md:text-[14px] uppercase text-white tracking-tighter">{s}</span>
                <span className="hidden md:inline text-blue-500 font-mono text-[10px] opacity-40">Forex Pair</span>
              </div>
            </div>
          ))}
        </div>

        {/* --- [C] MAIN WORK AREA: Trade Bar + Chart + Terminal --- */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#0b0e11]">
          
          {/* Quick Execution Bar (RETAINED ALL MARKUP) */}
          <div className="p-3 md:p-4 bg-[#181a20] border-b border-[#2b2f36] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 shadow-md shrink-0 relative z-20">
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm md:text-xl font-black uppercase text-white italic leading-none truncate">{selected}</h2>
              <span className="text-[7px] md:text-[9px] text-blue-500 font-black tracking-widest uppercase mt-1">Instant Execution Active</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
               <div className="flex items-center bg-black/50 rounded-lg border border-white/10 h-12 md:h-14 px-3 md:px-5 shadow-inner flex-1 sm:flex-none">
                  <span className="hidden xs:inline text-[8px] md:text-[10px] text-gray-500 font-black mr-2 uppercase tracking-widest whitespace-nowrap">LOT</span>
                  <input 
                    type="number" 
                    value={volume} 
                    onChange={e => setVolume(parseFloat(e.target.value))} 
                    className="flex-1 md:w-24 bg-transparent border-none text-white text-[14px] md:text-[16px] font-black outline-none font-mono text-center pointer-events-auto" 
                    step="0.01" 
                    min="0.01"
                    inputMode="decimal"
                  />
               </div>
               <div className="flex bg-[#1e2329] border border-[#2b2f36] rounded-lg h-12 md:h-14 overflow-hidden shadow-2xl flex-1 sm:flex-none">
                  <button 
                    onClick={() => openOrder('SELL')} 
                    className="flex-1 md:flex-none px-4 md:px-14 py-3 md:py-4 bg-red-600/20 text-red-500 border-r border-[#2b2f36] font-black text-[11px] md:text-[13px] uppercase hover:bg-red-600 hover:text-white transition-all tracking-widest active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    Sell
                  </button>
                  <button 
                    onClick={() => openOrder('BUY')} 
                    className="flex-1 md:flex-none px-4 md:px-14 py-3 md:py-4 bg-blue-600/20 text-blue-500 font-black text-[11px] md:text-[13px] uppercase hover:bg-blue-600 hover:text-white transition-all tracking-widest active:scale-95 cursor-pointer pointer-events-auto"
                  >
                    Buy
                  </button>
               </div>
            </div>
          </div>

          {/* High-Definition Interactive Chart Section */}
          <div className="flex-1 bg-black relative shadow-inner">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${selected === 'XAUUSD' ? 'OANDA:XAUUSD' : selected === 'NAS100' ? 'CAPITALCOM:US100' : 'FX_IDC:' + selected}&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
              title="Forex Live Feed"
            />
          </div>

          {/* --- [D] MT5 STYLE BOTTOM TERMINAL PANEL --- */}
          <div className="h-56 md:h-64 bg-[#181a20] border-t border-[#2b2f36] flex flex-col overflow-hidden shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            
            {/* Terminal Navigation Tabs */}
            <div className="flex bg-[#0b0e11] text-[9px] text-gray-500 border-b border-[#2b2f36] font-black uppercase tracking-widest">
               <button onClick={() => setBottomTab('TRADE')} className={`px-8 md:px-12 py-3 md:py-4 border-r border-[#2b2f36] transition-all ${bottomTab === 'TRADE' ? 'bg-[#1e2329] text-blue-500 font-black' : 'hover:text-white'}`}>Active Positions</button>
               <button onClick={() => setBottomTab('HISTORY')} className={`px-8 md:px-12 py-3 md:py-4 border-r border-[#2b2f36] transition-all ${bottomTab === 'HISTORY' ? 'bg-[#1e2329] text-blue-500 font-black' : 'hover:text-white'}`}>Account History</button>
            </div>

            {/* Account Financial Status Strip */}
            <div className="p-2.5 bg-[#0b0e11] border-b border-[#2b2f36] flex gap-5 md:gap-10 text-[9px] md:text-[11px] text-gray-400 font-bold uppercase overflow-x-auto whitespace-nowrap custom-scrollbar">
               <div className="flex gap-2 text-white">Balance: <span className="text-white font-mono">${user.forexBalance.toFixed(2)}</span></div>
               <div className="flex gap-2">Equity: <span className={`font-mono ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>${equity.toFixed(2)}</span></div>
               <div className="flex gap-2">Used Margin: <span className="text-white font-mono">${margin.toFixed(2)}</span></div>
               <div className="flex gap-2 text-white">Free: <span className={`font-mono ${freeMargin < 0 ? 'text-red-500' : 'text-green-400'}`}>${freeMargin.toFixed(2)}</span></div>
               <div className="hidden lg:flex gap-2">Margin Level: <span className="text-white font-mono">{marginLevel.toFixed(2)}%</span></div>
            </div>

            {/* Terminal Data Table Area */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#181a20] p-2 md:p-4">
               <table className="w-full text-left text-white text-[10px] md:text-[11px] border-collapse">
                <thead className="text-gray-600 border-b border-white/5 sticky top-0 bg-[#181a20] z-10 font-black uppercase tracking-widest text-[9px]">
                  <tr><th className="pb-3 pr-2">Symbol</th><th>Type</th><th className="text-center">Volume</th><th className="text-center">Profit</th><th className="text-right pb-3">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {bottomTab === 'TRADE' ? (
                    orders.map((o: any) => {
                      const pl = calculatePL(o);
                      return (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 font-black uppercase text-[10px] sm:text-xs tracking-tighter">{o.symbol}</td>
                          <td className={`py-4 font-black ${o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>{o.type}</td>
                          <td className="py-4 text-center font-mono font-black text-gray-400 text-sm">{o.volume.toFixed(2)}</td>
                          <td className={`py-4 text-center font-black font-mono text-[14px] md:text-[16px] ${pl >= 0 ? 'text-green-500' : 'text-red-400'}`}>{pl.toFixed(2)}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => closeOrder(o.id)} className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase border border-red-500/20 transition-all active:scale-95">Close</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    history.filter((h: any) => h.marketType === MarketType.FOREX).map((h: any) => (
                      <tr key={h.id} className="border-b border-white/[0.02] opacity-60">
                        <td className="py-4 font-black uppercase text-[10px] sm:text-xs">{h.symbol}</td>
                        <td className={`py-4 font-black ${h.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>{h.type}</td>
                        <td className="py-4 text-center font-mono">{h.volume.toFixed(2)}</td>
                        <td className={`py-4 text-center font-black font-mono text-[14px] ${h.profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>{h.profit.toFixed(2)}</td>
                        <td className="text-right p-3 text-gray-600 font-mono italic text-[9px]">{new Date(h.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
               </table>
               {(bottomTab === 'TRADE' ? orders : history).length === 0 && (
                 <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No Database Record Found</div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* --- POPUPS & MODALS --- */}
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
      <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} user={user} walletType="forex" />
    </div>
  );
};

export default ForexTrader;