import React from 'react';
import { OptimizedPrompt } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n';
import { SUB_CATEGORY_KEYS } from '../constants';

interface SidebarProps {
  history: OptimizedPrompt[];
  onSelect: (prompt: OptimizedPrompt | null) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onAIRename: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeId?: string;
  language?: 'pt-BR' | 'en';
}

export default function Sidebar({ 
  history, 
  onSelect, 
  onDelete,
  onRename,
  onAIRename,
  onOpenSettings, 
  isOpen, 
  setIsOpen,
  activeId,
  language = 'pt-BR'
}: SidebarProps) {
  const { t, currentLang } = useTranslation(language);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [newTitle, setNewTitle] = React.useState('');
  const [aiRenamingId, setAiRenamingId] = React.useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  const formattedTime = time.toLocaleTimeString(currentLang, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 72 }}
        className={`relative flex-shrink-0 bg-slate-50 dark:bg-black border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden transition-all z-50`}
      >
        <div className={`${isOpen ? 'w-[280px]' : 'w-[72px]'} flex flex-col h-full transition-all duration-300`}>
          {/* Header Area with Toggle and New Chat */}
          <div className={`p-4 flex items-center gap-2 ${isOpen ? 'justify-between' : 'flex-col gap-4'}`}>
            <button 
              onClick={() => onSelect(null)}
              className={`flex items-center gap-3 border border-slate-200 dark:border-white/20 rounded-theme hover:bg-slate-200 dark:hover:bg-space-800 transition-all group overflow-hidden ${
                isOpen ? 'flex-1 px-4 py-2' : 'w-10 h-10 justify-center'
              }`}
              title={t('nav.new_chat')}
            >
              <span className="material-symbols-outlined text-primary shrink-0">add</span>
              {isOpen && <span className="text-sm font-medium dark:text-white truncate">{t('nav.new_chat')}</span>}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 bg-white dark:bg-space-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/10 text-slate-400 hover:text-primary transition-all ${!isOpen ? 'w-10 h-10 flex items-center justify-center' : ''}`}
              title={isOpen ? t('nav.collapse') : t('nav.expand')}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isOpen ? 'menu_open' : 'menu'}
              </span>
            </button>
          </div>

          {/* Divider line before history */}
          <div className="px-4 mb-2">
            <div className="h-px bg-slate-200 dark:bg-white/5 w-full" />
          </div>

          {/* Chat History */}
          <div id="sidebar-history" className="flex-1 overflow-y-auto px-2 space-y-1 pb-20 relative z-10">
            {isOpen && (
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">history</span>
                {t('nav.recent')}
              </div>
            )}
            
            <AnimatePresence>
              {Array.isArray(history) && history.map((item) => item && (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`group relative ${menuOpenId === item.id ? 'z-20' : 'z-0'}`}
                >
                  {renamingId === item.id && isOpen ? (
                    <div className="px-3 py-2 flex items-center gap-2">
                      <input 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onRename(item.id, newTitle);
                            setRenamingId(null);
                          } else if (e.key === 'Escape') {
                            setRenamingId(null);
                          }
                        }}
                        className="flex-1 bg-white dark:bg-space-900 border border-primary rounded px-2 py-1 text-sm dark:text-white outline-none"
                      />
                      <button 
                        onClick={() => {
                          onRename(item.id, newTitle);
                          setRenamingId(null);
                        }}
                        className="text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => onSelect(item)}
                        className={`w-full text-left rounded-theme flex items-center transition-all ${
                          isOpen ? 'px-3 py-2 gap-3 pr-10' : 'w-10 h-10 justify-center mx-auto'
                        } ${
                          activeId === item.id 
                            ? 'bg-slate-200 dark:bg-space-800 text-primary' 
                            : 'hover:bg-slate-200 dark:hover:bg-space-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title={!isOpen ? (item.title || item.category) : undefined}
                      >
                        <span className="material-symbols-outlined text-[18px] opacity-50 shrink-0">chat_bubble</span>
                        {isOpen && <span className="truncate text-sm">{item.title || (SUB_CATEGORY_KEYS[item.category] ? t(SUB_CATEGORY_KEYS[item.category] as any) : item.category)}</span>}
                      </button>
                      
                      {isOpen && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === item.id ? null : item.id);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:text-primary transition-all text-slate-400"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>

                          <AnimatePresence>
                            {menuOpenId === item.id && (
                              <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-[70] py-1 overflow-hidden"
                              >
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setAiRenamingId(item.id);
                                      try {
                                        await onAIRename(item.id);
                                      } catch (err) {
                                        alert(t('chat.error.ai_rename'));
                                      }
                                      setAiRenamingId(null);
                                      setMenuOpenId(null);
                                    }}
                                    disabled={aiRenamingId === item.id}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                  >
                                    <span className={`material-symbols-outlined text-[16px] ${aiRenamingId === item.id ? 'animate-pulse text-primary' : ''}`}>auto_awesome</span>
                                    {t('nav.ai_rename')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setRenamingId(item.id);
                                      setNewTitle(item.title || '');
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                    {t('nav.manual_rename')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setDeleteId(item.id);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                    {t('nav.delete_chat')}
                                  </button>
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {history.length === 0 && isOpen && (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                {t('nav.no_history')}
              </div>
            )}
          </div>

          {/* Vertical Clock (Only when retracted) */}
          {!isOpen && (
            <div className="flex-1 flex flex-col items-center justify-center py-4 gap-4">
              {/* Small divider between history and clock */}
              <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
              
              <div className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-300 font-mono text-[12px] font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">
                <span>{formattedTime}</span>
                <div className="w-px h-12 bg-primary/30 my-2" />
                <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain rotate-180" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10">
            <button 
              onClick={onOpenSettings}
              className={`flex items-center gap-3 rounded-theme hover:bg-slate-200 dark:hover:bg-space-800 transition-all dark:text-white group ${
                isOpen ? 'w-full px-3 py-2' : 'w-10 h-10 justify-center mx-auto'
              }`}
              title={t('nav.settings')}
            >
              <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:text-primary transition-colors">settings</span>
              {isOpen && <span className="text-sm">{t('nav.settings')}</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-space-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <span className="material-symbols-outlined text-[32px]">warning</span>
                <h3 className="text-xl font-bold dark:text-white">{t('nav.delete_confirm_title')}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('nav.delete_confirm_desc')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t('nav.cancel')}
                </button>
                <button 
                  onClick={() => {
                    onDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  {t('nav.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
