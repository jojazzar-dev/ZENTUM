import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

const Login: React.FC<{ onLogin: any }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setLoading(true);

    try {
      if (isRegister) {
        // التحقق من تطابق كلمات المرور
        if (password !== confirmPassword) {
          setPasswordError('❌ كلمات المرور غير متطابقة');
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setPasswordError('❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-[#1e2329] p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl my-auto">
        <h2 className="text-3xl font-black text-white mb-6 text-center uppercase tracking-tighter">
          {isRegister ? 'Join Zentum' : 'Account Login'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field - Register Only - Completely Removed from DOM when not needed */}
          {isRegister && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-black/30 border border-white/20 px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-base"
              disabled={loading}
            />
          )}

          {/* Email Field */}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-black/30 border border-white/20 px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-base"
            required 
            disabled={loading}
          />

          {/* Password Field */}
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-black/30 border border-white/20 px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 text-base"
            required 
            disabled={loading}
          />

          {/* Confirm Password Field - Register Only - Completely Removed from DOM when not needed */}
          {isRegister && (
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              className={`w-full bg-black/30 border px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none text-base ${
                passwordError 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-white/20 focus:border-yellow-400'
              }`}
              disabled={loading}
            />
          )}

          {/* Password Error Message */}
          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm font-bold text-center">
              {passwordError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest mt-6 shadow-lg active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>

          {/* Forgot Password Link - Login Only */}
          {!isRegister && (
            <button 
              type="button"
              onClick={() => alert('📧 ستتلقى بريداً إلكترونياً الرابط لإعادة تعيين كلمة المرور (قريباً)')}
              className="w-full text-center text-yellow-500 hover:text-yellow-400 text-sm font-black uppercase tracking-widest transition-all"
            >
              Forgot Password?
            </button>
          )}
        </form>

        {/* Toggle Register/Login */}
        <div className="text-gray-500 text-center mt-8 text-xs font-medium">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setPasswordError('');
              setConfirmPassword('');
            }}
            disabled={loading}
            className="text-yellow-500 ml-2 font-black hover:underline transition-all disabled:opacity-50"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;