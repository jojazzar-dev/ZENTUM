import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../constants';
import { User } from '../types';
import { AuthService } from '../services/authService';

// تعريف الخصائص لعدم ظهور أخطاء حمراء
interface AdminProps {
  currentUser: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ forex: 0, crypto: 0 });
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات السحابية
  const loadCloudData = async () => {
    setLoading(true);
    const allUsers = await AuthService.getAllUsers();
    // إخفاء حساب الإدمن نفسه من الجدول لزيادة الأمان
    setUsers(allUsers.filter(u => u.id !== currentUser.id));
    setLoading(false);
  };

  useEffect(() => {
    loadCloudData();
  }, [currentUser.id]);

  const handleSave = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      const updatedUser = { 
        ...targetUser, 
        forexBalance: editValues.forex, 
        cryptoBalance: editValues.crypto 
      };
      
      await AuthService.adminUpdateUser(updatedUser); // تحديث سحابي
      setUsers(users.map(u => u.id === userId ? updatedUser : u)); // تحديث الواجهة
      setEditingId(null);
      alert("Cloud database updated successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white font-sans p-8">
      {/* Header */}
      <nav className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Logo className="w-10 h-10" />
          <h1 className="text-2xl font-black text-yellow-500 uppercase italic tracking-tighter">Master Console</h1>
        </div>
        <button 
          onClick={onLogout} 
          className="bg-red-600/10 text-red-500 border border-red-500/20 px-8 py-2 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
        >
          EXIT TERMINAL
        </button>
      </nav>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs">Accessing Google Cloud Firestore...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto bg-[#1e2329] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-8">Identity</th>
                <th className="p-8">Forex Balance</th>
                <th className="p-8">Crypto Balance</th>
                <th className="p-8 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.01]">
                  <td className="p-8 font-bold text-white uppercase tracking-tighter">{u.name} <br/> <span className="text-[10px] text-gray-600 font-mono normal-case">{u.email}</span></td>
                  <td className="p-8">
                    {editingId === u.id ? (
                      <input 
                        type="number" 
                        value={editValues.forex} 
                        onChange={e => setEditValues({...editValues, forex: parseFloat(e.target.value)})}
                        className="bg-black border border-blue-500 text-blue-400 p-2 rounded-xl w-32 outline-none"
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
                        className="bg-black border border-yellow-500 text-yellow-400 p-2 rounded-xl w-32 outline-none"
                      />
                    ) : (
                      <span className="text-yellow-500 font-black text-xl tracking-tighter">{u.cryptoBalance.toLocaleString()} USDT</span>
                    )}
                  </td>
                  <td className="p-8 text-right">
                    {editingId === u.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSave(u.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-[10px]">SAVE</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-700 text-white px-4 py-2 rounded-xl font-bold text-[10px]">CANCEL</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingId(u.id); setEditValues({ forex: u.forexBalance, crypto: u.cryptoBalance }); }} 
                        className="text-blue-500 hover:text-white border border-blue-500/20 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-blue-500 transition-all"
                      >
                        Modify Assets
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-10 text-center text-gray-600 italic">No users found in cloud.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;