import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-space-900 flex items-center justify-center p-6 transition-colors font-sans">
      <div className="max-w-md w-full bg-white dark:bg-space-800 rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-slate-200 dark:border-white/10">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center p-6 bg-primary/10 rounded-3xl text-primary">
            <span className="material-symbols-outlined text-[64px]">explore_off</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black dark:text-white tracking-tighter">404</h1>
          <h2 className="text-xl font-bold dark:text-slate-200">Página não encontrada</h2>
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Parece que você tentou acessar um caminho que não existe ou foi movido. 
          Para quem não é programador: imagine que você tentou abrir uma gaveta que foi retirada do armário.
        </p>

        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-700 dark:text-amber-400 font-medium italic">
          Nota: Nem todas as páginas de erro foram debugadas ainda, então podem haver bugs nas próprias páginas de erro.
        </div>

        <a
          href="/"
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 no-underline"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Voltar para o Início
        </a>
      </div>
    </div>
  );
}
