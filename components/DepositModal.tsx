import React, { useState } from 'react';

// تعريف أنواع البيانات لضمان عدم وجود أخطاء في TypeScript
interface Wallet {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qr: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState<Wallet | null>(null);
  const [copied, setCopied] = useState(false);

  // البيانات النهائية للمحافظ
  const wallets: Wallet[] = [
    { 
      id: 'btc', 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      network: 'BTC Network', 
      address: 'bc1qr22jeun6xx8v5hx45y55shavcsrqpsueh2n9wf', 
      qr: '' 
    },
    { 
      id: 'eth', 
      name: 'Ethereum', 
      symbol: 'ETH', 
      network: 'ERC-20', 
      address: '0xFc7Ea22dB880624ee7bE87634C1673a04428D803', 
      qr: '' 
    },
    { 
      id: 'usdt', 
      name: 'Tether (USDT)', 
      symbol: 'USDT', 
      network: 'ERC-20', 
      address: '0xFc7Ea22dB880624ee7bE87634C1673a04428D803', 
      qr: '' 
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCoin(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
      <div className="w-full max-w-md bg-[#1e2329] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">
            {step === 1 ? 'Deposit Method' : `Deposit ${selectedCoin?.symbol}`}
          </h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-3">
              {wallets.map(coin => (
                <div 
                  key={coin.id} 
                  onClick={() => { setSelectedCoin(coin); setStep(2); }}
                  className="flex items-center justify-between p-5 bg-black/30 border border-white/5 rounded-2xl cursor-pointer hover:border-yellow-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0b0e11] flex items-center justify-center font-black text-yellow-500 border border-white/5 uppercase">
                      {coin.symbol[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm uppercase">{coin.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase">{coin.network}</div>
                    </div>
                  </div>
                  <div className="text-gray-700 group-hover:text-yellow-500">→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in slide-in-from-right duration-300">
              <div className="w-52 h-52 bg-white p-3 rounded-[2rem] mb-8 shadow-2xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedCoin?.address}`} 
                  alt="QR" 
                  className="w-full h-full"
                />
              </div>

              <div className="w-full space-y-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] text-gray-500 font-black uppercase block mb-1 text-center">Network</span>
                  <span className="text-yellow-500 font-black text-center block text-xs uppercase">{selectedCoin?.network}</span>
                </div>

                <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                  <span className="text-white font-mono text-[10px] break-all font-bold text-center flex-1">
                    {selectedCoin?.address}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(selectedCoin?.address || '')}
                    className="bg-yellow-600/10 text-yellow-500 p-3 rounded-xl hover:bg-yellow-600 hover:text-black transition-all"
                  >
                    {copied ? <span className="text-[8px] font-black uppercase">Copied</span> : 'Copy'}
                  </button>
                </div>

                <button 
                  onClick={() => setStep(1)} 
                  className="w-full py-4 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] border-t border-white/5"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;