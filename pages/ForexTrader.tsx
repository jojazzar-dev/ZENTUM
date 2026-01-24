import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchFXPrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';

const ForexTrader: React.FC<{ user: any, onUpdateBalance: any, onLogout: any }> = ({ user, onUpdateBalance, onLogout }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('EURUSD');
  const [volume, setVolume] = useState(0.10);
  const [fxRates, setFxRates] = useState<any>({});
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  
  const [orders, setOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem(`zentum_forex_orders_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const pairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURCAD', 'GBPCHF',
    'CADJPY', 'CHFJPY', 'NZDJPY', 'GBPCAD', 'AUDCAD', 'XAUUSD', 'XAGUSD',
    'US30', 'NAS100', 'DAX40', 'SPX500', 'USOIL', 'UKOIL', 'BTCUSD', 'ETHUSD'
  ];

  function getLivePrice(sym: string) {
    if (!fxRates || Object.keys(fxRates).length === 0) return 1.00;
    if (sym === 'XAUUSD') return 2035.50 + (Math.random() - 0.5);
    const base = sym.substring(0,3);
    const target = sym.substring(3,6);
    let price = 1;
    if (base === 'USD') price = fxRates[target] || 1;
    else if (target === 'USD') price = 1 / (fxRates[base] || 1);
    else price = (fxRates[target] || 1) / (fxRates[base] || 1);
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
    localStorage.setItem(`zentum_forex_orders_${user.id}`, JSON.stringify(orders));
  }, [orders, user.id]);

  useEffect(() => {
    const sync = async () => {
      const r = await fetchFXPrices();
      if (r) setFxRates(r);
    };
    sync();
    const inv = setInterval(sync, 1000);
    return () => clearInterval(inv);
  }, []);

  const openOrder = (type: 'BUY' | 'SELL') => {
    const requiredMargin = volume * 200;
    if (user.forexBalance <= 0) return alert("⚠️ Account balance is 0.00! Please deposit funds.");
    if (freeMargin < requiredMargin) return alert(`⚠️ Insufficient Margin for ${volume} Lot.`);

    const price = getLivePrice(selected);
    const newOrder = { id: Date.now(), symbol: selected, type, openPrice: price, volume };
    setOrders([...orders, newOrder]);
  };

  const closeOrder = (id: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      onUpdateBalance('forex', calculatePL(order));
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-[#d1d4dc] text-[11px] overflow-hidden font-sans select-none">
      {/* Navbar - Responsive */}
      <nav className="h-14 border-b border-[#2b2f36] bg-[#181a20] flex items-center justify-between px-3 z-[100]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="w-7 h-7" />
          <span className="font-bold text-white uppercase text-[10px] sm:text-xs">ZENTUM TERMINAL</span>
        </div>
        <div className="flex gap-2 items-center">
           <div className="bg-black/40 px-2 py-1 rounded border border-white/5 font-bold uppercase text-[9px]">
              <span className="hidden xs:inline text-gray-500 mr-1">Bal:</span>
              <span className="text-white">${user.forexBalance.toFixed(2)}</span>
           </div>
           <div className="flex gap-1">
             <button onClick={() => setIsDepositOpen(true)} className="bg-blue-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase shadow-md">Add</button>
             <button onClick={() => alert("Withdrawal request submitted.")} className="border border-white/20 text-white px-2 py-1 rounded text-[8px] font-black uppercase">Withdraw</button>
           </div>
           <button onClick={onLogout} className="text-gray-500 hover:text-white ml-1">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
           </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Market Watch - تحويل لـ Scroll أفقي في الموبايل وقائمة جانبية في الكمبيوتر */}
        <div className="w-full md:w-60 border-r border-[#2b2f36] bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar">
          <div className="hidden md:block p-3 text-gray-500 font-bold uppercase text-[9px] border-b border-white/5 tracking-widest">Market Watch</div>
          {pairs.map(s => (
            <div 
              key={s} 
              onClick={() => setSelected(s)} 
              className={`p-3 md:p-4 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer whitespace-nowrap transition-all ${selected === s ? 'bg-blue-600/20 border-b-2 border-b-blue-500 md:border-b-0 md:border-l-4 md:border-l-blue-500' : 'hover:bg-white/5'}`}
            >
              <div className="font-bold text-[11px] md:text-sm uppercase text-white">{s}</div>
              <div className="hidden md:block text-[8px] text-gray-600 uppercase">Forex Pair</div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Trade Control Bar */}
          <div className="p-2 md:p-3 bg-[#181a20] border-b border-[#2b2f36] flex justify-between items-center gap-2">
            <h2 className="text-xs md:text-lg font-bold text-white uppercase tracking-tighter">{selected}</h2>
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-black rounded border border-white/10 h-8 px-2">
                  <span className="hidden xs:inline text-[8px] text-gray-500 uppercase font-bold mr-1">Lot</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-10 md:w-16 bg-transparent border-none text-white text-[10px] font-bold outline-none" step="0.01" min="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-[#2b2f36] rounded h-8 overflow-hidden shadow-xl">
                  <button onClick={() => openOrder('SELL')} className="px-5 md:px-8 bg-red-600/20 text-red-500 border-r border-[#2b2f36] font-bold text-[9px] uppercase hover:bg-red-600">Sell</button>
                  <button onClick={() => openOrder('BUY')} className="px-5 md:px-8 bg-blue-600/20 text-blue-500 font-bold text-[9px] uppercase hover:bg-blue-600">Buy</button>
               </div>
            </div>
          </div>

          {/* Chart Section - تملأ كامل المساحة المتبقية */}
          <div className="flex-1 bg-black overflow-hidden relative min-h-[300px]">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${selected === 'XAUUSD' ? 'OANDA:XAUUSD' : selected === 'NAS100' ? 'CAPITALCOM:US100' : 'FX_IDC:' + selected}&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
            />
          </div>

          {/* MT5 Bottom Terminal - متجاوب */}
          <div className="h-44 md:h-48 bg-[#181a20] border-t border-[#2b2f36] flex flex-col overflow-hidden shrink-0">
            <div className="p-2 bg-[#0b0e11] border-b border-[#2b2f36] flex gap-4 text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase overflow-x-auto whitespace-nowrap custom-scrollbar">
               <div>Bal: <span className="text-white">${user.forexBalance.toFixed(2)}</span></div>
               <div className={totalPL >= 0 ? 'text-green-400' : 'text-red-400'}>Eq: <span className="text-white">${equity.toFixed(2)}</span></div>
               <div>Used: <span className="text-white">${margin.toFixed(2)}</span></div>
               <div>Free: <span className={`font-bold ${freeMargin < 0 ? 'text-red-500' : 'text-green-400'}`}>${freeMargin.toFixed(2)}</span></div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left text-white text-[10px]">
                <thead className="text-gray-500 border-b border-white/5 sticky top-0 bg-[#181a20]">
                  <tr><th className="p-2">Symbol</th><th>Type</th><th>P/L</th><th className="text-right p-2">Action</th></tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-2 font-bold uppercase">{o.symbol}</td>
                      <td className={o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{o.type}</td>
                      <td className={`font-bold ${calculatePL(o) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{calculatePL(o).toFixed(2)}</td>
                      <td className="text-right p-2"><button onClick={() => closeOrder(o.id)} className="bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold">X</button></td>
                    </tr>
                  ))}
                </tbody>
               </table>
               {orders.length === 0 && <div className="text-center py-4 text-gray-600 uppercase text-[9px] font-bold">No active trades</div>}
            </div>
          </div>
        </div>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
    </div>
  );
};

export default ForexTrader;