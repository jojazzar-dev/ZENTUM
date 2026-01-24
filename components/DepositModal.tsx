import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import { User } from '../types';

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
  user: User | null; // إضافة المستخدم لربط العملية بحسابه
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, user }) => {
  const [step, setStep] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState(''); // حالة تخزين المبلغ
  const [loading, setLoading] = useState(false); // حالة التحميل أثناء الإرسال
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

  // دالة إرسال إشعار الإيداع للإدمن عبر Firebase
  const handleNotifyAdmin = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter the exact amount you sent.");
      return;
    }

    if (!user) {
      alert("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    try {
      // تسجيل طلب الإيداع في Firestore لكي يظهر للإدمن
      await addDoc(collection(db, "deposits"), {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: parseFloat(amount),
        coin: selectedCoin?.symbol,
        status: 'PENDING', // الحالة الافتراضية "معلق"
        timestamp: Date.now()
      });

      alert("Success! Admin has been notified. Your balance will be updated after verification.");
      handleClose(); // إغلاق النافذة بعد النجاح
    } catch (error) {
      console.error("Deposit Notification Error:", error);
      alert("Failed to notify admin. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCoin(null);
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm font-sans">
      <div className="w-full max-w-md bg-[#1e2329] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">
            {step === 1 ? 'Deposit Method' : `Confirm ${selectedCoin?.symbol} Payment`}
          </h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            /* المرحلة الأولى: اختيار العملة */
            <div className="space-y-3">
              <p className="text-gray-500 text-[10px] mb-6 uppercase font-black tracking-widest text-center">Select your preferred asset</p>
              {wallets.map(coin => (
                <div 
                  key={coin.id} 
                  onClick={() => { setSelectedCoin(coin); setStep(2); }}
                  className="flex items-center justify-between p-5 bg-black/30 border border-white/5 rounded-2xl cursor-pointer hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-[#0b0e11] flex items-center justify-center font-black text-yellow-500 border border-white/5 uppercase group-hover:scale-110 transition-transform">
                      {coin.symbol[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm uppercase">{coin.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{coin.network}</div>
                    </div>
                  </div>
                  <div className="text-gray-700 group-hover:text-yellow-500">→</div>
                </div>
              ))}
            </div>
          ) : (
            /* المرحلة الثانية: عرض التفاصيل وإدخال المبلغ */
            <div className="flex flex-col items-center animate-in slide-in-from-right duration-300">
              
              {/* QR Code */}
              <div className="w-44 h-44 bg-white p-3 rounded-3xl mb-6 shadow-2xl shadow-black relative group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedCoin?.address}`} 
                  alt="QR" className="w-full h-full object-contain"
                />
              </div>

              <div className="w-full space-y-5">
                {/* Network & Address */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                  <span className="text-[9px] text-gray-500 font-black uppercase block mb-1 tracking-widest">Network: {selectedCoin?.network}</span>
                  <div className="flex items-center justify-between gap-2 mt-2 px-2">
                    <span className="text-white font-mono text-[10px] break-all flex-1">{selectedCoin?.address}</span>
                    <button onClick={() => copyToClipboard(selectedCoin?.address || '')} className="text-yellow-500 hover:text-white transition-colors">
                      {copied ? '✓' : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
                    </button>
                  </div>
                </div>

                {/* Input Amount */}
                <div className="space-y-2">
                  <label className="text-[9px] text-gray-500 font-black uppercase ml-1 tracking-widest">Amount Sent</label>
                  <input 
                    type="number" 
                    placeholder="Enter amount (e.g. 500.00)" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500 text-center font-bold text-lg"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleNotifyAdmin}
                  disabled={loading}
                  className={`w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-900/20 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 'I have sent the payment'}
                </button>

                <button 
                  onClick={() => setStep(1)} 
                  className="w-full py-2 text-gray-500 font-bold uppercase text-[9px] hover:text-white transition-colors"
                >
                  ← Select another asset
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