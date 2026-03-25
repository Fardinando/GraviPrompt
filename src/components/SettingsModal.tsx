import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { useTranslation, TranslationKey } from '../lib/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profile: UserProfile | null;
  onProfileUpdate: (newProfile: UserProfile) => void;
  onClearHistory: () => void;
  onShowTutorial: () => void;
  onDeleteAccount: () => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  user, 
  profile, 
  onProfileUpdate,
  onClearHistory,
  onShowTutorial,
  onDeleteAccount
}: SettingsModalProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(profile?.theme || 'system');
  const [language, setLanguage] = useState<'pt-BR' | 'en'>(profile?.language || 'pt-BR');
  const [aiModel, setAiModel] = useState<string>(profile?.ai_model || 'google/gemini-2.0-flash-lite-preview-02-05:free');
  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasApiKey: boolean; loading: boolean }>({ hasApiKey: false, loading: true });

  const { t } = useTranslation(language);

  useEffect(() => {
    if (isOpen) {
      checkApiKey();
    }
  }, [isOpen]);

  const checkApiKey = async () => {
    try {
      const response = await fetch('/api/ai/config');
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('A resposta do servidor não é um JSON válido. Verifique se o backend está rodando.');
      }
      const data = await response.json();
      setApiKeyStatus({ hasApiKey: data.hasApiKey, loading: false });
    } catch (error) {
      console.error('Erro ao verificar API Key:', error);
      setApiKeyStatus({ hasApiKey: false, loading: false });
    }
  };

  const updateTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('graviprompt-theme', newTheme);
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, theme: newTheme, language });
      
    if (!error && profile) {
      onProfileUpdate({ ...profile, theme: newTheme });
    }
    
    // Apply theme to document
    applyTheme(newTheme);
  };

  const updateLanguage = async (newLang: 'pt-BR' | 'en') => {
    setLanguage(newLang);
    localStorage.setItem('graviprompt-language', newLang);
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, language: newLang, theme });
      
    if (!error && profile) {
      onProfileUpdate({ ...profile, language: newLang });
    }
  };

  const updateAiModel = async (newModel: string) => {
    setAiModel(newModel);
    
    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ai_model: newModel });
      
    if (!error && profile) {
      onProfileUpdate({ ...profile, ai_model: newModel });
    }
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
          <h2 className="text-xl font-bold dark:text-white">{t('settings.title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-space-800 rounded-full transition-colors dark:text-white">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Account Info */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined">person</span>
                <h3 className="font-bold uppercase text-sm tracking-widest">{t('settings.account')}</h3>
              </div>
              <button 
                onClick={onShowTutorial}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">help</span>
                {t('settings.tutorial')}
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-space-800 p-4 rounded-lg border border-slate-200 dark:border-white/5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.email')}</p>
              <p className="font-medium dark:text-white">{user.email}</p>
              {profile?.full_name && (
                <>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('settings.full_name')}</p>
                  <p className="font-medium dark:text-white">{profile.full_name}</p>
                </>
              )}
            </div>
          </section>

          {/* Theme Selection */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">light_mode</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">{t('settings.theme')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'light', label: t('settings.theme.light'), icon: 'light_mode' },
                { id: 'dark', label: t('settings.theme.dark'), icon: 'dark_mode' },
                { id: 'system', label: t('settings.theme.system'), icon: 'desktop_windows' }
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
                </button>
              ))}
            </div>
          </section>

          {/* Language Selection */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">language</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">{t('settings.language')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'pt-BR', label: t('settings.lang.pt'), icon: 'flag' },
                { id: 'en', label: t('settings.lang.en'), icon: 'flag' }
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => updateLanguage(l.id as any)}
                  className={`p-4 border rounded-lg text-left transition-all flex items-center gap-3 ${
                    language === l.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[24px] ${language === l.id ? 'text-primary' : 'text-slate-400'}`}>
                    {l.icon}
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{l.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* AI Model Selection */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined">smart_toy</span>
                <h3 className="font-bold uppercase text-sm tracking-widest">{t('settings.ai_model')} (OpenRouter)</h3>
              </div>
              <div className="flex items-center gap-2">
                {apiKeyStatus.loading ? (
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                ) : apiKeyStatus.hasApiKey ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Conectado
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Chave Faltando
                  </div>
                )}
              </div>
            </div>
            {!apiKeyStatus.loading && !apiKeyStatus.hasApiKey && (
              <div className="mb-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p className="text-xs text-red-500 leading-relaxed">
                  <strong>Atenção:</strong> A chave do OpenRouter não foi encontrada. 
                  Adicione a variável <code>OPENROUTER_API_KEY</code> nas configurações do seu ambiente (AI Studio ou Vercel).
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'openrouter/free', label: 'OpenRouter Free', desc: 'Seleção automática de modelos grátis (Padrão)' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateAiModel(m.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    aiModel === m.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-200 dark:border-white/10 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900 dark:text-white">{m.label}</p>
                    {aiModel === m.id && (
                      <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <span className="material-symbols-outlined">delete</span>
              <h3 className="font-bold uppercase text-sm tracking-widest">{t('settings.danger_zone')}</h3>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (confirm(t('dashboard.clear_history_confirm'))) {
                    onClearHistory();
                  }
                }}
                className="w-full flex items-center justify-between p-4 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold text-red-500">{t('settings.clear_history')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.clear_history_desc')}</p>
                </div>
                <span className="material-symbols-outlined text-red-500 opacity-50 group-hover:opacity-100">delete</span>
              </button>

              <button 
                onClick={onDeleteAccount}
                className="w-full flex items-center justify-between p-4 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold text-red-500">{t('settings.delete_account')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.delete_account_desc')}</p>
                </div>
                <span className="material-symbols-outlined text-red-500 opacity-50 group-hover:opacity-100">person_remove</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-space-800 transition-all group"
              >
                <div className="text-left">
                  <p className="font-bold dark:text-white">{t('settings.logout')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.logout_desc')}</p>
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
            {t('settings.done')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
