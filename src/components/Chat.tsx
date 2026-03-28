import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Category, OptimizedPrompt, ChatMessage, UserProfile } from '../types';
import { useTranslation, TranslationKey } from '../lib/i18n';
import { SUB_CATEGORY_KEYS } from '../constants';
import { optimizePrompt } from '../services/aiService';
import { promptService } from '../services/promptService';
import { supabase } from '../lib/supabase';

interface ChatProps {
  user: any;
  profile: UserProfile | null;
  activePrompt: OptimizedPrompt | null;
  onSave: (prompt: OptimizedPrompt) => void;
}

const TARGETS = [
  'ChatGPT', 
  'Claude', 
  'Gemini', 
  'Deepseek', 
  'Grok', 
  'Copilot',
  'Perplexity',
  'Antigravity', 
  'Solução de Problemas',
  'Outras IAs'
];

const CATEGORY_GROUPS = [
  {
    id: 'desenvolvimento',
    labelKey: 'group.desenvolvimento' as TranslationKey,
    icon: 'code',
    subCategories: ['UI Design', 'Game Dev', 'Web Sites', 'Data Science'] as Category[]
  },
  {
    id: 'texto',
    labelKey: 'group.texto' as TranslationKey,
    icon: 'edit_note',
    subCategories: ['História Longa', 'Texto Formal', 'E-mail Profissional', 'Artigo/Blog'] as Category[]
  },
  {
    id: 'imagem',
    labelKey: 'group.imagem' as TranslationKey,
    icon: 'image',
    subCategories: ['Realista', 'Artístico', 'Logo/Ícone', '3D/Render'] as Category[]
  },
  {
    id: 'geral',
    labelKey: 'group.geral' as TranslationKey,
    icon: 'auto_awesome',
    subCategories: ['General'] as Category[]
  },
  {
    id: 'pesquisa',
    labelKey: 'group.pesquisa' as TranslationKey,
    icon: 'search',
    subCategories: ['Pesquisa Profunda'] as Category[]
  }
];

const TargetLogo = ({ target, className = "w-4 h-4" }: { target: string, className?: string }) => {
  switch (target) {
    case 'Solução de Problemas':
      return <span className="material-symbols-outlined text-[18px]">psychology</span>;
    case 'Antigravity':
      return <span className="material-symbols-outlined text-[18px]">rocket_launch</span>;
    default:
      return <span className="material-symbols-outlined text-[18px]">smart_toy</span>;
  }
};

export default function Chat({ user, profile, activePrompt, onSave }: ChatProps) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<Category>('UI Design');
  const [target, setTarget] = useState('ChatGPT');
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>('geral');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation(profile?.language || 'pt-BR');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Research Mode States
  const [researchTime, setResearchTime] = useState(5);
  const [researchLevel, setResearchLevel] = useState<'Superficial' | 'Mediano' | 'Profundo' | 'Challenger Deep'>('Superficial');
  const [researchTopic, setResearchTopic] = useState('');
  const [sourceCount, setSourceCount] = useState(3);
  const [showSources, setShowSources] = useState(true);
  const [isResearchMinimized, setIsResearchMinimized] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (textareaRef.current && category !== 'Pesquisa Profunda') {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const maxHeight = lineHeight * 6;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input, category]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (researchLevel === 'Challenger Deep') {
      setResearchTime(90);
      setSourceCount(20);
    }
  }, [researchLevel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTargetDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (activePrompt) {
      setMessages(activePrompt.messages || [
        { 
          role: 'user', 
          content: activePrompt.original_prompt, 
          timestamp: activePrompt.created_at 
        },
        { 
          role: 'assistant', 
          content: [activePrompt.optimized_prompt], 
          skillsContent: activePrompt.skills_markdown ? [activePrompt.skills_markdown] : [],
          currentVersion: 0, 
          timestamp: activePrompt.created_at 
        }
      ]);
      setInput('');
      setCategory(activePrompt.category as Category);
      
      // Find group for category
      const group = CATEGORY_GROUPS.find(g => g.subCategories.includes(activePrompt.category as Category));
      if (group) setActiveGroup(group.id);
    } else {
      setMessages([]);
      setCategory('General');
      setActiveGroup('geral');
      setInput('');
      setLoading(false);
    }
  }, [activePrompt]);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      
      const interruptedMessage: ChatMessage = {
        role: 'assistant',
        content: "A geração de resposta foi interrompida manualmente.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, interruptedMessage]);
    }
  };

  const handleOptimize = async () => {
    if (loading) {
      handleStopGeneration();
      return;
    }

    const isResearchMode = category === 'Pesquisa Profunda';
    const finalInput = isResearchMode ? researchTopic : input;

    if (!finalInput.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: isResearchMode 
        ? `[PESQUISA PROFUNDA]\nTópico: ${researchTopic}\nTempo: ${researchTime}s\nNível: ${researchLevel}\nFontes: ${sourceCount}\nExibir Fontes: ${showSources ? 'Sim' : 'Não'}`
        : input,
      timestamp: new Date().toISOString()
    };

    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    if (isResearchMode) {
      setIsResearchMinimized(true);
      setCountdown(researchTime);
    }
    
    if (isResearchMode) {
      setResearchTopic('');
    } else {
      setInput('');
    }
    
    abortControllerRef.current = new AbortController();

    try {
      const researchParams = isResearchMode ? {
        time: researchTime,
        level: researchLevel,
        sources: sourceCount,
        showSources
      } : undefined;

      // Artificial Delay for Research Mode
      if (isResearchMode) {
        await new Promise(resolve => setTimeout(resolve, researchTime * 1000));
      }

      const { optimizedPrompt, title, skillsMarkdown } = await optimizePrompt(
        finalInput, 
        category, 
        target, 
        currentHistory,
        researchParams,
        profile?.ai_model,
        abortControllerRef.current?.signal
      );
      
      if (abortControllerRef.current?.signal.aborted) return;

      setLoading(false);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: [optimizedPrompt],
        skillsContent: skillsMarkdown ? [skillsMarkdown] : [],
        currentVersion: 0,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...currentHistory, userMessage, assistantMessage];
      setMessages(updatedMessages);

      const newPrompt = {
        user_id: user.id,
        category,
        original_prompt: updatedMessages[0].content as string,
        optimized_prompt: Array.isArray(assistantMessage.content) ? assistantMessage.content[0] : assistantMessage.content,
        title: title,
        github_links: [],
        skills_markdown: skillsMarkdown,
        messages: updatedMessages,
      };

      if (activePrompt?.id) {
        try {
          const { data, error } = await promptService.savePrompt(activePrompt.id.includes('-') ? { ...newPrompt, id: activePrompt.id } : newPrompt);
          
          if (error) {
            console.error('Erro Supabase ao atualizar:', error);
            onSave({ ...activePrompt, optimized_prompt: assistantMessage.content[0], messages: updatedMessages, skills_markdown: skillsMarkdown });
          } else if (data) {
            onSave(data);
          }
        } catch (dbErr) {
          console.error('Erro DB Crítico ao atualizar:', dbErr);
          onSave({ ...activePrompt, optimized_prompt: assistantMessage.content[0], messages: updatedMessages, skills_markdown: skillsMarkdown });
        }
      } else {
        const newPromptData = { ...newPrompt };
        try {
          const { data, error } = await promptService.savePrompt(newPromptData);

          if (error) {
            console.error('Erro Supabase ao inserir:', error);
            onSave({ ...newPrompt, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any);
          } else if (data) {
            onSave(data);
          }
        } catch (dbErr) {
          console.error('Erro DB Crítico ao inserir:', dbErr);
          onSave({ ...newPrompt, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any);
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      
      let errorMessage = t('chat.error.ai');
      
      if (err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = t('chat.error.quota');
      }

      alert(errorMessage);
      setMessages(currentHistory);
      setInput(userMessage.content as string);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async (index: number) => {
    if (loading) return;

    const historyBefore = messages.slice(0, index);
    const userMsg = messages[index - 1];
    
    if (!userMsg || userMsg.role !== 'user') return;

    setLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const researchParams = category === 'Pesquisa Profunda' ? {
        time: researchTime,
        level: researchLevel,
        sources: sourceCount,
        showSources
      } : undefined;

      const { optimizedPrompt, skillsMarkdown } = await optimizePrompt(
        userMsg.content as string, 
        category, 
        target, 
        historyBefore,
        researchParams,
        profile?.ai_model,
        abortControllerRef.current?.signal
      );
      
      if (abortControllerRef.current?.signal.aborted) return;

      setLoading(false);

      const updatedMessages = [...messages];
      const assistantMsg = { ...updatedMessages[index] };
      
      if (Array.isArray(assistantMsg.content)) {
        assistantMsg.content = [...assistantMsg.content, optimizedPrompt];
        assistantMsg.skillsContent = [...(assistantMsg.skillsContent || []), skillsMarkdown || ''];
        assistantMsg.currentVersion = assistantMsg.content.length - 1;
      } else {
        assistantMsg.content = [assistantMsg.content, optimizedPrompt];
        assistantMsg.skillsContent = ['', skillsMarkdown || ''];
        assistantMsg.currentVersion = 1;
      }

      updatedMessages[index] = assistantMsg;
      setMessages(updatedMessages);

      const currentSkills = assistantMsg.skillsContent[assistantMsg.currentVersion];

      if (activePrompt?.id) {
        try {
          const { data, error } = await promptService.savePrompt({
            id: activePrompt.id,
            optimized_prompt: optimizedPrompt,
            skills_markdown: currentSkills,
            messages: updatedMessages
          });
          
          if (!error && data) {
            onSave(data);
          } else {
            onSave({ ...activePrompt, optimized_prompt: optimizedPrompt, messages: updatedMessages, skills_markdown: currentSkills });
          }
        } catch (e) {
          onSave({ ...activePrompt, optimized_prompt: optimizedPrompt, messages: updatedMessages, skills_markdown: currentSkills });
        }
      }
    } catch (err: any) {
      setLoading(false);
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error(err);
      
      let errorMessage = t('chat.error.regenerate');
      if (err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = t('chat.error.quota_short');
      }
      
      alert(errorMessage);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const changeVersion = (msgIdx: number, versionIdx: number) => {
    const updatedMessages = [...messages];
    updatedMessages[msgIdx].currentVersion = versionIdx;
    setMessages(updatedMessages);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-space-900 transition-colors">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && !loading ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full mx-auto text-center space-y-6 mt-20"
            >
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4 text-primary">
                <span className="material-symbols-outlined text-[40px]">auto_awesome</span>
              </div>
              <h2 className="text-4xl font-black dark:text-white tracking-tight">O que vamos otimizar hoje?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Escolha uma categoria e insira seu prompt para começar a mágica.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="chat-bubbles"
              className="flex flex-col gap-6 pb-10"
            >
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full max-w-4xl mx-auto`}
                >
                  <div className={`
                    p-4 md:p-6 rounded-2xl shadow-md relative
                    ${msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none max-w-[85%]' 
                      : 'bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 max-w-[90%] rounded-tl-none'}
                  `}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-md text-primary">
                          <span className="material-symbols-outlined text-[14px]">
                            {category === 'Pesquisa Profunda' ? 'search' : 'bolt'}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            {category === 'Pesquisa Profunda' ? t('group.pesquisa') : (target === 'Solução de Problemas' ? t('target.solucao') : (target === 'Antigravity' ? t('target.antigravity') : target))}
                          </span>
                        </div>
                        {category !== 'Pesquisa Profunda' && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                              {t(SUB_CATEGORY_KEYS[category] || 'group.geral')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`
                      prose dark:prose-invert max-w-none text-sm md:text-base
                      ${msg.role === 'user' ? 'text-white' : 'dark:text-slate-200'}
                    `}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content as string}</p>
                      ) : (
                        <>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                          >
                            {((Array.isArray(msg.content) 
                              ? msg.content[msg.currentVersion || 0] 
                              : msg.content) || '').toString().replace(/\\n/g, '\n')}
                          </ReactMarkdown>
                          
                          {/* Skills Section - Only for the last assistant message in Antigravity mode */}
                          {idx === messages.length - 1 && target === 'Antigravity' && (
                            <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-3 text-primary">
                                <span className="material-symbols-outlined text-[18px]">terminal</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('chat.skills_title')}</span>
                              </div>
                              <div className="prose-sm dark:prose-invert prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                  {((msg.skillsContent && Array.isArray(msg.skillsContent)
                                    ? msg.skillsContent[msg.currentVersion || 0]
                                    : activePrompt?.skills_markdown) || '').toString().replace(/\\n/g, '\n')}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          {/* Version Navigation */}
                          {Array.isArray(msg.content) && msg.content.length > 1 && (
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-space-700 px-1.5 py-0.5 rounded-lg mr-2">
                              <button 
                                onClick={() => changeVersion(idx, Math.max(0, (msg.currentVersion || 0) - 1))}
                                disabled={(msg.currentVersion || 0) === 0}
                                className="material-symbols-outlined text-[14px] disabled:opacity-30"
                              >
                                chevron_left
                              </button>
                              <span className="text-[9px] font-bold min-w-[24px] text-center">
                                {(msg.currentVersion || 0) + 1} / {msg.content.length}
                              </span>
                              <button 
                                onClick={() => changeVersion(idx, Math.min(msg.content.length - 1, (msg.currentVersion || 0) + 1))}
                                disabled={(msg.currentVersion || 0) === msg.content.length - 1}
                                className="material-symbols-outlined text-[14px] disabled:opacity-30"
                              >
                                chevron_right
                              </button>
                            </div>
                          )}

                          {/* Regenerate Button */}
                          <button 
                            onClick={() => handleRegenerate(idx)}
                            disabled={loading}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-space-700 rounded-lg transition-all text-slate-500 dark:text-slate-400 flex items-center justify-center"
                            title="Regenerar resposta"
                          >
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                          </button>

                          {/* Copy Button */}
                          <button 
                            onClick={() => copyToClipboard(Array.isArray(msg.content) ? msg.content[msg.currentVersion || 0] : msg.content)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-space-700 rounded-lg transition-all text-slate-500 dark:text-slate-400 flex items-center justify-center"
                            title="Copiar resultado"
                          >
                            <span className={`material-symbols-outlined text-[18px] ${copied ? 'text-green-500' : ''}`}>
                              {copied ? 'check' : 'content_copy'}
                            </span>
                          </button>

                          {/* Share Button */}
                          <button 
                            onClick={() => {
                              const text = Array.isArray(msg.content) ? msg.content[msg.currentVersion || 0] : msg.content;
                              if (navigator.share) {
                                navigator.share({
                                  title: 'GraviPrompt Optimization',
                                  text: text,
                                  url: window.location.href
                                }).catch(console.error);
                              } else {
                                copyToClipboard(text);
                                alert('Link copiado para a área de transferência!');
                              }
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-space-700 rounded-lg transition-all text-slate-500 dark:text-slate-400 flex items-center justify-center"
                            title="Compartilhar"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start w-full max-w-4xl mx-auto"
                >
                    <div className="bg-white dark:bg-space-800 p-4 md:p-6 rounded-2xl rounded-tl-none shadow-md border border-slate-200 dark:border-white/10 max-w-[90%] relative">
                      <div className="flex items-center gap-2 mb-3 text-primary">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        <span className="text-[10px] font-bold tracking-widest uppercase">GraviPrompt AI</span>
                      </div>
                      <div className="flex flex-col gap-3 py-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin text-primary" size={24} />
                          <span className="text-sm text-slate-500 animate-pulse">
                            {target === 'Solução de Problemas' 
                              ? (profile?.language === 'en' ? 'Analyzing problem and generating solution...' : 'Analisando problema e gerando solução...') 
                              : target === 'Antigravity' 
                                ? (profile?.language === 'en' ? 'Optimizing prompt and searching for Skills...' : 'Otimizando prompt e buscando Skills...') 
                                : category === 'Pesquisa Profunda'
                                  ? (countdown === 0 || countdown === null 
                                      ? (profile?.language === 'en' ? 'Structuring response...' : 'Estruturando resposta...') 
                                      : (profile?.language === 'en' ? 'Performing real-time deep research...' : 'Realizando pesquisa profunda em tempo real...'))
                                  : `${profile?.language === 'en' ? 'Optimizing prompt for' : 'Otimizando prompt para'} ${t(SUB_CATEGORY_KEYS[category] || 'group.geral')}...`}
                          </span>
                        </div>
                        
                        {countdown !== null && (
                          <div className="w-full bg-slate-100 dark:bg-space-700 h-1.5 rounded-full overflow-hidden mt-2">
                            <motion.div 
                              initial={{ width: '0%' }}
                              animate={{ width: `${((researchTime - countdown) / researchTime) * 100}%` }}
                              className="h-full bg-primary"
                            />
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Progresso da Pesquisa</span>
                              <span className="text-[10px] text-primary font-bold">{countdown}s restantes</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-space-900 border-t border-slate-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Category Groups */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.id} className="relative">
                <button
                  id={`cat-group-${group.id}`}
                  onClick={() => {
                    setActiveGroup(group.id);
                    if (group.subCategories.length === 1) {
                      setCategory(group.subCategories[0]);
                      setIsCategoryDropdownOpen(false);
                    } else {
                      setIsCategoryDropdownOpen(activeGroup === group.id ? !isCategoryDropdownOpen : true);
                    }
                  }}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all flex items-center gap-1.5 ${
                    activeGroup === group.id 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                      : 'bg-slate-100 dark:bg-space-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-primary/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{group.icon}</span>
                  {group.subCategories.includes(category) && group.id !== 'geral' && group.id !== 'pesquisa'
                    ? t(SUB_CATEGORY_KEYS[category] || group.labelKey) 
                    : t(group.labelKey)}
                  {group.subCategories.length > 1 && (
                    <span className={`material-symbols-outlined text-[14px] transition-transform ${isCategoryDropdownOpen && activeGroup === group.id ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  )}
                </button>

                {/* Sub-category Dropdown */}
                <AnimatePresence>
                  {isCategoryDropdownOpen && activeGroup === group.id && group.subCategories.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                      ref={categoryDropdownRef}
                    >
                        {group.subCategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setCategory(sub);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between ${
                              category === sub 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            {t(SUB_CATEGORY_KEYS[sub] || 'group.geral')}
                            {category === sub && <span className="material-symbols-outlined text-[16px]">check</span>}
                          </button>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Main Input Box */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-theme blur opacity-30 group-focus-within:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-theme shadow-2xl overflow-visible">
              {category !== 'Pesquisa Profunda' && (
                <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-space-800/50 relative z-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-3">
                    {t('chat.target')}:
                  </span>
                  
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="target-dropdown"
                      onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all text-xs font-bold text-primary"
                    >
                      <TargetLogo target={target} className="w-4 h-4" />
                      {target}
                      <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isTargetDropdownOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    <AnimatePresence>
                      {isTargetDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5 z-[60]"
                        >
                          <div className="px-3 py-1.5 mb-1 border-b border-slate-100 dark:border-white/5">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('chat.target_models')}</span>
                          </div>
                          {TARGETS.map((t) => (
                            <button
                              key={t}
                              onClick={() => {
                                setTarget(t);
                                setIsTargetDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors ${
                                target === t 
                                  ? 'bg-primary/10 text-primary font-bold' 
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                              }`}
                            >
                              <TargetLogo target={t} className={`w-4 h-4 ${target === t ? 'text-primary' : 'opacity-70'}`} />
                              {t}
                              {target === t && (
                                <span className="material-symbols-outlined text-[14px] ml-auto">check</span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {category === 'Pesquisa Profunda' ? (
                <AnimatePresence>
                  {!isResearchMinimized && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 relative">
                        {/* Minimize Button inside the box */}
                        <button
                          onClick={() => setIsResearchMinimized(true)}
                          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors"
                          title={t('chat.minimize')}
                        >
                          <span className="material-symbols-outlined text-[20px]">close_fullscreen</span>
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-8">
                          {/* Tempo de Pesquisa */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('chat.research_time')}</label>
                            <select 
                              value={researchTime}
                              onChange={(e) => setResearchTime(Number(e.target.value))}
                              disabled={researchLevel === 'Challenger Deep'}
                              className="w-full bg-slate-50 dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-primary"
                            >
                              {researchLevel === 'Challenger Deep' ? (
                                <option value={90}>1min 30s</option>
                              ) : (
                                Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map(t => (
                                  <option key={t} value={t}>{t}s</option>
                                ))
                              )}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('chat.research_level')}</label>
                            <select 
                              value={researchLevel}
                              onChange={(e) => setResearchLevel(e.target.value as any)}
                              className="w-full bg-slate-50 dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-primary"
                            >
                              <option value="Superficial">{t('chat.level.superficial')}</option>
                              <option value="Mediano">{t('chat.level.mediano')}</option>
                              <option value="Profundo">{t('chat.level.profundo')}</option>
                              <option value="Challenger Deep">{t('chat.level.challenger')}</option>
                            </select>
                          </div>

                          {/* Opções das Fontes */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('chat.source_count')}</label>
                            <select 
                              value={sourceCount}
                              onChange={(e) => setSourceCount(Number(e.target.value))}
                              disabled={researchLevel === 'Challenger Deep'}
                              className="w-full bg-slate-50 dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-primary"
                            >
                              {researchLevel === 'Challenger Deep' ? (
                                <option value={20}>20 {t('chat.sources').toLowerCase()}</option>
                              ) : (
                                Array.from({ length: 8 }, (_, i) => i + 3).map(s => (
                                  <option key={s} value={s}>{s} {t('chat.sources').toLowerCase()}</option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('chat.research_topic')}</label>
                          <input 
                            type="text"
                            value={researchTopic}
                            onChange={(e) => setResearchTopic(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                              }
                            }}
                            placeholder={t('chat.research_topic_placeholder')}
                            className="w-full bg-slate-50 dark:bg-space-900 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm dark:text-white focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        {/* Mostrar Fontes Toggle and Send Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 mt-2">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setShowSources(!showSources)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showSources ? 'bg-primary' : 'bg-slate-200 dark:bg-space-700'}`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${showSources ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mostrar links das fontes</span>
                          </div>
                          
                          <button 
                            onClick={handleOptimize}
                            disabled={!loading && !researchTopic.trim()}
                            className={`flex items-center gap-2 px-4 py-2 ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-primary/20 font-bold text-xs`}
                          >
                            {loading ? (
                              <>
                                <span className="material-symbols-outlined text-[18px]">stop</span>
                                Parar
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[18px]">search</span>
                                Iniciar Pesquisa
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <div className="relative flex-1 flex items-end">
                  <textarea
                    id="chat-input"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleOptimize();
                      }
                    }}
                    placeholder={t('chat.placeholder')}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 p-4 pr-24 resize-none block min-h-[56px] overflow-y-auto"
                    rows={1}
                  />
                  <div className="absolute right-12 bottom-2 flex items-center gap-1">
                    <button
                      onClick={() => setIsZoomed(!isZoomed)}
                      className={`p-2 rounded-lg transition-colors ${isZoomed ? 'text-primary bg-primary/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                      title={isZoomed ? "Reduzir" : "Zoom-in"}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isZoomed ? 'zoom_in_map' : 'zoom_out_map'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
              
              {category === 'Pesquisa Profunda' && isResearchMinimized && (
                <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => setIsResearchMinimized(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-primary transition-colors flex-shrink-0"
                      title="Expandir opções"
                    >
                      <span className="material-symbols-outlined text-[20px]">open_in_full</span>
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tópico de Pesquisa:</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                        {researchTopic || 'Nenhum tópico definido'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleOptimize}
                    disabled={!loading && !researchTopic.trim()}
                    className={`p-2 ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center ml-4`}
                    title={loading ? "Parar geração" : "Enviar pesquisa"}
                  >
                    {loading ? <span className="material-symbols-outlined text-[18px]">stop</span> : <span className="material-symbols-outlined text-[18px]">search</span>}
                  </button>
                </div>
              )}

              {category !== 'Pesquisa Profunda' && (
                <div className="absolute right-2 bottom-2">
                  <button 
                    id="send-button"
                    onClick={handleOptimize}
                    disabled={!loading && !input.trim()}
                    className={`p-2 ${loading ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-theme transition-colors shadow-lg shadow-primary/20`}
                    title={loading ? "Parar geração" : "Enviar mensagem"}
                  >
                    {loading ? <span className="material-symbols-outlined">stop</span> : <span className="material-symbols-outlined">arrow_forward</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            GraviPrompt pode gerar imprecisões. Revise sempre as saídas.
          </p>
        </div>
      </div>

      {/* Zoomed Input Overlay */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-white dark:bg-[#221610] p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editor de Prompt</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Escreva seu prompt com foco total</p>
                </div>
              </div>
              <button 
                onClick={() => setIsZoomed(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-600 dark:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <textarea
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 w-full bg-slate-50 dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-lg text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 resize-none outline-none"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsZoomed(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Voltar ao Chat
              </button>
              <button
                onClick={() => {
                  handleOptimize();
                  setIsZoomed(false);
                }}
                disabled={!input.trim() || loading}
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="material-symbols-outlined">send</span>}
                Otimizar Agora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
