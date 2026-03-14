import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Variáveis de ambiente do Supabase não encontradas.');
  console.warn('Certifique-se de configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env ou no painel do Vercel.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
