import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  church_id: string;
  sender_id: string | null;
  recipient_id: string | null;
  recipient_team_id: string | null;
  subject: string | null;
  content: string;
  is_broadcast: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  recipient?: {
    id: string;
    name: string;
  };
  recipient_team?: {
    id: string;
    name: string;
  };
}

export function useMessages() {
  return useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey(id, name),
          recipient_team:teams!messages_recipient_team_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Message[];
    },
  });
}

export function useUnreadMessagesCount() {
  return useQuery({
    queryKey: ['messages', 'unread_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .is('read_at', null);
      
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: {
      church_id: string;
      sender_id: string;
      recipient_id?: string;
      recipient_team_id?: string;
      subject?: string;
      content: string;
      is_broadcast?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({ title: 'Mensagem enviada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao enviar mensagem', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({ title: 'Mensagem excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir mensagem', description: error.message, variant: 'destructive' });
    },
  });
}
