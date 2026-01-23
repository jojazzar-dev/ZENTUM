import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { fetchLivePrices } from '../services/marketService';
import DepositModal from '../components/DepositModal'; // استيراد المكون الجديد

const CryptoExchange: React.FC<{ user: any, onUpdateBalance: any, onLogout: any }> = ({ user, onUpdateBalance, onLogout }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('BTC');
  const [volume, setVolume] = useState(0.01);
  const [livePrices, setLivePrices] = useState<any>({});
  
  // حالة التحكم في نافذة الإيداع
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // تحميل الأصول بناءً على ID المستخدم لضمان الخصوصية وعدم الضياع عند التحديث
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

  // حفظ محفظة الأصول تلقائياً
  useEffect(() => {
    localStorage.setItem(`zentum_crypto_holdings_${user.id}`, JSON.stringify(holdings));
  }, [holdings, user.id]);

  // تحديث الأسعار في الخلفية للحسابات المالية فقط
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
        alert("⚠️ You do not own any " + selected + " to sell.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e11] text-white overflow-hidden font-sans select-none">
      {/* Navbar */}
      <nav className="h-14 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-6">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <Logo className="w-8 h-8" />
          <span className="font-bold text-yellow-500 uppercase text-xs tracking-widest">ZENTUM CRYPTO</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-gray-500 font-bold uppercase block leading-none">Balance</span>
              <span className="text-sm font-mono font-bold text-yellow-500">{user.cryptoBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} USDT</span>
            </div>
            
            {/* زر Transfer */}
            <button 
              onClick={() => alert("Internal Transfer: Functionality coming soon.")} 
              className="border border-yellow-600/40 text-yellow-500 px-3 py-1 rounded-md font-bold text-[10px] uppercase hover:bg-yellow-600/10 transition-all"
            >
              Transfer
            </button>
          </div>

          <div className="h-8 w-px bg-white/5 mx-1"></div>

          {/* زر Deposit المربوط بالمودال */}
          <button 
            onClick={() => setIsDepositOpen(true)} 
            className="bg-yellow-600 text-black px-5 py-1.5 rounded-full font-black text-[10px] uppercase hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-900/10"
          >
            Deposit
          </button>

          <button onClick={onLogout} className="text-gray-500 hover:text-white uppercase text-[10px] font-bold">Logout</button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 border-r border-white/5 bg-[#1e2329] overflow-y-auto custom-scrollbar">
          <div className="p-3 text-[10px] text-gray-500 font-bold uppercase border-b border-white/5 tracking-widest">Market Watch</div>
          {coins.map(c => (
            <div key={c.s} onClick={() => setSelected(c.s)} className={`p-4 border-b border-white/[0.02] cursor-pointer transition-all ${selected === c.s ? 'bg-yellow-500/10 border-l-4 border-l-yellow-500' : 'hover:bg-white/5'}`}>
              <div className="font-bold text-sm uppercase">{c.s} / USDT</div>
              <div className="text-[9px] text-gray-500 uppercase">{c.n}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Trade Bar */}
          <div className="p-4 bg-[#181a20] border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-black uppercase tracking-tighter">{selected} / USDT</h2>
            <div className="flex items-center gap-3">
               <div className="flex items-center bg-black/40 rounded border border-white/10 h-10 overflow-hidden">
                  <span className="px-3 text-[9px] text-gray-500 font-bold uppercase tracking-widest border-r border-white/5">Volume</span>
                  <input type="number" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-20 bg-transparent border-none text-white text-xs font-bold outline-none px-2" step="0.01" min="0.01" />
               </div>
               <button onClick={() => handleTrade('SELL')} className="px-8 py-2.5 bg-red-600 rounded font-bold uppercase text-xs hover:brightness-110 transition-all">Sell</button>
               <button onClick={() => handleTrade('BUY')} className="px-8 py-2.5 bg-[#02c076] rounded font-bold uppercase text-xs hover:brightness-110 transition-all">Buy</button>
            </div>
          </div>

          {/* Chart Section */}
          <div className="flex-1 bg-black relative">
            <iframe src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${selected}USDT&interval=1&theme=dark&style=1&locale=en`} className="w-full h-full border-none" />
          </div>

          {/* Portfolio Section */}
          <div className="h-44 bg-[#181a20] border-t border-white/10 p-4 overflow-y-auto">
             <table className="w-full text-left text-xs">
                <thead className="text-gray-600 border-b border-white/5 uppercase text-[9px] tracking-widest">
                  <tr><th className="pb-2">Asset</th><th className="pb-2">Qty</th><th className="pb-2">Entry Price</th><th className="pb-2">P/L</th></tr>
                </thead>
                <tbody>
                  {holdings.map(h => {
                    const currentVal = h.qty * (livePrices[h.symbol]?.USD || 0);
                    const pl = currentVal - (h.qty * h.buyPrice);
                    return (
                      <tr key={h.id} className="border-b border-white/[0.02]">
                        <td className="py-2 font-bold">{h.symbol}</td>
                        <td className="py-2 font-mono">{h.qty.toFixed(4)}</td>
                        <td className="py-2 text-gray-500 font-mono">${h.buyPrice.toLocaleString()}</td>
                        <td className={`py-2 font-bold font-mono ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pl >= 0 ? '+' : ''}{pl.toFixed(2)} USDT
                        </td>
                      </tr>
                    );
                  })}
                  {holdings.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-gray-600 italic uppercase text-[10px]">No Assets Held</td></tr>}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* نافذة الإيداع المنبثقة */}
      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
      />
    </div>
  );
};

export default CryptoExchange;