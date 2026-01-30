import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ForexTrader from './pages/ForexTrader';
import CryptoExchange from './pages/CryptoExchange';
import AdminDashboard from './pages/AdminDashboard';
import { AuthService } from './services/authService';
import { User } from './types';

const App: React.FC = () => {
  // جلب جلسة المستخدم السحابية عند تشغيل التطبيق
  const [user, setUser] = useState<User | null>(AuthService.getCurrentSession());

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  // 1. حل مشكلة التحديث المتكرر للرصيد
  // نستخدم async لضمان انتظار السحابة، ونستخدم prev لضمان عدم استخدام بيانات قديمة
  const updateBalance = async (type: 'forex' | 'crypto', amount: number) => {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return null;

      const balanceField = type === 'forex' ? 'forexBalance' : 'cryptoBalance';
      const updatedUser: User = { 
        ...prev, 
        [balanceField]: (prev[balanceField] || 0) + amount 
      };

      // مزامنة فورية مع قاعدة البيانات السحابية
      AuthService.updateCurrentUser(updatedUser);
      
      return updatedUser;
    });
  };

  // 2. دالة جديدة لحفظ الصفقات والأصول سحابياً (لحل مشكلة اختفائها بين الأجهزة)
  const syncUserData = async (updatedFields: Partial<User>) => {
    if (!user) return;

    setUser((prev) => {
      if (!prev) return null;
      
      const updatedUser = { ...prev, ...updatedFields };
      
      // رفع البيانات كاملة (بما فيها المصفوفات) للسحاب
      AuthService.updateCurrentUser(updatedUser);
      
      return updatedUser;
    });
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        <Route 
          path="/admin" 
          element={user?.role === 'ADMIN' ? <AdminDashboard currentUser={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />

        {/* نمرر الدالة الجديدة syncUserData لكي تحفظ الصفحات صفقاتها في السحاب */}
        <Route 
          path="/forex" 
          element={
            user ? 
            <ForexTrader 
              user={user} 
              onUpdateBalance={updateBalance} 
              onSyncUserData={syncUserData} 
              onLogout={handleLogout} 
            /> : 
            <Navigate to="/login" />
          } 
        />

        <Route 
          path="/crypto" 
          element={
            user ? 
            <CryptoExchange 
              user={user} 
              onUpdateBalance={updateBalance} 
              onSyncUserData={syncUserData} 
              onLogout={handleLogout} 
            /> : 
            <Navigate to="/login" />
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;