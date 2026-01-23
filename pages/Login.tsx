import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

const Login: React.FC<{ onLogin: any }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      // منطق التسجيل الجديد
      const res = AuthService.register(email, password, name);
      if (res.success) {
        onLogin(res.user);
        navigate('/'); // المستخدم الجديد يذهب للرئيسية
      } else {
        alert(res.message);
      }
    } else {
      // منطق تسجيل الدخول
      const res = AuthService.login(email, password);
      if (res.success) {
        onLogin(res.user);
        
        // --- التعديل الجوهري للتوجيه ---
        if (res.user.role === 'ADMIN') {
          // إذا كان إدمن، نتوجه فوراً للوحة التحكم
          navigate('/admin');
        } else {
          // إذا كان مستخدم عادي، نتوجه للمنصة الرئيسية
          navigate('/');
        }
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="h-screen bg-[#0b0e11] flex items-center justify-center p-4 select-none font-sans">
      <div className="w-full max-w-md bg-[#1e2329] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-6 text-center uppercase tracking-tighter">
          {isRegister ? 'Join Zentum' : 'Account Login'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500 transition-all" 
                required 
              />
            </div>
          )}

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500 transition-all" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest mt-4 shadow-lg active:scale-95"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-gray-500 text-center mt-8 text-xs font-medium">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-yellow-500 ml-2 font-black hover:underline transition-all"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;