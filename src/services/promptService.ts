import { supabase } from '../lib/supabase';
import { OptimizedPrompt } from '../types';

export const promptService = {
  async savePrompt(prompt: Partial<OptimizedPrompt>): Promise<{ data: OptimizedPrompt | null; error: any }> {
    const client = supabase;
    const { id, ...data } = prompt;
    
    // Remote IDs (Supabase UUIDs) ALWAYS include hyphens.
    // If we have an ID and it looks like a remote one, we update.
    if (id && id.includes('-')) { 
      const { data: updatedData, error } = await client
        .from('prompts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error && (error.code === 'PGRST204' || error.message?.includes('messages'))) {
        console.warn('Coluna "messages" não encontrada no update, tentando sem ela.');
        const { messages, ...dataWithoutMessages } = data;
        return await client
          .from('prompts')
          .update(dataWithoutMessages)
          .eq('id', id)
          .select()
          .single();
      }
      
      return { data: updatedData, error };
    } else {
      // New prompt or local-only prompt, try to insert
      const { data: insertedData, error } = await client
        .from('prompts')
        .insert(data)
        .select()
        .single();
      
      if (error && (error.code === 'PGRST204' || error.message?.includes('messages'))) {
        console.warn('Coluna "messages" não encontrada no insert, tentando sem ela.');
        const { messages, ...dataWithoutMessages } = data;
        return await client
          .from('prompts')
          .insert(dataWithoutMessages)
          .select()
          .single();
      }
      
      return { data: insertedData, error };
    }
  },

  async deletePrompt(id: string): Promise<{ error: any }> {
    const client = supabase;
    return await client
      .from('prompts')
      .delete()
      .eq('id', id);
  },

  async clearHistory(userId: string): Promise<{ error: any }> {
    const client = supabase;
    return await client
      .from('prompts')
      .delete()
      .eq('user_id', userId);
  },

  async fetchHistory(userId: string): Promise<{ data: OptimizedPrompt[] | null; error: any }> {
    const client = supabase;
    return await client
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async renamePrompt(id: string, title: string): Promise<{ data: OptimizedPrompt | null; error: any }> {
    const client = supabase;
    return await client
      .from('prompts')
      .update({ title })
      .eq('id', id)
      .select()
      .single();
  }
};
