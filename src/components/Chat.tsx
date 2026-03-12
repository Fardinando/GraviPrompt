import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, Check, Github, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function Chat({ user, activePrompt, onSave }: ChatProps) {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<Category>('UI Design');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activePrompt) {
      setResult(activePrompt.optimized_prompt);
      setInput(activePrompt.original_prompt);
      setCategory(activePrompt.category as Category);
    } else {
      setResult(null);
      setInput('');
    }
  }, [activePrompt]);

  const handleOptimize = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const optimized = await optimizePrompt(input, category);
      setResult(optimized);

      // Save to Supabase
      const newPrompt = {
        user_id: user.id,
        category,
        original_prompt: input,
        optimized_prompt: optimized,
        title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
        github_links: [], // Could be extracted from AI response if needed
      };

      const { data, error } = await supabase
        .from('prompts')
        .insert(newPrompt)
        .select()
        .single();

      if (!error && data) {
        onSave(data);
      }
    } catch (err) {
      alert('Erro ao otimizar prompt. Verifique sua conexão e chave de API.');
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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl w-full text-center space-y-6 mt-20"
            >
              <div className="inline-flex items-center justify-center p-4 bg-brand/10 rounded-2xl mb-4 text-brand">
                <Sparkles size={40} />
              </div>
              <h2 className="text-4xl font-black dark:text-white tracking-tight">O que vamos otimizar hoje?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Insira seu prompt abaixo e deixe o GraviPrompt elevar o nível da sua criação.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl w-full space-y-6 pb-40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-full text-xs font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  Prompt Otimizado
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-space-800 hover:bg-slate-200 dark:hover:bg-space-700 rounded-lg text-sm font-medium transition-all dark:text-white"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <div className="bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-xl prose dark:prose-invert max-w-none">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              {activePrompt?.github_links && activePrompt.github_links.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Links Úteis</h4>
                  <div className="flex flex-wrap gap-3">
                    {activePrompt.github_links.map((link, i) => (
                      <a 
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-slate-800 transition-all"
                      >
                        <Github size={16} />
                        Ver no GitHub
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-white via-white dark:from-space-900 dark:via-space-900 to-transparent absolute bottom-0 left-0 right-0">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  category === cat 
                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                    : 'bg-slate-100 dark:bg-space-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-brand/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main Input Box */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/20 to-blue-600/20 rounded-theme blur opacity-30 group-focus-within:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 rounded-theme shadow-2xl overflow-hidden">
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
                  className="p-2 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-theme transition-colors shadow-lg shadow-brand/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
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
