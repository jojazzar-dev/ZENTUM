import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ForexTrader from './pages/ForexTrader';
import CryptoExchange from './pages/CryptoExchange';
import AdminDashboard from './pages/AdminDashboard'; // استيراد صفحة الإدارة
import { AuthService } from './services/authService';
import { User } from './types';

const App: React.FC = () => {
  // جلب جلسة المستخدم الحالية عند تشغيل التطبيق
  const [user, setUser] = useState<User | null>(AuthService.getCurrentSession());

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  // دالة تحديث الرصيد للمستخدم الحالي (تستخدم في صفقات الفوركس والكريبتو)
  const updateBalance = (type: 'forex' | 'crypto', amount: number) => {
    if (!user) return;
    const updatedUser = { 
      ...user, 
      [type === 'forex' ? 'forexBalance' : 'cryptoBalance']: (user[type === 'forex' ? 'forexBalance' : 'cryptoBalance'] || 0) + amount 
    };
    setUser(updatedUser);
    AuthService.updateCurrentUser(updatedUser);
  };

  return (
    <HashRouter>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />

        {/* صفحة تسجيل الدخول */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* مسار لوحة التحكم (ADMIN ONLY) */}
        <Route 
          path="/admin" 
          element={
            user?.role === 'ADMIN' ? 
            <AdminDashboard currentUser={user} onLogout={handleLogout} /> : 
            <Navigate to="/" />
          } 
        />

        {/* مسار تداول الفوركس (USER & ADMIN) */}
        <Route 
          path="/forex" 
          element={
            user ? 
            <ForexTrader user={user} onUpdateBalance={updateBalance} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />

        {/* مسار تداول الكريبتو (USER & ADMIN) */}
        <Route 
          path="/crypto" 
          element={
            user ? 
            <CryptoExchange user={user} onUpdateBalance={updateBalance} onLogout={handleLogout} /> : 
            <Navigate to="/login" />
          } 
        />

        {/* إعادة توجيه أي مسار غير معروف إلى الصفحة الرئيسية */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;