import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { Loader2, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-space-900 p-4 text-center">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold dark:text-white mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
          </p>
          <pre className="bg-slate-100 dark:bg-space-800 p-4 rounded-lg text-xs text-left overflow-auto max-w-full dark:text-slate-300 mb-6">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth'>('landing');

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
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
