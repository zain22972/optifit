// OptiFit 2.0 Auth Forgot Password Screen
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Simulate API request delay
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-fashion-dark p-6 transition-colors duration-300">
      
      {/* Dynamic Background Blur Accents */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-glass-light dark:shadow-glass-dark relative z-10 scale-hover">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 rounded-2xl gradient-gold flex items-center justify-center shadow-lg shadow-gold-500/20 mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">Reset Password</h2>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">We'll help you recover your access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
              <CheckCircle2 className="h-10 w-10 shrink-0 text-emerald-500 animate-bounce" />
              <p className="font-bold">Instructions Sent!</p>
              <p className="text-xs text-slate-450 mt-1">If {email} is registered with us, you will receive password reset instructions shortly.</p>
            </div>
            
            <Link to="/login" className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-2xl py-3.5 font-bold transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 bg-white dark:bg-slate-950"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl py-3.5 font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <Link to="/login" className="w-full text-slate-500 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6">
              <ArrowLeft className="h-4 w-4" />
              Cancel & Return to Login
            </Link>
          </form>
        )}

      </div>
    </div>
  );
};
