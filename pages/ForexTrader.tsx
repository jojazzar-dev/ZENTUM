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
  
  // حالات التحكم في العرض (Chart / Active Positions / History)
  const [viewMode, setViewMode] = useState<'chart' | 'active' | 'history'>('chart');

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

          {/* Main Display Area - Chart / Active Positions / History */}
          <div className="flex-1 bg-black relative shadow-inner overflow-hidden">
            {/* Chart View */}
            {viewMode === 'chart' && (
              <iframe 
                src={`https://s.tradingview.com/widgetembed/?symbol=${selected === 'XAUUSD' ? 'OANDA:XAUUSD' : selected === 'NAS100' ? 'CAPITALCOM:US100' : 'FX_IDC:' + selected}&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
                className="w-full h-full border-none" 
                title="Forex Live Feed"
              />
            )}

            {/* Active Positions View */}
            {viewMode === 'active' && (
              <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden">
                {/* Financial Stats */}
                <div className="p-3 bg-[#181a20] border-b border-[#2b2f36] flex gap-4 md:gap-8 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase overflow-x-auto whitespace-nowrap">
                   <div className="flex gap-2 text-white">Balance: <span className="text-white font-mono font-black">${user.forexBalance.toFixed(2)}</span></div>
                   <div className="flex gap-2">Equity: <span className={`font-mono font-black ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>${equity.toFixed(2)}</span></div>
                   <div className="flex gap-2">Used Margin: <span className="text-white font-mono font-black">${margin.toFixed(2)}</span></div>
                   <div className="flex gap-2 text-white">Free: <span className={`font-mono font-black ${freeMargin < 0 ? 'text-red-500' : 'text-green-400'}`}>${freeMargin.toFixed(2)}</span></div>
                </div>

                {/* Active Orders Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full text-left text-white text-[10px] md:text-[11px] border-collapse">
                    <thead className="text-gray-600 border-b border-white/5 sticky top-0 bg-[#181a20] z-10 font-black uppercase tracking-widest text-[9px]">
                      <tr><th className="p-3 pr-2">Symbol</th><th>Type</th><th className="text-center">Volume</th><th className="text-center">P/L</th><th className="text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {orders.map((o: any) => {
                        const pl = calculatePL(o);
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-black uppercase text-xs tracking-tighter">{o.symbol}</td>
                            <td className={`p-4 font-black ${o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>{o.type}</td>
                            <td className="p-4 text-center font-mono font-black text-gray-400">{o.volume.toFixed(2)}</td>
                            <td className={`p-4 text-center font-black font-mono ${pl >= 0 ? 'text-green-500' : 'text-red-400'}`}>{pl.toFixed(2)}</td>
                            <td className="p-4 text-right"><button onClick={() => closeOrder(o.id)} className="bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1 rounded font-black text-[8px] uppercase border border-red-500/20 transition-all">Close</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                   </table>
                   {orders.length === 0 && (
                     <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No Active Positions</div>
                   )}
                </div>
              </div>
            )}

            {/* History View */}
            {viewMode === 'history' && (
              <div className="flex flex-col h-full bg-[#0b0e11] overflow-hidden">
                {/* History Header */}
                <div className="p-3 bg-[#181a20] border-b border-[#2b2f36] text-[9px] text-gray-500 font-black uppercase">Trade History</div>

                {/* History Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                   <table className="w-full text-left text-white text-[10px] md:text-[11px] border-collapse">
                    <thead className="text-gray-600 border-b border-white/5 sticky top-0 bg-[#181a20] z-10 font-black uppercase tracking-widest text-[9px]">
                      <tr><th className="p-3 pr-2">Symbol</th><th>Type</th><th className="text-center">Volume</th><th className="text-center">Profit</th><th className="text-right">Date</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {history.filter((h: any) => h.marketType === MarketType.FOREX).map((h: any) => (
                        <tr key={h.id} className="hover:bg-white/[0.02] transition-colors opacity-70">
                          <td className="p-4 font-black uppercase text-xs tracking-tighter">{h.symbol}</td>
                          <td className={`p-4 font-black ${h.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}`}>{h.type}</td>
                          <td className="p-4 text-center font-mono">{h.volume.toFixed(2)}</td>
                          <td className={`p-4 text-center font-black font-mono ${h.profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>{h.profit.toFixed(2)}</td>
                          <td className="p-4 text-right text-gray-600 font-mono italic text-[9px]">{new Date(h.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                   {history.length === 0 && (
                     <div className="p-16 text-center text-gray-700 font-black uppercase tracking-[0.4em] italic opacity-30">No Trade History</div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons - Chart / Active / History */}
          <div className="bg-[#181a20] border-t border-[#2b2f36] flex gap-2 p-2 shrink-0 shadow-lg">
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