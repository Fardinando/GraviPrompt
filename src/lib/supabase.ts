import { createClient } from '@supabase/supabase-js';

// GraviPrompt Supabase (Data)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// CodingCourse Supabase (Auth)
const ccSupabaseUrl = import.meta.env.VITE_CODINGCOURSE_SUPABASE_URL;
const ccSupabaseAnonKey = import.meta.env.VITE_CODINGCOURSE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis do Supabase GraviPrompt não encontradas.');
}

if (!ccSupabaseUrl || !ccSupabaseAnonKey) {
  console.warn('AVISO: Variáveis do Supabase CodingCourse não encontradas. O login compartilhado pode não funcionar.');
}

// Cliente principal para Dados (GraviPrompt)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: 'graviprompt-auth-token',
      persistSession: true,
    }
  }
);

// Cliente para Autenticação (CodingCourse)
export const supabaseCC = createClient(
  ccSupabaseUrl || 'https://placeholder-cc.supabase.co', 
  ccSupabaseAnonKey || 'placeholder',
  {
    auth: {
      storageKey: 'codingcourse-auth-token',
      persistSession: true,
    }
  }
);

// Helper para saber qual cliente de auth usar
export const getActiveAuthClient = () => {
  const provider = localStorage.getItem('gp-auth-provider') || 'graviprompt';
  return provider === 'codingcourse' ? supabaseCC : supabase;
};

/**
 * Retorna o cliente Supabase para operações de DADOS (sempre GraviPrompt)
 */
export const getDataClient = () => supabase;

export const setActiveAuthProvider = (provider: 'graviprompt' | 'codingcourse') => {
  localStorage.setItem('gp-auth-provider', provider);
};

/**
 * Função utilitária para obter o cliente de dados com o token de autenticação do CodingCourse.
 * Isso é necessário se os projetos forem diferentes e você quiser usar RLS.
 * NOTA: Para que isso funcione com RLS, ambos os projetos DEVEM compartilhar o mesmo JWT Secret.
 */
export const getSupabaseWithAuth = async () => {
  const { data: { session } } = await supabaseCC.auth.getSession();
  if (session?.access_token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    });
  }
  return supabase;
};
