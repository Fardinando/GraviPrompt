import React, { useState } from 'react';
import { supabase, supabaseCC, setActiveAuthProvider } from '../lib/supabase';
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
  const [authProvider, setAuthProvider] = useState<'graviprompt' | 'codingcourse'>('graviprompt');

  // Resetar provedor ao mudar para cadastro
  React.useEffect(() => {
    if (!isLogin) {
      setAuthProvider('graviprompt');
    }
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log(`Iniciando login com provedor: ${authProvider}`);
      
      // Define qual cliente usar baseado na escolha do usuário
      const client = authProvider === 'codingcourse' ? supabaseCC : supabase;
      setActiveAuthProvider(authProvider);

      if (authProvider === 'codingcourse') {
        console.log('Tentando login customizado na tabela students...');
        
        // Verificar se as variáveis de ambiente estão configuradas
        const ccUrl = import.meta.env.VITE_CODINGCOURSE_SUPABASE_URL;
        const ccKey = import.meta.env.VITE_CODINGCOURSE_SUPABASE_ANON_KEY;
        
        if (!ccUrl || ccUrl.includes('placeholder') || !ccKey || ccKey === 'placeholder') {
          console.error('Configuração do CodingCourse ausente:', { ccUrl, ccKey });
          setLoading(false);
          throw new Error('As chaves do Supabase CodingCourse não foram configuradas. Por favor, adicione VITE_CODINGCOURSE_SUPABASE_URL e VITE_CODINGCOURSE_SUPABASE_ANON_KEY nas configurações.');
        }

        // Criar uma promessa com timeout para a query
        const queryPromise = supabaseCC
          .from('students')
          .select('*') // Selecionar tudo para garantir que pegamos o ID correto
          .eq('username', email.trim())
          .eq('access_code', password.trim())
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('A conexão com o Supabase do CodingCourse expirou. Verifique se a URL está correta ou se o projeto não está pausado.')), 15000)
        );

        console.log('Executando query no Supabase CC...');
        const { data, error: queryError } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (queryError) {
          console.error('Erro na query do CodingCourse:', queryError);
          setLoading(false);
          throw new Error(`Erro na base de dados: ${queryError.message || 'Erro desconhecido'}`);
        }

        if (!data) {
          console.warn('Nenhum estudante encontrado com essas credenciais.');
          setLoading(false);
          throw new Error('Nome de usuário ou código de acesso incorretos.');
        }

        console.log('Login CodingCourse bem-sucedido para:', data.username);

        // Tentar encontrar um ID (pode ser 'id', 'student_id', 'uid', etc)
        const userId = data.id || data.student_id || data.uid || data.username;

        // Simular uma sessão para o App.tsx
        const customSession = {
          user: {
            id: userId,
            email: data.email || `${data.username}@codingcourse.local`,
            user_metadata: { 
              full_name: data.name || data.username,
              username: data.username
            },
            is_custom: true,
            provider: 'codingcourse'
          },
          access_token: 'custom-token-' + Math.random().toString(36).substring(7),
          expires_at: Math.floor(Date.now() / 1000) + (3600 * 24 * 7) // 1 semana
        };

        localStorage.setItem('gp-custom-session', JSON.stringify(customSession));
        localStorage.setItem('gp-auth-provider', 'codingcourse');
        
        console.log('Sessão salva. Recarregando página...');
        window.location.reload();
        return;
      }

      if (isLogin) {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await client.auth.signUp({
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
          <img src="/logo.svg" alt="GraviPrompt Logo" className="w-16 h-16 object-contain mb-2" referrerPolicy="no-referrer" />
          <h1 className="text-3xl font-black tracking-tight dark:text-white">GraviPrompt</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isLogin ? t('auth.welcome_back') : t('auth.start_creating')}
          </p>
        </div>

        {/* Seletor de Database - Apenas no Login */}
        {isLogin && (
          <div className="flex p-1 bg-slate-100 dark:bg-space-900 rounded-lg mb-6">
            <button
              onClick={() => setAuthProvider('graviprompt')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                authProvider === 'graviprompt' 
                  ? 'bg-white dark:bg-space-800 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              GraviPrompt
            </button>
            <button
              onClick={() => setAuthProvider('codingcourse')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                authProvider === 'codingcourse' 
                  ? 'bg-white dark:bg-space-800 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              CodingCourse
            </button>
          </div>
        )}

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
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              {authProvider === 'codingcourse' ? 'Nome de Usuário' : t('auth.email')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">
                  {authProvider === 'codingcourse' ? 'person' : 'mail'}
                </span>
              </span>
              <input
                required
                type={authProvider === 'codingcourse' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-space-900/50 border border-slate-200 dark:border-white/10 rounded-lg py-3 pl-11 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                placeholder={authProvider === 'codingcourse' ? 'seu.nome' : t('auth.email_placeholder')}
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
