import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import { User } from '../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  walletType: 'crypto' | 'forex'; // لتحديد من أي محفظة سيسحب
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, user, walletType }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('TRC20');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  // تحديد الرصيد المتاح بناءً على الصفحة الحالية
  const availableBalance = walletType === 'crypto' ? user.cryptoBalance : user.forexBalance;

  const handleSubmitRequest = async () => {
    const withdrawAmount = parseFloat(amount);

    // 1. التحقق من صحة البيانات
    if (!withdrawAmount || withdrawAmount <= 0) return alert("Please enter a valid amount.");
    if (!address || address.length < 10) return alert("Please enter a valid wallet address.");
    
    // 2. التحقق من توفر الرصيد
    if (withdrawAmount > availableBalance) {
      return alert(`Insufficient funds! Your ${walletType} balance is only $${availableBalance.toFixed(2)}`);
    }

    setLoading(true);
    try {
      // 3. إرسال الطلب إلى Firebase
      await addDoc(collection(db, "withdrawals"), {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: withdrawAmount,
        walletAddress: address,
        network: network,
        walletType: walletType, // 'crypto' or 'forex'
        status: 'PENDING',
        timestamp: Date.now()
      });

      alert("Withdrawal request submitted! Our finance team will review it shortly.");
      setAmount('');
      setAddress('');
      onClose();
    } catch (error) {
      console.error("Withdraw Error:", error);
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
      <div className="w-full max-w-md bg-[#1e2329] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 text-white">
          <h3 className="text-sm font-black uppercase tracking-[0.2em]">Withdraw {walletType}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="p-8 space-y-5">
          {/* عرض الرصيد المتاح */}
          <div className="bg-yellow-600/5 border border-yellow-600/20 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Available to Withdraw</span>
            <span className="text-xl font-mono font-bold text-yellow-500">${availableBalance.toLocaleString()}</span>
          </div>

          {/* خانة المبلغ */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase ml-1">Amount to Withdraw (USD)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-yellow-500 font-bold"
            />
          </div>

          {/* خانة العنوان */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase ml-1">Your Receiving Address</label>
            <input 
              type="text" 
              placeholder="Paste your wallet address here" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-3.5 rounded-2xl text-white outline-none focus:border-yellow-500 text-[11px] font-mono"
            />
          </div>

          {/* اختيار الشبكة */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-500 font-black uppercase ml-1">Network</label>
            <div className="grid grid-cols-3 gap-2">
              {['TRC20', 'ERC20', 'BTC'].map(net => (
                <button 
                  key={net}
                  onClick={() => setNetwork(net)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all border ${network === net ? 'bg-yellow-600 border-yellow-600 text-black' : 'bg-black/20 border-white/10 text-gray-500'}`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          {/* زر الإرسال */}
          <button 
            onClick={handleSubmitRequest}
            disabled={loading}
            className={`w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-lg shadow-yellow-900/20 mt-4 ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? 'Processing...' : 'Submit Payout Request'}
          </button>

          <p className="text-[9px] text-gray-600 text-center uppercase font-bold tracking-tighter">
            * Withdrawal requests are usually processed within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;