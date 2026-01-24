import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal';

const CryptoExchange: React.FC<{ user: any, onUpdateBalance: any, onLogout: any }> = ({ user, onUpdateBalance, onLogout }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01);
  const [livePrices, setLivePrices] = useState<any>({});
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  
  // استعادة الأصول من الذاكرة المحلية المرتبطة بـ ID المستخدم
  const [holdings, setHoldings] = useState<any[]>(() => {
    const saved = localStorage.getItem(`zentum_crypto_holdings_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const coins = [
    { s: 'BTC', n: 'Bitcoin' }, { s: 'ETH', n: 'Ethereum' }, { s: 'SOL', n: 'Solana' },
    { s: 'BNB', n: 'Binance' }, { s: 'XRP', n: 'Ripple' }, { s: 'ADA', n: 'Cardano' },
    { s: 'AVAX', n: 'Avalanche' }, { s: 'DOT', n: 'Polkadot' }, { s: 'LINK', n: 'Chainlink' },
    { s: 'DOGE', n: 'Dogecoin' }, { s: 'TRX', n: 'TRON' }, { s: 'LTC', n: 'Litecoin' }
  ];

  // حفظ الأصول فوراً عند أي تغيير
  useEffect(() => {
    localStorage.setItem(`zentum_crypto_holdings_${user.id}`, JSON.stringify(holdings));
  }, [holdings, user.id]);

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

  const handleTrade = (type: 'BUY' | 'SELL') => {
    const price = livePrices[selected]?.USD || 0;
    if (price === 0) return alert("Market data loading...");

    if (type === 'BUY') {
      const cost = volume * price;
      if (user.cryptoBalance < cost) {
        alert("⚠️ Insufficient Balance! Please deposit more USDT.");
        return;
      }
      onUpdateBalance('crypto', -cost);
      setHoldings([...holdings, { symbol: selected, qty: volume, buyPrice: price, id: Date.now() }]);
    } else {
      const assetIndex = holdings.findIndex(h => h.symbol === selected);
      if (assetIndex > -1) {
        onUpdateBalance('crypto', holdings[assetIndex].qty * price);
        const newHoldings = [...holdings];
        newHoldings.splice(assetIndex, 1);
        setHoldings(newHoldings);
      } else {
        alert("⚠️ You don't own any " + selected + " to sell.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none">
      {/* Navbar - يظهر الرصيد والأزرار بشكل واضح على كل الشاشات */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-4 z-[100]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="w-8 h-8" />
          <span className="font-bold text-yellow-500 uppercase text-[10px] sm:text-xs tracking-widest">ZENTUM CRYPTO</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right">
              <span className="text-[8px] text-gray-500 font-bold uppercase block leading-none">USDT Balance</span>
              <span className="text-[10px] sm:text-sm font-mono font-bold text-yellow-500">{user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <button 
              onClick={() => alert("Transfer Logic: Available in next phase.")} 
              className="border border-yellow-600/40 text-yellow-500 px-2 py-1 rounded-md font-bold text-[8px] sm:text-[10px] uppercase hover:bg-yellow-600/10 transition-all"
            >
              Transfer
            </button>
          </div>

          <button 
            onClick={() => setIsDepositOpen(true)} 
            className="bg-yellow-600 text-black px-3 sm:px-5 py-1.5 rounded-full font-black text-[9px] sm:text-[10px] uppercase hover:bg-yellow-500 transition-all shadow-lg"
          >
            Deposit
          </button>
          
          <button onClick={onLogout} className="text-gray-500 hover:text-white uppercase text-[9px] font-bold ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Sidebar - في الموبايل يتحول لشريط علوي قابل للسحب */}
        <div className="w-full md:w-64 border-r border-white/5 bg-[#1e2329] flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar">
          <div className="hidden md:block p-3 text-[10px] text-gray-500 font-bold uppercase border-b border-white/5 tracking-widest">Market Watch</div>
          {coins.map(c => (
            <div 
              key={c.s} 
              onClick={() => setSelected(c.s)} 
              className={`p-3 md:p-4 border-r md:border-r-0 md:border-b border-white/[0.02] cursor-pointer transition-all whitespace-nowrap ${selected === c.s ? 'bg-yellow-500/10 border-b-2 border-b-yellow-500 md:border-b-0 md:border-l-4 md:border-l-yellow-500' : 'hover:bg-white/5'}`}
            >
              <div className="font-bold text-[11px] md:text-sm uppercase text-white">{c.s} / USDT</div>
              <div className="hidden md:block text-[9px] text-gray-500 uppercase">{c.n}</div>
            </div>
          ))}
        </div>

        {/* Main Workspace (Chart & Controls) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          {/* Trade Bar */}
          <div className="p-3 bg-[#181a20] border-b border-white/5 flex justify-between items-center gap-2">
            <h2 className="text-xs md:text-xl font-black uppercase tracking-tighter text-white">{selected} / USDT</h2>
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-black/40 rounded border border-white/10 h-9 overflow-hidden">
                  <span className="hidden xs:inline px-2 text-[8px] text-gray-500 font-bold uppercase">Vol</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-12 md:w-20 bg-transparent border-none text-white text-[11px] md:text-xs font-bold outline-none px-1" step="0.01" min="0.01" />
               </div>
               <button onClick={() => handleTrade('SELL')} className="px-5 md:px-10 py-2 bg-red-600 rounded font-bold uppercase text-[9px] md:text-xs hover:brightness-110 transition-all shadow-lg shadow-red-900/10">Sell</button>
               <button onClick={() => handleTrade('BUY')} className="px-5 md:px-10 py-2 bg-[#02c076] rounded font-bold uppercase text-[9px] md:text-xs hover:brightness-110 transition-all shadow-lg shadow-green-900/10">Buy</button>
            </div>
          </div>

          {/* Chart Section - تملأ كامل المساحة المتبقية */}
          <div className="flex-1 bg-black overflow-hidden relative">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en&enable_publishing=false&hide_top_toolbar=false&allow_symbol_change=false`} 
              className="w-full h-full border-none" 
              title="ZENTUM Crypto Chart"
            />
          </div>

          {/* Portfolio Area */}
          <div className="h-44 md:h-48 bg-[#181a20] border-t border-white/10 flex flex-col overflow-hidden shrink-0">
             <div className="p-2 bg-[#1e2329] text-[9px] text-gray-500 font-bold uppercase tracking-widest border-b border-white/5">Portfolio Assets</div>
             <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                   <thead className="text-gray-600 sticky top-0 bg-[#181a20] z-10 shadow-sm shadow-black">
                     <tr><th className="p-2">Asset</th><th>Qty</th><th className="hidden sm:table-cell">Entry Price</th><th>P/L (USDT)</th></tr>
                   </thead>
                   <tbody className="text-gray-300">
                     {holdings.map(h => {
                       const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                       const pl = currentVal - (h.qty * h.buyPrice);
                       return (
                         <tr key={h.id} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                           <td className="p-2 font-bold text-white uppercase">{h.symbol}</td>
                           <td className="font-mono">{h.qty.toFixed(4)}</td>
                           <td className="hidden sm:table-cell text-gray-500 font-mono">${h.buyPrice.toLocaleString()}</td>
                           <td className={`font-bold font-mono ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                             {pl >= 0 ? '+' : ''}{pl.toFixed(2)}
                           </td>
                         </tr>
                       );
                     })}
                     {holdings.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-gray-600 italic uppercase text-[10px]">No Assets Held</td></tr>}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>

      <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} user={user} />
    </div>
  );
};

export default CryptoExchange;