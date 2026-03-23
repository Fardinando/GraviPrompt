export interface UserProfile {
  id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en';
  full_name?: string;
  ai_model?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | string[]; // Support multiple versions for assistant
  skillsContent?: string[]; // Support multiple versions of skills for assistant
  currentVersion?: number;
  timestamp: string;
}

export interface OptimizedPrompt {
  id: string;
  user_id: string;
  created_at: string;
  category: string;
  original_prompt: string;
  optimized_prompt: string;
  github_links?: string[];
  skills_markdown?: string;
  title: string;
  messages?: ChatMessage[];
}

export type Category = 
  | 'UI Design' | 'Game Dev' | 'Web Sites' | 'Data Science' 
  | 'História Longa' | 'Texto Formal' | 'E-mail Profissional' | 'Artigo/Blog'
  | 'Realista' | 'Artístico' | 'Logo/Ícone' | '3D/Render'
  | 'General' 
  | 'Pesquisa Profunda';
