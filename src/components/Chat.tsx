import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Category, OptimizedPrompt } from '../types';
import { optimizePrompt } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface ChatProps {
  user: any;
  activePrompt: OptimizedPrompt | null;
  onSave: (prompt: OptimizedPrompt) => void;
}

const CATEGORIES: Category[] = ['UI Design', 'Game Dev', 'Web Sites', 'Data Science', 'General'];
const TARGETS = [
  'ChatGPT', 
  'Grok', 
  'Claude', 
  'Deepseek', 
  'Gemini', 
  'Antigravity', 
  'Solução de Problemas'
];

export default function Chat({ user, activePrompt, onSave }: ChatProps) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<Category>('UI Design');
  const [target, setTarget] = useState('ChatGPT');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentOriginal, setCurrentOriginal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [result, loading, currentOriginal]);

  useEffect(() => {
    if (activePrompt) {
      setResult(activePrompt.optimized_prompt);
      setCurrentOriginal(activePrompt.original_prompt);
      setInput('');
      setCategory(activePrompt.category as Category);
    } else {
      // This is the "New Optimization" state
      setResult(null);
      setCurrentOriginal(null);
      setInput('');
      setLoading(false);
    }
  }, [activePrompt]);

  const handleOptimize = async () => {
    if (!input.trim() || loading) return;

    const originalText = input;
    setLoading(true);
    setResult(null); // Clear previous result if any
    setCurrentOriginal(originalText);
    setInput('');
    
    try {
      const { optimizedPrompt, title } = await optimizePrompt(originalText, category, target);
      setResult(optimizedPrompt);

      const newPrompt = {
        user_id: user.id,
        category,
        original_prompt: originalText,
        optimized_prompt: optimizedPrompt,
        title: title,
        github_links: [],
      };

      // Tenta salvar no Supabase
      try {
        const { data, error } = await supabase
          .from('prompts')
          .insert(newPrompt)
          .select()
          .single();

        if (error) {
          console.error('Erro Supabase:', error);
          // Se falhar por causa da coluna 'title', tenta sem ela
          if (error.message.includes('column "title"')) {
            const fallbackPrompt = { ...newPrompt };
            delete (fallbackPrompt as any).title;
            const { data: fbData, error: fbError } = await supabase
              .from('prompts')
              .insert(fallbackPrompt)
              .select()
              .single();
            
            if (!fbError && fbData) {
              onSave({ ...fbData, title: newPrompt.title });
            } else {
              // Se tudo falhar, salva localmente no estado do pai
              onSave({ ...newPrompt, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any);
            }
          } else {
            // Outro erro, salva localmente para não perder a sessão
            onSave({ ...newPrompt, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any);
          }
        } else if (data) {
          onSave(data);
        }
      } catch (dbErr) {
        console.error('Erro DB Crítico:', dbErr);
        onSave({ ...newPrompt, id: crypto.randomUUID(), created_at: new Date().toISOString() } as any);
      }
    } catch (err) {
      console.error(err);
      alert('Falha ao chamar a API Gemini. Verifique sua conexão.');
      setResult(null);
      setCurrentOriginal(null);
      setInput(originalText);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5] dark:bg-space-900 transition-colors">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
        <AnimatePresence mode="popLayout">
          {!currentOriginal && !loading ? (
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
              {/* User Message Bubble */}
              {currentOriginal && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end w-full max-w-4xl mx-auto"
                >
                  <div className="bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[85%] relative">
                    <p className="text-sm md:text-base whitespace-pre-wrap">{currentOriginal}</p>
                    <div className="text-[10px] opacity-70 text-right mt-1">Você</div>
                  </div>
                </motion.div>
              )}

              {/* AI Message Bubble */}
              {(loading || result) && (
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
                    
                    {loading ? (
                      <div className="flex items-center gap-3 py-4">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <span className="text-sm text-slate-500 animate-pulse">Otimizando seu prompt e buscando Skills...</span>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-base dark:text-slate-200">
                        <ReactMarkdown>{result || ''}</ReactMarkdown>
                      </div>
                    )}

                    {!loading && result && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-space-700 rounded-lg text-xs font-bold transition-all text-slate-500 dark:text-slate-400"
                        >
                          <span className={`material-symbols-outlined text-[16px] ${copied ? 'text-green-500' : ''}`}>
                            {copied ? 'check' : 'content_copy'}
                          </span>
                          {copied ? 'COPIADO' : 'COPIAR RESULTADO'}
                        </button>
                      </div>
                    )}
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
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  category === cat 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                    : 'bg-slate-100 dark:bg-space-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main Input Box */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-theme blur opacity-30 group-focus-within:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-theme shadow-2xl overflow-hidden">
              <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-space-800/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Otimizar para:</span>
                <select 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-primary focus:ring-0 p-0 cursor-pointer"
                >
                  {TARGETS.map(t => (
                    <option key={t} value={t} className="bg-white dark:bg-space-800">{t}</option>
                  ))}
                </select>
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleOptimize();
                  }
                }}
                placeholder="Descreva seu projeto ou cole seu prompt..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 p-4 pr-16 resize-none block min-h-[60px] max-h-[200px]"
                rows={1}
              />
              <div className="absolute right-2 bottom-2">
                <button 
                  onClick={handleOptimize}
                  disabled={loading || !input.trim()}
                  className="p-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-theme transition-colors shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 dark:text-slate-500">
            GraviPrompt pode gerar imprecisões. Revise sempre as saídas.
          </p>
        </div>
      </div>
    </div>
  );
}
