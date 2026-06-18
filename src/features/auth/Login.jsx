import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { ShoppingBasket, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Access Granted. Welcome Admin!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-orange-50 via-slate-50 to-orange-100 dark:from-[#0b0b1e] dark:via-[#13132e] dark:to-[#0b0b1e]">
      <div className="max-w-md w-full bg-white dark:bg-[#13132e] border border-slate-200/60 dark:border-slate-800/80 shadow-2xl rounded-[2.5rem] p-8 text-center relative overflow-hidden animate-scale-up">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -ml-16 -mb-16"></div>

        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <ShoppingBasket className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-none block">SUPER MART</h2>
            <span className="text-xs font-bold text-orange-500 tracking-widest mt-1 block">ADMINISTRATOR CONTROL</span>
          </div>
        </div>

        {/* Login Credentials Alert Card */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#1a1a3e] border border-slate-200/50 dark:border-slate-800/50 text-left">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">💡 Quick Access Credentials:</p>
          <div className="text-[11px] text-slate-500 dark:text-slate-500 font-mono space-y-0.5">
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Email:</span> admin@grocery.com</div>
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Password:</span> admin123</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Access Admin Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
