import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from './lib/i18n';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContent error={this.state.error} />
      );
    }

    return this.props.children;
  }
}

function ErrorContent({ error }: { error: Error | null }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-space-900 p-4 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h1 className="text-2xl font-bold dark:text-white mb-2">{t('error.boundary_title')}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
        {t('error.boundary_desc')}
      </p>
      <pre className="bg-slate-100 dark:bg-space-800 p-4 rounded-lg text-xs text-left overflow-auto max-w-full dark:text-slate-300 mb-6">
        {error?.message}
      </pre>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
      >
        {t('error.reload_btn')}
      </button>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth'>('landing');

  useEffect(() => {
    // Initial session check
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Erro ao recuperar sessão:', error.message);
          // Se o erro for relacionado a token inválido, limpamos a sessão local
          if (error.message.includes('refresh_token') || error.message.includes('Refresh Token')) {
            await supabase.auth.signOut();
            setSession(null);
          }
        } else {
          setSession(session);
        }
      } catch (err) {
        console.error('Erro inesperado na inicialização da auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth Event:', event);
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    // Safety net for background refresh errors
    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes('Refresh Token') || e.reason?.message?.includes('refresh_token')) {
        console.warn('Background refresh token error caught:', e.reason.message);
        supabase.auth.signOut().then(() => {
          setSession(null);
          window.location.reload(); // Force reload to clear any stuck state
        });
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-space-900">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {session ? (
        <Dashboard user={session.user} />
      ) : view === 'landing' ? (
        <LandingPage 
          onStart={() => setView('auth')} 
          onLogin={() => setView('auth')} 
        />
      ) : (
        <div className="relative">
          <button 
            onClick={() => setView('landing')}
            className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-space-800 rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <Auth />
        </div>
      )}
    </ErrorBoundary>
  );
}
