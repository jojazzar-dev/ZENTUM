import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchFXPrices } from '../services/marketService';
import DepositModal from '../components/DepositModal'; // استيراد المكون الجديد

const ForexTrader: React.FC<{ user: any, onUpdateBalance: any, onLogout: any }> = ({ user, onUpdateBalance, onLogout }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('EURUSD');
  const [volume, setVolume] = useState(0.10);
  const [fxRates, setFxRates] = useState<any>({});
  
  // حالة التحكم في فتح وإغلاق نافذة الإيداع
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
  const margin = orders.reduce((sum, o) => sum + (o.volume * 200), 0);
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
      <nav className="h-12 border-b border-[#2b2f36] bg-[#181a20] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="w-6 h-6" />
          <span className="font-bold text-white uppercase text-xs">ZENTUM TERMINAL</span>
        </div>
        <div className="flex gap-2 items-center">
           <div className="bg-black/40 px-3 py-1 rounded border border-white/5 font-bold uppercase text-[9px] mr-2">
              Balance: <span className="text-white">${user.forexBalance.toFixed(2)}</span>
           </div>
           
           <div className="flex gap-1.5">
             {/* تم ربط الزر بفتح نافذة الإيداع */}
             <button 
                onClick={() => setIsDepositOpen(true)} 
                className="bg-blue-600 text-white px-3 py-1 rounded text-[8px] font-black uppercase hover:bg-blue-500 transition-all shadow-md"
             >
                Add Funds
             </button>
             
             <button onClick={() => alert("Withdrawal request submitted for review.")} className="border border-white/20 text-white px-3 py-1 rounded text-[8px] font-black uppercase hover:bg-white/10 transition-all">Withdraw</button>
           </div>
           <button onClick={onLogout} className="text-gray-500 hover:text-white uppercase text-[9px] font-bold ml-2">Exit</button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-60 border-r border-[#2b2f36] bg-[#1e2329] flex flex-col">
          <div className="p-3 text-gray-500 font-bold uppercase text-[9px] border-b border-white/5 tracking-widest">Market Watch</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {pairs.map(s => (
              <div key={s} onClick={() => setSelected(s)} className={`p-4 border-b border-white/[0.02] cursor-pointer transition-all ${selected === s ? 'bg-blue-600/20 border-l-4 border-l-blue-500' : 'hover:bg-white/5'}`}>
                <div className="font-bold text-xs uppercase">{s}</div>
                <div className="text-[9px] text-gray-600 uppercase">Forex Pair</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 bg-[#181a20] border-b border-[#2b2f36] flex justify-between items-center">
            <h2 className="text-lg font-bold text-white uppercase tracking-tighter">{selected}</h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-black rounded border border-white/10 h-8 overflow-hidden">
                  <span className="px-2 text-[9px] text-gray-500 font-bold uppercase border-r border-white/5">Volume</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-16 bg-transparent border-none text-white text-xs font-bold p-1 outline-none" step="0.01" />
               </div>
               <div className="flex bg-[#1e2329] border border-[#2b2f36] rounded h-8 overflow-hidden shadow-xl">
                  <button onClick={() => openOrder('SELL')} className="px-8 bg-red-600/20 text-red-500 border-r border-[#2b2f36] font-bold hover:bg-red-600 hover:text-white transition-all uppercase text-[10px]">Sell</button>
                  <button onClick={() => openOrder('BUY')} className="px-8 bg-blue-600/20 text-blue-500 font-bold hover:bg-blue-600 hover:text-white transition-all uppercase text-[10px]">Buy</button>
               </div>
            </div>
          </div>
          <div className="flex-1 bg-black">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=${selected === 'XAUUSD' ? 'OANDA:XAUUSD' : selected === 'NAS100' ? 'CAPITALCOM:US100' : 'FX_IDC:' + selected}&interval=1&theme=dark&style=1&locale=en`} className="w-full h-full border-none" />
          </div>

          <div className="h-44 bg-[#181a20] border-t border-[#2b2f36] flex flex-col overflow-hidden">
            <div className="p-2 bg-[#0b0e11] border-b border-[#2b2f36] flex gap-6 text-[10px] text-gray-400 font-bold uppercase overflow-x-auto whitespace-nowrap">
               <div>Balance: <span className="text-white">{user.forexBalance.toFixed(2)}</span></div>
               <div className={totalPL >= 0 ? 'text-green-400' : 'text-red-400'}>Equity: <span className="text-white">${equity.toFixed(2)}</span></div>
               <div>Used Margin: <span className="text-white">${margin.toFixed(2)}</span></div>
               <div>Free Margin: <span className={`font-bold ${freeMargin < 0 ? 'text-red-500' : 'text-green-400'}`}>${freeMargin.toFixed(2)}</span></div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
               <table className="w-full text-left text-white text-[10px]">
                <thead className="text-gray-500 border-b border-white/5 sticky top-0 bg-[#181a20]"><tr><th className="p-2">Symbol</th><th>Type</th><th>Vol</th><th>Open Price</th><th>Profit</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.map(o => {
                    const pl = calculatePL(o);
                    return (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-2 font-bold uppercase">{o.symbol}</td>
                        <td className={o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{o.type}</td>
                        <td>{o.volume.toFixed(2)}</td>
                        <td className="font-mono">{o.openPrice.toFixed(5)}</td>
                        <td className={`font-bold ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pl.toFixed(2)}</td>
                        <td><button onClick={() => closeOrder(o.id)} className="bg-red-500/20 hover:bg-red-600 text-white px-2 rounded uppercase text-[8px] font-bold py-1 transition-all">Close</button></td>
                      </tr>
                    );
                  })}
                </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>

      {/* إضافة مكون نافذة الإيداع في نهاية الكود */}
      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
      />
    </div>
  );
};

export default ForexTrader;