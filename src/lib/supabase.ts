import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas no Build.');
  console.warn('1. Vá ao painel da Vercel > Settings > Environment Variables.');
  console.warn('2. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  console.warn('3. Vá em Deployments e faça um REDEPLOY do seu projeto.');
}

// Inicializa apenas se tiver os valores, caso contrário exporta um proxy ou null
// para evitar o erro "supabaseUrl is required" que trava o app
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-url.supabase.co', 'placeholder-key'); // Fallback para não crashar o import
