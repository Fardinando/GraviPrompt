export interface UserProfile {
  id: string;
  theme: 'light' | 'dark' | 'system';
  full_name?: string;
}

export interface OptimizedPrompt {
  id: string;
  user_id: string;
  created_at: string;
  category: string;
  original_prompt: string;
  optimized_prompt: string;
  github_links?: string[];
  title: string;
}

export type Category = 'UI Design' | 'Game Dev' | 'Web Sites' | 'Data Science' | 'General';
