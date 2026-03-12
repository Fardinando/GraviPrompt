import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import { Loader2 } from 'lucide-react';

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

  if (session) {
    return <Dashboard user={session.user} />;
  }

  return view === 'landing' ? (
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
  );
}
