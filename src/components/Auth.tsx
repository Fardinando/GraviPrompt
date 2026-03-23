import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Rocket, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../lib/i18n';

export default function Auth() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        alert(t('auth.verify_email'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark transition-colors font-display">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-space-800 backdrop-blur-sm border border-slate-200 dark:border-white/10 p-8 rounded-xl shadow-2xl"
      >
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <img src="/graviprompt-logo.png" alt="GraviPrompt Logo" className="w-16 h-16 object-contain mb-2" referrerPolicy="no-referrer" />
          <h1 className="text-3xl font-black tracking-tight dark:text-white">GraviPrompt</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isLogin ? t('auth.welcome_back') : t('auth.start_creating')}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {error && (
            <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('auth.full_name')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                </span>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-space-900/50 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                  placeholder={t('auth.full_name_placeholder')}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('auth.email')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-space-900/50 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                placeholder={t('auth.email_placeholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('auth.password')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-space-900/50 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-11 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('auth.login_btn') : t('auth.signup_btn'))}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          {isLogin ? t('auth.no_account') : t('auth.has_account')}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline ml-1"
          >
            {isLogin ? t('auth.signup_link') : t('auth.login_link')}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
