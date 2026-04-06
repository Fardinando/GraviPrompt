import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart } from 'lucide-react';
import { supporters, Supporter } from '../data/supporters';

interface SupportersProps {
  onBack: () => void;
}

export default function Supporters({ onBack }: SupportersProps) {
  // Extract all background images for the dynamic background
  const backgroundImages = supporters.map(s => s.bgImage);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-space-900 text-slate-900 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
      {/* Dynamic Blurred Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-8 w-[140%] h-[140%] -translate-x-[20%] -translate-y-[20%] blur-[100px]">
          {backgroundImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 3, 
                delay: i * 0.4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="relative aspect-square rounded-full overflow-hidden"
            >
              <img 
                src={img} 
                alt="" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-space-900/70 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
            <span className="text-xl font-black tracking-tight">Apoiadores</span>
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-24 md:gap-40">
          <header className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 uppercase tracking-widest"
            >
              <Heart className="w-3 h-3 fill-primary" />
              Nossa Gratidão
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none"
            >
              Nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Comunidade</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Pessoas incríveis que acreditam no projeto e ajudam a tornar o GraviPrompt realidade. Cada apoio é um passo em direção ao futuro.
            </motion.p>
          </header>

          <div className="flex flex-col gap-32 md:gap-48">
            {supporters.map((supporter, index) => (
              <SupporterCard 
                key={supporter.name} 
                supporter={supporter} 
                isEven={index % 2 === 0} 
              />
            ))}
          </div>

          {/* Free Format Images Gallery */}
          <section className="mt-16">
            <header className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Momentos da <span className="text-primary">Comunidade</span></h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Imagens enviadas por nossos apoiadores ao redor do mundo.</p>
            </header>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {supporters.filter(s => s.extraImage).map((supporter, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group overflow-hidden rounded-2xl shadow-lg"
                >
                  <img 
                    src={supporter.extraImage} 
                    alt={`Enviada por ${supporter.name}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Apoio de {supporter.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="text-center py-20 bg-white/40 dark:bg-white/5 backdrop-blur-md rounded-[3rem] border border-primary/10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Quer aparecer aqui?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto font-medium">
              Sua marca ou seu nome podem fazer parte desta história. Entre em contato e saiba como apoiar o GraviPrompt.
            </p>
            <a 
              href="https://www.patreon.com/posts/154938962" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              Seja um Apoiador
            </a>
          </section>

          <footer className="text-center">
            <p className="text-slate-400 text-sm font-medium">
              © 2026 GraviPrompt Inc. Todos os direitos Reservados.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function SupporterCard({ supporter, isEven }: { supporter: Supporter, isEven: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20 group`}
    >
      {/* Image Container */}
      <div className="relative w-full md:w-1/2 aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-700 z-10"></div>
        <img 
          src={supporter.mainImage} 
          alt={supporter.name} 
          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-1000 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Subtle Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20"></div>
      </div>

      {/* Text Container */}
      <div className={`w-full md:w-1/2 text-center ${isEven ? 'md:text-left' : 'md:text-right'}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className={`flex items-center gap-3 mb-6 ${isEven ? 'justify-start' : 'justify-end'}`}>
            <div className="w-12 h-px bg-primary/30"></div>
            <span className="text-primary font-bold text-sm uppercase tracking-widest">Apoiador Gold</span>
            <div className="w-12 h-px bg-primary/30"></div>
          </div>
          <h3 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter group-hover:text-primary transition-colors duration-500">
            {supporter.name}
          </h3>
          <div className={`relative p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm group-hover:border-primary/30 transition-all duration-500`}>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
              "{supporter.text}"
            </p>
            {/* Decorative Quote Mark */}
            <span className="absolute -top-4 -left-4 text-6xl text-primary/10 font-serif">“</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
