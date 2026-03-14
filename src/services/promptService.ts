import { supabase } from '../lib/supabase';
import { OptimizedPrompt } from '../types';

export const promptService = {
  async savePrompt(prompt: Partial<OptimizedPrompt>): Promise<{ data: OptimizedPrompt | null; error: any }> {
    const { id, ...data } = prompt;
    
    if (id && !id.includes('-')) { // Simple check for local vs remote ID (remote IDs are usually UUIDs)
      // This is likely a remote ID, try to update
      const { data: updatedData, error } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error && (error.code === 'PGRST204' || error.message?.includes('messages'))) {
        console.warn('Coluna "messages" não encontrada no update, tentando sem ela.');
        const { messages, ...dataWithoutMessages } = data;
        return await supabase
          .from('prompts')
          .update(dataWithoutMessages)
          .eq('id', id)
          .select()
          .single();
      }
      
      return { data: updatedData, error };
    } else {
      // New prompt or local-only prompt, try to insert
      const { data: insertedData, error } = await supabase
        .from('prompts')
        .insert(data)
        .select()
        .single();
      
      if (error && (error.code === 'PGRST204' || error.message?.includes('messages'))) {
        console.warn('Coluna "messages" não encontrada no insert, tentando sem ela.');
        const { messages, ...dataWithoutMessages } = data;
        return await supabase
          .from('prompts')
          .insert(dataWithoutMessages)
          .select()
          .single();
      }
      
      return { data: insertedData, error };
    }
  },

  async deletePrompt(id: string): Promise<{ error: any }> {
    return await supabase
      .from('prompts')
      .delete()
      .eq('id', id);
  },

  async clearHistory(userId: string): Promise<{ error: any }> {
    return await supabase
      .from('prompts')
      .delete()
      .eq('user_id', userId);
  },

  async fetchHistory(userId: string): Promise<{ data: OptimizedPrompt[] | null; error: any }> {
    return await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async renamePrompt(id: string, title: string): Promise<{ data: OptimizedPrompt | null; error: any }> {
    return await supabase
      .from('prompts')
      .update({ title })
      .eq('id', id)
      .select()
      .single();
  }
};
