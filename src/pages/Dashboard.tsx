import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import SettingsModal from '../components/SettingsModal';
import { OptimizedPrompt, UserProfile } from '../types';
import { promptService } from '../services/promptService';

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
    
    // 1. Try local storage theme first for immediate application
    const localTheme = localStorage.getItem('graviprompt-theme');
    if (localTheme) {
      applyTheme(localTheme);
    }

    // 2. Try local storage history first as immediate fallback
    let currentHistory: OptimizedPrompt[] = [];
    const localHistory = localStorage.getItem(`graviprompt_history_${user.id}`);
    if (localHistory) {
      try {
        const parsed = JSON.parse(localHistory);
        if (Array.isArray(parsed)) {
          currentHistory = parsed.filter((item, index, self) =>
            item && index === self.findIndex((t) => t && t.id === item.id)
          );
          setHistory(currentHistory);
        }
      } catch (e) {
        console.error('Erro ao ler LocalStorage:', e);
      }
    }

    try {
      // 3. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        applyTheme(profileData.theme);
        localStorage.setItem('graviprompt-theme', profileData.theme);
      } else if (profileError?.code === 'PGRST116') {
        const newProfile = { id: user.id, theme: localTheme || 'system' };
        try {
          await supabase.from('profiles').insert(newProfile);
          setProfile(newProfile as UserProfile);
        } catch (e) {
          setProfile(newProfile as UserProfile);
        }
      }

      // 4. Fetch History from Supabase
      const { data: historyData, error: historyError } = await promptService.fetchHistory(user.id);

      if (!historyError && historyData) {
        // Source of truth is remote. 
        // We only keep local items that are NOT in remote AND don't look like remote IDs (UUIDs)
        // or if they were just created.
        const remoteIds = new Set(historyData.map(h => h.id));
        
        // Items in local storage that are NOT in remote
        const localOnly = currentHistory.filter(h => {
          const isRemoteId = h.id.includes('-'); // Simple UUID check
          return !remoteIds.has(h.id) && !isRemoteId;
        });
        
        const mergedHistory = [...historyData, ...localOnly].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );

        const uniqueHistory = mergedHistory.filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id)
        );

        setHistory(uniqueHistory);
        localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(uniqueHistory));

        // Sync local-only items to Supabase
        if (localOnly.length > 0) {
          syncLocalHistory(localOnly);
        }
      } else if (historyError) {
        console.warn('Supabase History Error:', historyError);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalHistory = async (localOnly: OptimizedPrompt[]) => {
    console.log(`Sincronizando ${localOnly.length} conversas locais...`);
    for (const prompt of localOnly) {
      try {
        const { id, ...dataToInsert } = prompt;
        const { data, error } = await promptService.savePrompt(dataToInsert);
        
        if (!error && data) {
          setHistory(prev => {
            const updated = prev.map(p => p.id === id ? data : p);
            localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.error('Erro ao sincronizar prompt:', e);
      }
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
      const exists = prev.find(p => p.id === prompt.id);
      let updated;
      if (exists) {
        updated = prev.map(p => p.id === prompt.id ? prompt : p);
      } else {
        updated = [prompt, ...prev];
      }
      localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    setActivePrompt(prompt);
  };

  const handleClearHistory = async () => {
    try {
      await promptService.clearHistory(user.id);
    } catch (e) {
      console.warn('Erro ao deletar no Supabase:', e);
    }
    
    setHistory([]);
    setActivePrompt(null);
    localStorage.removeItem(`graviprompt_history_${user.id}`);
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      if (id.includes('-')) { // Only try to delete from Supabase if it's a remote ID
        await promptService.deletePrompt(id);
      }
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

  const handleRenamePrompt = async (id: string, newTitle: string) => {
    try {
      // Supabase IDs are UUIDs and contain hyphens. 
      // Local temporary IDs might not.
      if (id.includes('-')) {
        await promptService.renamePrompt(id, newTitle);
      }
    } catch (e) {
      console.error('Erro ao renomear no Supabase:', e);
    }

    setHistory(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, title: newTitle } : p);
      localStorage.setItem(`graviprompt_history_${user.id}`, JSON.stringify(updated));
      return updated;
    });

    if (activePrompt?.id === id) {
      setActivePrompt(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleAIRename = async (id: string) => {
    const prompt = history.find(p => p.id === id);
    if (!prompt) return;

    try {
      const { GoogleGenAI } = await import('@google/genai');
      // Check for both standard and VITE_ prefixed environment variables
      const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API Key não encontrada.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Gere um título curto e criativo (máximo 4 palavras) para esta conversa que começa com: "${prompt.original_prompt.substring(0, 200)}"`,
      });
      
      const newTitle = response.text?.trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '') || 'Conversa Otimizada';
      if (newTitle) {
        await handleRenamePrompt(id, newTitle);
      }
    } catch (e) {
      console.error('Erro ao renomear com IA:', e);
      throw e; // Re-throw to be caught by the sidebar UI
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
        onRename={handleRenamePrompt}
        onAIRename={handleAIRename}
        onOpenSettings={() => setSettingsOpen(true)}
        activeId={activePrompt?.id}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-14 md:pt-0 relative overflow-hidden">
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

