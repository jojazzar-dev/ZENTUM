import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { User } from '../types';
import { AuthService } from '../services/authService';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc, 
  getDoc, 
  deleteDoc 
} from "firebase/firestore";

interface AdminProps {
  currentUser: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ forex: 0, crypto: 0 });
  const [loading, setLoading] = useState(true);

  // 1. جلب البيانات والمزامنة اللحظية
  useEffect(() => {
    // جلب المستخدمين
    const loadUsers = async () => {
      const allUsers = await AuthService.getAllUsers();
      setUsers(allUsers.filter(u => u.id !== currentUser.id));
      setLoading(false);
    };
    loadUsers();

    // جلب إشعارات الإيداع (Real-time Listener)
    const q = query(collection(db, "deposits"), where("status", "==", "PENDING"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingDeposits(deps);
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  // 2. دالة الموافقة على الإيداع (تحديث الرصيد سحابياً)
  const handleApproveDeposit = async (dep: any) => {
    try {
      const userRef = doc(db, "users", dep.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        
        // إضافة المبلغ للرصيد (يتم الإيداع في رصيد الكريبتو USDT)
        await updateDoc(userRef, {
          cryptoBalance: (userData.cryptoBalance || 0) + dep.amount
        });

        // مسح الطلب من القائمة بعد الموافقة
        await deleteDoc(doc(db, "deposits", dep.id));
        
        alert(`Successfully approved $${dep.amount} for ${dep.userEmail}`);
      }
    } catch (error) {
      console.error("Approval Error:", error);
      alert("Failed to approve deposit.");
    }
  };

  const handleSaveFunds = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updatedUser = { 
        ...targetUser, 
        forexBalance: editValues.forex, 
        cryptoBalance: editValues.crypto 
      };
      await AuthService.adminUpdateUser(updatedUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      setEditingId(null);
      alert("Balances updated in cloud.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans p-6 overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-8 border-b border-white/5 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <h1 className="text-xl font-black text-yellow-500 uppercase tracking-tighter italic">ZENTUM MASTER CONSOLE</h1>
        </div>
        <button onClick={onLogout} className="bg-red-600/20 text-red-500 border border-red-500/20 px-6 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">Logout</button>
      </nav>

      <main className="max-w-7xl mx-auto">
        {/* --- SECTION 1: PENDING DEPOSIT ALERTS --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className={`w-3 h-3 rounded-full ${pendingDeposits.length > 0 ? 'bg-red-500 animate-ping' : 'bg-gray-700'}`}></span>
            <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em]">Pending Deposit Requests ({pendingDeposits.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pendingDeposits.map(dep => (
              <div key={dep.id} className="bg-[#1e2329] border border-yellow-500/20 p-6 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-top duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{dep.coin} Deposit</p>
                    <p className="text-3xl font-black text-white mt-1">${dep.amount.toLocaleString()}</p>
                  </div>
                  <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-[8px] font-black uppercase">Verify Sent</div>
                </div>
                <div className="text-[10px] text-gray-400 mb-6 bg-black/20 p-2 rounded-lg font-mono">
                  From: {dep.userEmail}
                </div>
                <button 
                  onClick={() => handleApproveDeposit(dep)}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-900/20 transition-all active:scale-95"
                >
                  Confirm & Add to Balance
                </button>
              </div>
            ))}
            {pendingDeposits.length === 0 && (
              <div className="col-span-full py-12 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-gray-700">
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No pending transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* --- SECTION 2: USER MANAGEMENT --- */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em] mb-4 ml-2">User Directory</h2>
          {loading ? (
            <div className="p-20 text-center text-yellow-500 animate-pulse font-bold uppercase text-[10px]">Synchronizing Cloud Database...</div>
          ) : (
            <div className="bg-[#1e2329] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-black/40 text-gray-600 text-[9px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-8">Entity Identity</th>
                      <th className="p-8">Forex Assets</th>
                      <th className="p-8">Crypto Assets</th>
                      <th className="p-8 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-8">
                          <div className="font-black text-white text-base uppercase tracking-tighter">{u.name}</div>
                          <div className="text-[10px] text-gray-600 font-mono lowercase">{u.email}</div>
                        </td>
                        <td className="p-8">
                          {editingId === u.id ? (
                            <input 
                              type="number" 
                              value={editValues.forex} 
                              onChange={e => setEditValues({...editValues, forex: parseFloat(e.target.value)})}
                              className="bg-black border border-blue-500 text-blue-400 p-2 rounded-xl w-32 outline-none font-bold"
                            />
                          ) : (
                            <span className="text-blue-500 font-black text-xl tracking-tighter">${u.forexBalance.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-8">
                          {editingId === u.id ? (
                            <input 
                              type="number" 
                              value={editValues.crypto} 
                              onChange={e => setEditValues({...editValues, crypto: parseFloat(e.target.value)})}
                              className="bg-black border border-yellow-500 text-yellow-400 p-2 rounded-xl w-32 outline-none font-bold"
                            />
                          ) : (
                            <span className="text-yellow-500 font-black text-xl tracking-tighter">{u.cryptoBalance.toLocaleString()} <span className="text-[10px]">USDT</span></span>
                          )}
                        </td>
                        <td className="p-8 text-right">
                          {editingId === u.id ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleSaveFunds(u.id)} className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase">Commit</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-700 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase">Abort</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setEditingId(u.id); setEditValues({ forex: u.forexBalance, crypto: u.cryptoBalance }); }} 
                              className="text-blue-500 hover:text-white border border-blue-500/30 px-5 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-blue-600 transition-all tracking-widest"
                            >
                              Modify Balance
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 p-8 text-center text-gray-800 text-[8px] font-black uppercase tracking-[0.5em]">
        ZENTUM Administrative Layer • Verified Session • SECURED
      </footer>
    </div>
  );
};

export default AdminDashboard;