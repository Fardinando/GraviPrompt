import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: 'chunk' | 'generic' | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorType: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Detect if it's a chunk load error (common after deployment)
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk') || error.message.includes('Failed to fetch dynamically imported module')) {
      return { hasError: true, errorType: 'chunk' };
    }
    return { hasError: true, errorType: 'generic' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f2f5] dark:bg-space-900 flex items-center justify-center p-6 transition-colors font-sans">
          <div className="max-w-md w-full bg-white dark:bg-space-800 rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-slate-200 dark:border-white/10">
            <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-500/10 rounded-2xl text-red-500">
              <span className="material-symbols-outlined text-[48px]">
                {this.state.errorType === 'chunk' ? 'update' : 'error'}
              </span>
            </div>
            
            <h1 className="text-2xl font-black dark:text-white tracking-tight">
              {this.state.errorType === 'chunk' ? 'Nova versão disponível!' : 'Ops! Algo deu errado'}
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {this.state.errorType === 'chunk' 
                ? 'Acabamos de lançar uma atualização para o GraviPrompt. Precisamos recarregar a página para que você use as ferramentas mais recentes.'
                : 'Ocorreu um erro inesperado no sistema. Não se preocupe, seus dados salvos estão seguros.'}
            </p>

            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 text-[10px] text-amber-700 dark:text-amber-400 font-medium italic">
              Nota: Nem todas as páginas de erro foram debugadas ainda, então podem haver bugs nas próprias páginas de erro.
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              {this.state.errorType === 'chunk' ? 'Atualizar Agora' : 'Tentar Novamente'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
