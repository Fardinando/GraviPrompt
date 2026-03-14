import React from 'react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onStart, onLogin }: LandingPageProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareData = {
      title: 'GraviPrompt - Otimização de Prompts Gratuita',
      text: 'Eleve seus prompts de IA com otimização profissional e gratuita!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Simple visual feedback could be added here if needed
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-300 min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-background-dark/70 backdrop-blur-xl border-b border-primary/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">GraviPrompt</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#features">Features</a>
            <div className="relative">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Enterprise</a>
              <span className="absolute -top-3 -right-14 px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold rounded-full uppercase tracking-tighter">
                100% Free Forever
              </span>
            </div>
            <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Documentation</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-5 py-2 text-sm font-semibold hover:text-primary transition-colors"
            >
              Login
            </button>
            <button 
              onClick={onStart}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Start Optimizing
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 bg-background-light dark:bg-background-dark transition-colors">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-widest"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            100% Free Forever
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight tracking-tighter mb-6 text-slate-900 dark:text-slate-100"
          >
            Elevate Your AI Prompts with <span className="text-primary font-black">Unlimited Free</span> Optimization
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-light"
          >
            The premier optimization engine for UI Design, Game Dev, and Data Science. Engineering precision for the next generation of workflows. <span className="font-semibold text-slate-900 dark:text-slate-200 border-2 border-dashed border-primary/40 px-2 py-1 rounded-lg">Unlimited access for everyone.</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button 
              onClick={onStart}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Get Started Now
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </motion.div>

          {/* Interface Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl"
          >
            <div className="bg-slate-100 dark:bg-space-800 p-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20"></div>
                <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-white/20"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-space-900 aspect-video relative group flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              <img 
                alt="Screenshot of a clean modern AI chat interface showing prompt optimization steps" 
                className="w-full h-full object-cover opacity-90" 
                src="https://picsum.photos/seed/graviprompt/1200/800"
                referrerPolicy="no-referrer"
              />
              <button className="absolute z-10 flex items-center justify-center rounded-full w-20 h-20 bg-primary/90 text-white shadow-2xl hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl fill-1">play_arrow</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-space-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Full Professional Power. Zero Cost.</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Get unrestricted access to our specialized optimization engines.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* UI Design Feature */}
            <div className="p-8 rounded-2xl bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">palette</span>
              </div>
              <h3 className="text-xl font-bold mb-3">UI Design</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate pixel-perfect design systems, accessible color palettes, and component libraries instantly with layout-aware prompts.
              </p>
            </div>
            {/* Game Dev Feature */}
            <div className="p-8 rounded-2xl bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">sports_esports</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Game Dev</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Refine complex game logic, narrative branching, and character behaviors with context-retaining optimization algorithms.
              </p>
            </div>
            {/* Data Science Feature */}
            <div className="p-8 rounded-2xl bg-white dark:bg-space-800 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-2xl">database</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Data Science</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Architect robust data models and complex algorithmic queries for maximum efficiency and statistical accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interface Deep Dive */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Enterprise Tools for Everyone.</h2>
            <div className="space-y-6">
              {[
                { title: 'Unrestricted Access', desc: 'Every feature is available for free. No credit card, no subscriptions, no limits.' },
                { title: 'One-Click Refining', desc: 'Take a basic idea to a master-level prompt in milliseconds using our proprietary engine.' },
                { title: 'Team Collaboration', desc: 'Shared prompt libraries for design and engineering teams to stay in sync at zero cost.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={onStart}
              className="mt-10 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Explore All Free Features
            </button>
          </div>
          <div className="relative bg-primary/5 rounded-3xl p-4 md:p-8 border border-primary/10">
            <div className="bg-white dark:bg-[#1a110d] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-primary/10">
              <div className="p-6 border-b border-slate-100 dark:border-primary/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary"></div>
                  <span className="font-bold text-sm tracking-wide uppercase">Gravi-Refiner</span>
                </div>
                <span className="material-symbols-outlined text-slate-400">more_horiz</span>
              </div>
              <div className="p-8 h-[400px] flex flex-col justify-end gap-6">
                <div className="self-end bg-primary text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] text-sm font-medium">
                  Create a hero section for a dark-themed space app.
                </div>
                <div className="self-start bg-slate-100 dark:bg-[#2a1d17] p-4 rounded-2xl rounded-tl-none max-w-[80%] text-sm border border-slate-200 dark:border-primary/10">
                  <div className="flex gap-2 items-center mb-2 text-primary">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase">Optimized Prompt</span>
                  </div>
                  Generate a high-conversion hero section UI. Theme: Deep Space (#0A0A0B). Layout: Centered H1 with 800 weight, secondary CTA with subtle glassmorphism...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-[#150d09] border-t border-slate-200 dark:border-primary/10 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">rocket_launch</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight">GraviPrompt</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Building the future of human-AI collaboration through precision prompt engineering. Always free, always open.
            </p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined">public</span></a>
              <a className="text-slate-400 hover:text-primary" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
              <button 
                onClick={handleShare}
                className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                title="Compartilhar página"
              >
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            <div>
              <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-primary">Product</h5>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a className="hover:text-primary" href="#">Features</a></li>
                <li><a className="hover:text-primary" href="#">Integrations</a></li>
                <li><a className="hover:text-primary" href="#">Enterprise</a></li>
                <li><a className="hover:text-primary" href="#">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-primary">Resources</h5>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a className="hover:text-primary" href="#">Documentation</a></li>
                <li><a className="hover:text-primary" href="#">Prompt Guide</a></li>
                <li><a className="hover:text-primary" href="#">API Reference</a></li>
                <li><a className="hover:text-primary" href="#">Community</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4 text-xs uppercase tracking-widest text-primary">Company</h5>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li><a className="hover:text-primary" href="#">About Us</a></li>
                <li><a className="hover:text-primary" href="#">Careers</a></li>
                <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 dark:border-primary/5 text-center text-xs text-slate-400">
          © 2026 GraviPrompt AI Systems Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
