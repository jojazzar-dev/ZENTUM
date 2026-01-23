import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { User } from '../types';
import { AuthService } from '../services/authService';

const AdminDashboard: React.FC<{ currentUser: User, onLogout: any }> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ forex: 0, crypto: 0 });
  const [search, setSearch] = useState('');

  // تحميل المستخدمين من الذاكرة الحقيقية
  useEffect(() => {
    const allUsers = AuthService.getAllUsers();
    // عرض جميع المستخدمين باستثناء الإدمن الحالي
    setUsers(allUsers.filter(u => u.id !== currentUser.id));
  }, [currentUser.id]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const handleSave = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updatedUser = { 
        ...targetUser, 
        forexBalance: editValues.forex, 
        cryptoBalance: editValues.crypto 
      };
      
      AuthService.adminUpdateUser(updatedUser); // حفظ في قاعدة البيانات
      setUsers(users.map(u => u.id === userId ? updatedUser : u)); // تحديث الواجهة
      setEditingId(null);
      alert("Account funds updated successfully.");
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm("WARNING: Are you sure you want to permanently delete this user?")) {
      const remainingUsers = AuthService.getAllUsers().filter(u => u.id !== userId);
      localStorage.setItem('zentum_users_db', JSON.stringify(remainingUsers));
      setUsers(remainingUsers.filter(u => u.id !== currentUser.id));
      alert("User account purged.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans overflow-x-hidden">
      {/* Admin Navbar */}
      <nav className="h-16 border-b border-white/5 bg-[#181a20] flex items-center justify-between px-8 sticky top-0 z-[100] shadow-2xl">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-black text-xl tracking-tighter text-yellow-500 uppercase italic">Master Console</span>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[10px] font-black text-gray-500 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">Secured Session</span>
           <button onClick={onLogout} className="bg-red-600/10 text-red-500 px-6 py-1.5 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all">EXIT</button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1e2329] p-8 rounded-[2rem] border border-white/5">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Entities</h3>
            <p className="text-4xl font-black">{users.length}</p>
          </div>
          <div className="bg-[#1e2329] p-8 rounded-[2rem] border border-white/5 border-l-4 border-l-blue-600">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Forex Pool</h3>
            <p className="text-4xl font-black text-blue-500">${users.reduce((a, b) => a + b.forexBalance, 0).toLocaleString()}</p>
          </div>
          <div className="bg-[#1e2329] p-8 rounded-[2rem] border border-white/5 border-l-4 border-l-yellow-600">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Crypto Pool</h3>
            <p className="text-4xl font-black text-yellow-500">{users.reduce((a, b) => a + b.cryptoBalance, 0).toLocaleString()} <span className="text-sm">USDT</span></p>
          </div>
        </div>

        {/* Search & Management */}
        <div className="bg-[#1e2329] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-4">
             <h2 className="text-xl font-black uppercase tracking-tight italic">User Management Terminal</h2>
             <input 
              type="text" placeholder="Search Identity (Name or Email)..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-black border border-white/10 rounded-2xl px-6 py-3 text-xs w-full md:w-96 outline-none focus:border-yellow-500 font-mono shadow-inner"
             />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-gray-600 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Full Identity</th>
                  <th className="px-8 py-5">Forex Assets</th>
                  <th className="px-8 py-5">Crypto Assets</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-white text-base">{u.name}</div>
                      <div className="text-xs text-gray-500 font-mono italic">{u.email}</div>
                    </td>
                    
                    <td className="px-8 py-6">
                      {editingId === u.id ? (
                        <input type="number" value={editValues.forex} onChange={e => setEditValues({...editValues, forex: parseFloat(e.target.value)})} className="bg-black border border-blue-500 text-blue-400 font-bold p-2 rounded-xl w-32 outline-none" />
                      ) : (
                        <span className="text-blue-500 font-black text-lg">${u.forexBalance.toLocaleString()}</span>
                      )}
                    </td>

                    <td className="px-8 py-6">
                      {editingId === u.id ? (
                        <input type="number" value={editValues.crypto} onChange={e => setEditValues({...editValues, crypto: parseFloat(e.target.value)})} className="bg-black border border-yellow-500 text-yellow-400 font-bold p-2 rounded-xl w-32 outline-none" />
                      ) : (
                        <span className="text-yellow-500 font-black text-lg">{u.cryptoBalance.toLocaleString()} <span className="text-[10px]">USDT</span></span>
                      )}
                    </td>

                    <td className="px-8 py-6 text-right">
                      {editingId === u.id ? (
                        <div className="flex justify-end gap-2 animate-in slide-in-from-right">
                          <button onClick={() => handleSave(u.id)} className="bg-green-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-green-900/20">Commit</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-700 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase">Abort</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingId(u.id); setEditValues({ forex: u.forexBalance, crypto: u.cryptoBalance }); }} className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl font-bold text-[10px] uppercase border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">Modify</button>
                          <button onClick={() => handleDelete(u.id)} className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl font-bold text-[10px] uppercase border border-red-500/20 hover:bg-red-600 hover:text-white transition-all">Purge</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-20 text-center text-gray-700 font-black uppercase tracking-[0.3em] italic">No Database Records Found</div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="p-10 text-center text-gray-800 text-[9px] font-black uppercase tracking-[0.5em] mt-10">
        Administrative Control Layer • Security Level 5
      </footer>
    </div>
  );
};

export default AdminDashboard;