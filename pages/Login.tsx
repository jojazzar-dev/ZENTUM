import '../login-mobile-fix.css';
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

const Login: React.FC<{ onLogin: any }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // const [loading, setLoading] = useState(false); // حالة التحميل
  const loading = false; // تعطيل التحميل مؤقتًا

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true); // تعطيل التحميل مؤقتًا

    try {
      if (isRegister) {
        // تسجيل حساب جديد سحابياً
        const res = await AuthService.register(email, password, name);
        if (res.success) {
          onLogin(res.user);
          navigate('/');
        } else {
          alert(res.message);
        }
      } else {
        // تسجيل دخول سحابي
        const res = await AuthService.login(email, password);
        if (res.success) {
          onLogin(res.user);
          if (res.user?.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          alert(res.message);
        }
      }
    } catch (err) {
      alert("An error occurred during authentication.");
    } finally {
      // setLoading(false); // تعطيل التحميل مؤقتًا
    }
  };

  return (
    <div className="h-screen bg-[#0b0e11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1e2329] p-8 rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-6 text-center uppercase tracking-tighter">
          {isRegister ? 'Join Zentum' : 'Account Login'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500" 
              required 
            />
          )}

          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500" 
            required 
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-black/30 border border-white/10 p-3.5 rounded-xl text-white outline-none focus:border-yellow-500" 
            required 
          />
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest mt-4 shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="text-gray-500 text-center mt-8 text-xs font-medium">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button"
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