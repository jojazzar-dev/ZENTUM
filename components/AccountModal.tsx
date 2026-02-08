import React from 'react';
import { Logo } from '../constants';
import { User } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout?: () => void;
  onDeposit?: (type: 'forex' | 'crypto') => void;
  onWithdraw?: (type: 'forex' | 'crypto') => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  onLogout,
  onDeposit,
  onWithdraw
}) => {
  if (!isOpen || !user) return null;

  // دالة لنسخ الـ ID الخاص بالمستخدم (مفيد للدعم الفني)
  const copyUID = () => {
    navigator.clipboard.writeText(user.id);
    alert("Account UID copied to clipboard!");
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md font-sans"
      onClick={onClose}
    >
      {/* صندوق المودال */}
      <div 
        className="w-full max-w-md bg-[#1e2329] border-t sm:border border-white/10 sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6" />
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Profile Info</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* دائرة الحرف الأول من الاسم */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center text-black text-3xl font-black shadow-lg mb-4">
              {user.name[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">{user.name}</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">ZENTUM Verified Trader</span>
          </div>

          {/* تفاصيل البيانات */}
          <div className="space-y-4">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
              <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Email Address</label>
              <span className="text-white font-medium text-sm">{user.email}</span>
            </div>

            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
              <div className="flex-1">
                <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Account UID</label>
                <span className="text-yellow-500 font-mono text-xs">{user.id}</span>
              </div>
              <button 
                onClick={copyUID}
                className="bg-white/5 p-2 rounded-lg hover:bg-yellow-600 hover:text-black transition-all"
                title="Copy ID"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Member Since</label>
                <span className="text-white font-bold text-[11px]">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                <label className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Status</label>
                <span className="text-green-500 font-black text-[10px] uppercase tracking-tighter flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Verified
                </span>
              </div>
            </div>
          </div>

          {/* Balances Section */}
          <div className="space-y-3">
            <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Balances</h3>
            
            {/* Forex Balance */}
            <div className="bg-gradient-to-r from-blue-950/30 to-blue-900/10 p-4 rounded-2xl border border-blue-500/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">Forex</p>
                  <p className="text-white font-black text-2xl">
                    ${(user.forexBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-blue-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Crypto Balance */}
            <div className="bg-gradient-to-r from-yellow-950/30 to-yellow-900/10 p-4 rounded-2xl border border-yellow-500/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">Crypto</p>
                  <p className="text-white font-black text-2xl">
                    ${(user.cryptoBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-yellow-500">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.09 12.25l-1.5.82V9.33l1.5-.82v3.74zM12 8.5l2.18 1.19L12 10.88 9.82 9.69 12 8.5zm-1.5 5.57V10.33l-1.5.82v3.74l1.5-.82zm1.5.82l-2.18-1.19L12 12.5l2.18 1.2L12 14.89zM12 2l-6 3.27v6.55l6 3.27 6-3.27V5.27L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Actions</h3>
            
            {/* Deposit Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onDeposit && onDeposit('forex')}
                className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-black py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Deposit Forex
              </button>
              <button 
                onClick={() => onDeposit && onDeposit('crypto')}
                className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-400 font-black py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Deposit Crypto
              </button>
            </div>

            {/* Withdraw Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onWithdraw && onWithdraw('forex')}
                className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-black py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M20 12H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Withdraw Forex
              </button>
              <button 
                onClick={() => onWithdraw && onWithdraw('crypto')}
                className="bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/20 text-yellow-400 font-black py-3 px-4 rounded-xl transition-all uppercase text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M20 12H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Withdraw Crypto
              </button>
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-black py-4 rounded-xl transition-all uppercase text-sm tracking-widest flex items-center justify-center gap-2 mt-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            )}
          </div>

          {/* تنبيه أمني */}
          <div className="p-4 bg-yellow-600/5 border border-yellow-600/10 rounded-2xl">
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Your account is secured with end-to-end cloud encryption. Do not share your UID with unauthorized personnel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 text-center border-t border-white/5">
            <button 
              onClick={onClose}
              className="px-10 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
            >
                Close Profile
            </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;