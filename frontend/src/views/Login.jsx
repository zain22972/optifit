import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-fashion-dark transition-colors duration-300">
      
      {/* Left Side - Fashion Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80"
            alt="Fashion"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 gradient-fashion opacity-80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-16 w-16 rounded-2xl gradient-gold flex items-center justify-center shadow-xl shadow-gold-500/30 mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3">OptiFit <span className="text-gold-400">2.0</span></h1>
            <p className="text-indigo-200 text-lg max-w-md">Your AI-powered fashion assistant. Discover outfits that match your unique style.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-sm"
          >
            {[
              { label: 'AI Recommendations', desc: 'Personalized looks' },
              { label: 'Smart Wardrobe', desc: 'Digitize your closet' },
              { label: 'Style Analysis', desc: 'Perfect matches' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-gold-400 mb-1">0{i + 1}</div>
                <div className="text-xs text-indigo-300 font-medium">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">OptiFit <span className="text-gold-500">2.0</span></h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Sign in to continue your style journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <motion.label
                animate={{
                  y: focusedField === 'email' || email ? -28 : 0,
                  scale: focusedField === 'email' || email ? 0.85 : 1,
                }}
                className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
              >
                Email Address
              </motion.label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder={focusedField === 'email' ? 'you@example.com' : ''}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <motion.label
                animate={{
                  y: focusedField === 'password' || password ? -28 : 0,
                  scale: focusedField === 'password' || password ? 0.85 : 1,
                }}
                className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
              >
                Password
              </motion.label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={focusedField === 'password' ? '••••••••' : ''}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
              Create Account
            </Link>
          </p>

          <div className="mt-6 p-4 border border-indigo-500/10 dark:border-indigo-500/5 bg-indigo-500/5 dark:bg-indigo-950/20 rounded-2xl text-center text-xs">
            <p className="font-semibold text-indigo-500 dark:text-indigo-400 mb-1">Demo Account Access</p>
            <div className="space-y-1 text-slate-400">
              <p>Admin: <span className="font-bold text-slate-600 dark:text-slate-200">admin@optifit.com</span> / <span className="font-bold text-slate-600 dark:text-slate-200">admin123</span></p>
              <p>User: <span className="font-bold text-slate-600 dark:text-slate-200">jane@optifit.com</span> / <span className="font-bold text-slate-600 dark:text-slate-200">user123</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
