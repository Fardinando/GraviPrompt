import React, { useState, useEffect } from 'react';
import { supabase, getActiveAuthClient } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import SettingsModal from '../components/SettingsModal';
import TutorialModal from '../components/TutorialModal';
import { OptimizedPrompt, UserProfile } from '../types';
import { promptService } from '../services/promptService';
import { useTranslation } from '../lib/i18n';

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
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const { t } = useTranslation(profile?.language || 'pt-BR');

  useEffect(() => {
    fetchData();
    
    // Check if tutorial should be shown
    const tutorialSeen = localStorage.getItem('graviprompt-tutorial-seen');
    if (!tutorialSeen) {
      setTutorialOpen(true);
    }
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
      const client = supabase;
      
      // 3. Fetch Profile
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro 406/PGRST116
      
      if (profileData) {
        setProfile(profileData);
        applyTheme(profileData.theme);
        localStorage.setItem('graviprompt-theme', profileData.theme);
      } else {
        // Criar perfil padrão localmente
        const newProfile = { 
          id: user.id, 
          theme: localTheme || 'system', 
          language: localStorage.getItem('graviprompt-language') || 'pt-BR',
          ai_model: 'openrouter/free'
        };
        setProfile(newProfile as UserProfile);
        
        // Tentar salvar no banco de forma segura
        const isNewUser = !profileError || profileError.code === 'PGRST116';
        if (isNewUser) {
          // Tentar salvar apenas colunas básicas primeiro para evitar erro de schema
          client.from('profiles').upsert({ 
            id: user.id, 
            theme: newProfile.theme, 
            language: newProfile.language 
          }).then(({ error }) => {
            if (error) console.warn('Sincronização básica de perfil falhou:', error.message);
          });
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
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { 
              role: "system", 
              content: t('dashboard.ai_rename_system')
            },
            { 
              role: "user", 
              content: `${t('dashboard.ai_rename_user')} "${prompt.original_prompt.substring(0, 200)}"`
            }
          ],
          model: profile?.ai_model || "openrouter/free"
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao chamar a API de renomeação.');
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Robust JSON extraction
      let jsonStr = content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      } else {
        jsonStr = content.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      }

      try {
        const result = JSON.parse(jsonStr);
        const newTitle = (result.title || '').trim()
          .replace(/^["']|["']$/g, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '') || t('dashboard.ai_rename_fallback');
          
        if (newTitle) {
          await handleRenamePrompt(id, newTitle);
        }
      } catch (parseError) {
        console.error('Erro ao parsear JSON de renomeação:', content);
        // Fallback: use the content directly as title if it's short
        const fallbackTitle = content.substring(0, 25).trim();
        await handleRenamePrompt(id, fallbackTitle);
      }
    } catch (e) {
      console.error('Erro ao renomear com IA:', e);
      throw e;
    }
  };

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
    localStorage.setItem('graviprompt-tutorial-seen', 'true');
  };

  const handleShowTutorial = () => {
    setTutorialOpen(true);
    setSettingsOpen(false);
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = t('dashboard.delete_account_confirm');
    
    if (confirm(confirmMsg)) {
      try {
        const client = supabase;
        const authClient = getActiveAuthClient();
        
        // 1. Clear history
        await handleClearHistory();
        
        // 2. Delete profile
        await client.from('profiles').delete().eq('id', user.id);
        
        // 3. Sign out
        localStorage.removeItem('gp-custom-session');
        await authClient.auth.signOut();
        
        // 4. Clear local storage
        localStorage.clear();
        
        alert(t('dashboard.delete_account_success'));
        window.location.reload();
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        alert(t('dashboard.delete_account_error'));
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-space-900 transition-colors overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-space-900 border-b border-slate-200 dark:border-white/10 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="GraviPrompt Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
          <span className="font-black tracking-tight dark:text-white">GraviPrompt</span>
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
        language={profile?.language || 'pt-BR'}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-14 md:pt-0 relative overflow-hidden">
        <Chat 
          user={user} 
          profile={profile}
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
        onShowTutorial={handleShowTutorial}
        onDeleteAccount={handleDeleteAccount}
      />

      {/* Tutorial Modal */}
      <TutorialModal 
        isOpen={tutorialOpen}
        onClose={handleCloseTutorial}
        language={profile?.language || 'pt-BR'}
      />
    </div>
  );
}

