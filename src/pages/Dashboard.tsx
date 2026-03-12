import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import SettingsModal from '../components/SettingsModal';
import { OptimizedPrompt, UserProfile } from '../types';
import { Menu, X, Rocket } from 'lucide-react';

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        applyTheme(profileData.theme);
      } else {
        // Create default profile
        const newProfile = { id: user.id, theme: 'system' };
        await supabase.from('profiles').insert(newProfile);
        setProfile(newProfile as UserProfile);
      }

      // Fetch History
      const { data: historyData } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (historyData) {
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme: string) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSavePrompt = (prompt: OptimizedPrompt) => {
    setHistory([prompt, ...history]);
    setActivePrompt(prompt);
  };

  const handleClearHistory = async () => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('user_id', user.id);
    
    if (!error) {
      setHistory([]);
      setActivePrompt(null);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-space-900 transition-colors overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-space-900 border-b border-slate-200 dark:border-white/10 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-brand">
          <Rocket size={24} />
          <span className="font-black tracking-tight">GraviPrompt</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 dark:text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
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
