import React from 'react';
import { Logo } from '../constants';
import { User } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  // دالة لنسخ الـ ID الخاص بالمستخدم (مفيد للدعم الفني)
  const copyUID = () => {
    navigator.clipboard.writeText(user.id);
    alert("Account UID copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
      {/* صندوق المودال */}
      <div className="w-full max-w-md bg-[#1e2329] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6" />
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Profile Info</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
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