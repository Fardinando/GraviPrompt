import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import SettingsModal from '../components/SettingsModal';
import { OptimizedPrompt, UserProfile } from '../types';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [history, setHistory] = useState<OptimizedPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<OptimizedPrompt | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  useEffect(() => {
    if (profile) {
      applyTheme(profile.theme);
      localStorage.setItem('graviprompt-theme', profile.theme);
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    
    // Try local storage theme first
    const localTheme = localStorage.getItem('graviprompt-theme');
    if (localTheme) {
      applyTheme(localTheme);
    }

    // Try local storage history first as immediate fallback
    const localHistory = localStorage.getItem(`graviprompt_history_${user.id}`);
    if (localHistory) {
      try {
        setHistory(JSON.parse(localHistory));
      } catch (e) {
        console.error('Erro ao ler LocalStorage:', e);
      }
    }

    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      } else if (profileError?.code === 'PGRST116' || profileError?.message?.includes('Could not find the table')) {
        // Create default profile if table exists but no profile, or if we want to handle missing table gracefully
        const newProfile = { id: user.id, theme: 'system' };
        try {
          await supabase.from('profiles').insert(newProfile);
          setProfile(newProfile as UserProfile);
        } catch (e) {
          setProfile(newProfile as UserProfile); // Fallback to local profile
        }
      }

      // Fetch History from Supabase
      const { data: historyData, error: historyError } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!historyError && historyData) {
        setHistory(historyData);
        localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(historyData));
      } else if (historyError) {
        console.warn('Supabase History Error (PGRST205 is expected if table is missing):', historyError);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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

  const handleSavePrompt = (prompt: OptimizedPrompt) => {
    setHistory(prev => {
      const updated = [prompt, ...prev];
      localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setActivePrompt(prompt);
  };

  const handleClearHistory = async () => {
    try {
      await supabase
        .from('prompts')
        .delete()
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('Erro ao deletar no Supabase:', e);
    }
    
    setHistory([]);
    setActivePrompt(null);
    localStorage.removeItem(`graviprompt_history_${user.id}`);
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await supabase
        .from('prompts')
        .delete()
        .eq('id', id);
    } catch (e) {
      console.warn('Erro ao deletar prompt no Supabase:', e);
    }

    setHistory(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    if (activePrompt?.id === id) {
      setActivePrompt(null);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-space-900 transition-colors overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-space-900 border-b border-slate-200 dark:border-white/10 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
          <span className="font-black tracking-tight">GraviPrompt</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 dark:text-white"
        >
          <span className="material-symbols-outlined text-[24px]">
            {sidebarOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        history={history}
        onSelect={(p) => {
          setActivePrompt(p);
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
        onDelete={handleDeletePrompt}
        onOpenSettings={() => setSettingsOpen(true)}
        activeId={activePrompt?.id}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-14 md:pt-0 relative">
        <Chat 
          user={user} 
          activePrompt={activePrompt} 
          onSave={handleSavePrompt} 
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdate={setProfile}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}

