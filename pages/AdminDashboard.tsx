import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { db } from '../firebase';
import { 
  collection, onSnapshot, query, where, doc, 
  updateDoc, getDoc, deleteDoc 
} from "firebase/firestore";

const AdminDashboard: React.FC<{ currentUser: User, onLogout: any }> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ forex: 0, crypto: 0 });
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. مزامنة قائمة المستخدمين
    const loadUsers = async () => {
      const allUsers = await AuthService.getAllUsers();
      setUsers(allUsers.filter(u => u.id !== currentUser.id));
      setLoading(false);
    };
    loadUsers();

    // 2. مزامنة الإيداعات اللحظية
    const qDep = query(collection(db, "deposits"), where("status", "==", "PENDING"));
    const unsubDep = onSnapshot(qDep, (snap) => {
      setPendingDeposits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. مزامنة السحوبات اللحظية
    const qWith = query(collection(db, "withdrawals"), where("status", "==", "PENDING"));
    const unsubWith = onSnapshot(qWith, (snap) => {
      setPendingWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubDep(); unsubWith(); };
  }, [currentUser.id]);

  // --- محرك الموافقة على الإيداع (إضافة رصيد) ---
  const handleApproveDeposit = async (dep: any) => {
    try {
      const userRef = doc(db, "users", dep.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        // افتراضياً الإيداع يذهب لمحفظة الكريبتو USDT
        await updateDoc(userRef, { cryptoBalance: (userData.cryptoBalance || 0) + dep.amount });
        await deleteDoc(doc(db, "deposits", dep.id));
        alert("Deposit Approved: Funds credited to user.");
      }
    } catch (e) { alert("Error approving deposit."); }
  };

  // --- محرك الموافقة على السحب (خصم رصيد) ---
  const handleApproveWithdrawal = async (wit: any) => {
    try {
      const userRef = doc(db, "users", wit.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        const balanceField = wit.walletType === 'crypto' ? 'cryptoBalance' : 'forexBalance';
        
        // الخصم الفعلي من الرصيد السحابي
        const newBalance = (userData[balanceField] || 0) - wit.amount;
        
        await updateDoc(userRef, { [balanceField]: newBalance });
        await deleteDoc(doc(db, "withdrawals", wit.id));
        
        alert(`Withdrawal Approved: $${wit.amount} deducted from ${wit.userEmail}`);
      }
    } catch (e) { alert("Error approving withdrawal."); }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (window.confirm("CRITICAL: Purge this user and all data?")) {
      const success = await AuthService.deleteUserAccount(userId);
      if (success) setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveFunds = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updated = { ...targetUser, forexBalance: editValues.forex, cryptoBalance: editValues.crypto };
      await AuthService.adminUpdateUser(updated);
      setUsers(users.map(u => u.id === userId ? updated : u));
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans p-4 md:p-8 overflow-x-hidden">
      <nav className="flex justify-between items-center mb-10 border-b border-white/5 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <h1 className="text-xl font-black text-yellow-500 uppercase italic tracking-tighter">ZENTUM MASTER CONSOLE</h1>
        </div>
        <button onClick={onLogout} className="bg-red-600/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-bold text-[10px] hover:bg-red-600 hover:text-white transition-all">TERMINATE SESSION</button>
      </nav>

      <main className="max-w-7xl mx-auto">
        {/* --- SECTION 1: DUAL ALERT SYSTEM --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Deposit Alerts */}
          <div className="bg-[#1e2329]/50 p-6 rounded-[2rem] border border-white/5">
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${pendingDeposits.length > 0 ? 'bg-green-500 animate-ping' : 'bg-gray-700'}`}></span>
              Deposit Notifications ({pendingDeposits.length})
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {pendingDeposits.map(dep => (
                <div key={dep.id} className="bg-black/30 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono">{dep.userEmail}</p>
                    <p className="text-lg font-black text-white">${dep.amount.toLocaleString()} <span className="text-yellow-500 text-xs">{dep.coin}</span></p>
                  </div>
                  <button onClick={() => handleApproveDeposit(dep)} className="bg-green-600 hover:bg-green-700 text-white font-black px-4 py-2 rounded-xl text-[9px] uppercase transition-all shadow-lg shadow-green-900/20">Approve</button>
                </div>
              ))}
              {pendingDeposits.length === 0 && <p className="text-gray-700 text-[10px] uppercase font-bold italic py-4">No pending deposits</p>}
            </div>
          </div>

          {/* Withdrawal Alerts */}
          <div className="bg-[#1e2329]/50 p-6 rounded-[2rem] border border-white/5">
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${pendingWithdrawals.length > 0 ? 'bg-red-500 animate-ping' : 'bg-gray-700'}`}></span>
              Withdrawal Requests ({pendingWithdrawals.length})
            </h2>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {pendingWithdrawals.map(wit => (
                <div key={wit.id} className="bg-black/30 border border-white/5 p-4 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-mono">{wit.userEmail}</p>
                      <p className="text-xl font-black text-red-500">-${wit.amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleApproveWithdrawal(wit)} className="bg-red-600 hover:bg-red-700 text-white font-black px-4 py-2 rounded-xl text-[9px] uppercase transition-all shadow-lg shadow-red-900/20">Approve & Deduct</button>
                  </div>
                  <div className="text-[8px] text-gray-500 font-mono bg-black/20 p-2 rounded-lg break-all uppercase tracking-tighter">
                    Address: {wit.walletAddress} | Net: {wit.network}
                  </div>
                </div>
              ))}
              {pendingWithdrawals.length === 0 && <p className="text-gray-700 text-[10px] uppercase font-bold italic py-4">No pending withdrawals</p>}
            </div>
          </div>
        </div>

        {/* --- SECTION 2: USER DIRECTORY --- */}
        <div className="bg-[#1e2329] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <h2 className="text-lg font-black uppercase tracking-tight italic">Global User Database</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-gray-600 text-[9px] font-black uppercase tracking-widest">
                <tr>
                  <th className="p-8">Identity & UID</th>
                  <th className="p-8">Forex Assets</th>
                  <th className="p-8">Crypto Assets</th>
                  <th className="p-8 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-8">
                      <div className="font-black text-white text-sm uppercase">{u.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono lowercase">{u.email}</div>
                      <div className="text-[8px] text-yellow-600 font-mono mt-1 opacity-50 uppercase tracking-tighter">UID: {u.id}</div>
                    </td>
                    <td className="p-8">
                      {editingId === u.id ? (
                        <input type="number" value={editValues.forex} onChange={e => setEditValues({...editValues, forex: parseFloat(e.target.value)})} className="bg-black border border-blue-500 text-blue-400 p-2 rounded-xl w-32 outline-none font-bold" />
                      ) : (
                        <span className="text-blue-500 font-black text-lg">${u.forexBalance.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-8">
                      {editingId === u.id ? (
                        <input type="number" value={editValues.crypto} onChange={e => setEditValues({...editValues, crypto: parseFloat(e.target.value)})} className="bg-black border border-yellow-500 text-yellow-400 p-2 rounded-xl w-32 outline-none font-bold" />
                      ) : (
                        <span className="text-yellow-500 font-black text-lg">{u.cryptoBalance.toLocaleString()} <span className="text-[10px]">USDT</span></span>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      {editingId === u.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSaveFunds(u.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-[9px]">COMMIT</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-700 text-white px-4 py-2 rounded-xl font-bold text-[9px]">ABORT</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button onClick={() => setViewingUser(u)} className="p-2 text-gray-400 hover:text-white" title="View Portfolio"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>
                          <button onClick={() => { setEditingId(u.id); setEditValues({ forex: u.forexBalance, crypto: u.cryptoBalance }); }} className="p-2 text-blue-500 hover:scale-110 transition-transform" title="Edit Funds"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></button>
                          <button onClick={() => handleDeleteAccount(u.id)} className="p-2 text-red-500 hover:scale-110 transition-transform" title="Purge Account"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- USER DETAILS MODAL (Deep View) --- */}
      {viewingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#1e2329] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div>
                <h3 className="text-xl font-black text-white uppercase">{viewingUser.name}'s Insights</h3>
                <p className="text-[10px] text-gray-500 font-mono">{viewingUser.email}</p>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-gray-500 hover:text-white text-3xl">&times;</button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div>
                <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-4">Active Cloud Trades</h4>
                {(viewingUser.forexOrders || []).map((o: any) => (
                  <div key={o.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex justify-between text-[10px] mb-2">
                    <span className="font-bold">{o.symbol}</span>
                    <span className={o.type === 'BUY' ? 'text-blue-400' : 'text-red-400'}>{o.type} {o.volume} Lot</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-4">History Log</h4>
                {(viewingUser.tradeHistory || []).slice(0, 5).map((h: any) => (
                  <div key={h.id} className="bg-black/20 p-3 rounded-xl border border-white/5 flex justify-between text-[10px] mb-2">
                    <span className="font-bold">{h.symbol}</span>
                    <span className={h.profit >= 0 ? 'text-green-500' : 'text-red-400'}>${h.profit.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 p-10 text-center text-gray-800 text-[8px] font-black uppercase tracking-[0.5em] border-t border-white/5">
        ZENTUM Administrative Master Console • Quantum-RSA 4096 Secured Session
      </footer>
    </div>
  );
};

export default AdminDashboard;