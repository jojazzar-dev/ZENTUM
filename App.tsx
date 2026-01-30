import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from './firebase';
import { AuthService } from './services/authService';
import { User } from './types';

// استيراد الصفحات
import Home from './pages/Home';
import Login from './pages/Login';
import ForexTrader from './pages/ForexTrader';
import CryptoExchange from './pages/CryptoExchange';
import AdminDashboard from './pages/AdminDashboard';

const App: React.FC = () => {
  // جلب الجلسة من التخزين المحلي فقط للبداية السريعة
  const [user, setUser] = useState<User | null>(AuthService.getCurrentSession());

  // --- محرك المزامنة اللحظية (Real-time Cloud Heartbeat) ---
  useEffect(() => {
    let unsubscribe: () => void;

    if (user?.id) {
      // فتح قناة اتصال مباشرة مع وثيقة المستخدم في السحاب
      unsubscribe = onSnapshot(doc(db, "users", user.id), (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as User;
          
          // تحديث الحالة فوراً بأي تغيير قادم من السحاب (سواء من الإدمن أو جهاز آخر)
          setUser(cloudData);
          
          // تحديث الجلسة المحلية لضمان بقاء المستخدم مسجلاً
          localStorage.setItem('zentum_current_session', JSON.stringify(cloudData));
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe(); // إغلاق القناة عند تسجيل الخروج
    };
  }, [user?.id]);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  // دالة تحديث الرصيد (ترسل التحديث للسحاب فقط، و onSnapshot يتولى تحديث الشاشة)
  const updateBalance = async (type: 'forex' | 'crypto', amount: number) => {
    if (!user) return;
    
    const balanceField = type === 'forex' ? 'forexBalance' : 'cryptoBalance';
    const updatedUser = { 
      ...user, 
      [balanceField]: (user[balanceField] || 0) + amount 
    };

    // إرسال للسحاب فوراً
    await AuthService.updateCurrentUser(updatedUser);
  };

  // دالة مزامنة الصفقات والأصول (ترسل المصفوفات للسحاب)
  const syncUserData = async (updatedFields: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedFields };
    
    // رفع البيانات كاملة للسحاب لضمان ظهورها في كل الأجهزة
    await AuthService.updateCurrentUser(updatedUser);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* لوحة التحكم */}
        <Route 
          path="/admin" 
          element={user?.role === 'ADMIN' ? <AdminDashboard currentUser={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
        />

        {/* منصة الفوركس - مربوطة بالمزامنة السحابية */}
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

        {/* منصة الكريبتو - مربوطة بالمزامنة السحابية */}
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