import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  onProfileUpdate: (newProfile: UserProfile) => void;
  onClearHistory: () => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  user, 
  profile, 
  onProfileUpdate,
  onClearHistory
}: SettingsModalProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(profile?.theme || 'system');

  const updateTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('graviprompt-theme', newTheme);
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, theme: newTheme });
      
    if (!error && profile) {
      onProfileUpdate({ ...profile, theme: newTheme });
    }
    
    // Apply theme to document
    applyTheme(newTheme);
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-space-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold dark:text-white">Configurações</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-space-800 rounded-full transition-colors dark:text-white">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Account Info */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">person</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">Informações da Conta</h3>
            </div>
            <div className="bg-slate-50 dark:bg-space-800 p-4 rounded-lg border border-slate-200 dark:border-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">E-mail</p>
              <p className="font-medium dark:text-white">{user.email}</p>
              {profile?.full_name && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Nome</p>
                  <p className="font-medium dark:text-white">{profile.full_name}</p>
                </>
              )}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">light_mode</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">Aparência Visual</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: 'light_mode', desc: 'Tema claro e limpo' },
                { id: 'dark', label: 'Dark', icon: 'dark_mode', desc: 'Tema escuro para foco' },
                { id: 'system', label: 'System', icon: 'desktop_windows', desc: 'Sincronizar com o sistema' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateTheme(t.id as any)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    theme === t.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
                  }`}
                >
                  <span className={`material-symbols-outlined mb-3 block text-[24px] ${theme === t.id ? 'text-primary' : 'text-slate-400'}`}>
                    {t.icon}
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{t.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <span className="material-symbols-outlined">delete</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">Zona de Perigo</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
                    onClearHistory();
                  }
                }}
                className="w-full flex items-center justify-between p-4 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold text-red-500">Limpar Histórico</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Apaga permanentemente todas as suas otimizações salvas</p>
                </div>
                <span className="material-symbols-outlined text-red-500 opacity-50 group-hover:opacity-100">delete</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-space-800 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold dark:text-white">Sair da Conta</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Encerra sua sessão atual</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">logout</span>
              </button>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-space-800/50 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg shadow-primary/20"
          >
            Concluído
          </button>
        </div>
      </motion.div>
    </div>
  );
}
