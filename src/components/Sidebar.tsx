import React from 'react';
import { OptimizedPrompt } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  history: OptimizedPrompt[];
  onSelect: (prompt: OptimizedPrompt | null) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeId?: string;
}

export default function Sidebar({ 
  history, 
  onSelect, 
  onOpenSettings, 
  isOpen, 
  setIsOpen,
  activeId 
}: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 0 }}
      className={`relative flex-shrink-0 bg-slate-50 dark:bg-black border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden transition-all`}
    >
      <div className="w-64 flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={() => onSelect(null)}
            className="w-full flex items-center justify-start gap-3 px-4 py-2 border border-slate-200 dark:border-white/20 rounded-theme hover:bg-slate-200 dark:hover:bg-space-800 transition-colors group"
          >
            <span className="material-symbols-outlined text-primary">add</span>
            <span className="text-sm font-medium dark:text-white">Nova Otimização</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">history</span>
            Recentes
          </div>
          
          <AnimatePresence>
            {history.map((item) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => onSelect(item)}
                className={`w-full text-left px-3 py-2 rounded-theme flex items-center gap-3 group transition-colors ${
                  activeId === item.id 
                    ? 'bg-slate-200 dark:bg-space-800 text-primary' 
                    : 'hover:bg-slate-200 dark:hover:bg-space-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] opacity-50 shrink-0">chat_bubble</span>
                <span className="truncate text-sm">{item.title || item.category}</span>
              </motion.button>
            ))}
          </AnimatePresence>
          
          {history.length === 0 && (
            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
              Nenhum histórico salvo
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-theme hover:bg-slate-200 dark:hover:bg-space-800 transition-colors dark:text-white"
          >
            <span className="material-symbols-outlined text-[20px] opacity-70">settings</span>
            <span className="text-sm">Configurações</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
