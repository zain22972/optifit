import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, User, Calendar, Smile, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !age || !gender) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    const parsedAge = parseInt(age, 10);
    const result = await register(name, email, password, parsedAge, gender);
    setSubmitting(false);
    if (result.success) {
      navigate('/onboarding');
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
            src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=1200&auto=format&fit=crop&q=80"
            alt="Fashion Style"
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
            <h1 className="text-4xl font-extrabold text-white mb-3">Join <span className="text-gold-400">OptiFit</span></h1>
            <p className="text-indigo-200 text-lg max-w-md">Create your account and let AI transform the way you dress.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 space-y-4 max-w-sm"
          >
            {[
              'AI-powered outfit recommendations',
              'Smart wardrobe digitization',
              'Personal style analysis & insights',
              'Weather-adaptive fashion suggestions',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <div className="h-2 w-2 rounded-full bg-gold-500 shrink-0" />
                <span className="text-sm text-indigo-200">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">OptiFit <span className="text-gold-500">2.0</span></h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start your smart style journey today</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <motion.label
                animate={{ y: focusedField === 'name' || name ? -28 : 0, scale: focusedField === 'name' || name ? 0.85 : 1 }}
                className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
              >
                Full Name
              </motion.label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={focusedField === 'name' ? 'Jane Doe' : ''}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <motion.label
                animate={{ y: focusedField === 'email' || email ? -28 : 0, scale: focusedField === 'email' || email ? 0.85 : 1 }}
                className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
              >
                Email Address
              </motion.label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder={focusedField === 'email' ? 'jane@example.com' : ''}
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
                animate={{ y: focusedField === 'password' || password ? -28 : 0, scale: focusedField === 'password' || password ? 0.85 : 1 }}
                className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
              >
                Password
              </motion.label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={focusedField === 'password' ? 'Min 6 characters' : ''}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                  minLength="6"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <motion.label
                  animate={{ y: focusedField === 'age' || age ? -28 : 0, scale: focusedField === 'age' || age ? 0.85 : 1 }}
                  className="absolute left-12 top-3.5 text-sm font-medium text-slate-400 dark:text-slate-500 pointer-events-none origin-left z-10"
                >
                  Age
                </motion.label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder={focusedField === 'age' ? '24' : ''}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => setFocusedField('')}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200"
                    min="1" max="120" required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-slate-400 dark:text-slate-500 absolute left-12 top-3.5 pointer-events-none z-10">
                  Gender
                </label>
                <div className="relative">
                  <Smile className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-200 appearance-none font-medium"
                    required
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
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
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
