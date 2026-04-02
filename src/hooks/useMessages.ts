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
        .is('read_at', null)
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('mark_message_as_read', { p_message_id: id });

      if (error) {
        const message = (error.message || '').toLowerCase();
        const rpcMissing = message.includes('function') && message.includes('mark_message_as_read');

        // Compatibilidade durante deploy gradual: se RPC ainda nao estiver aplicada, tenta fluxo antigo.
        if (rpcMissing) {
          const { error: legacyError } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', id);

          if (legacyError) throw legacyError;
          return id;
        }

        throw error;
      }

      if (data !== true) {
        throw new Error('Sem permissão para marcar esta mensagem como lida.');
      }

      return id;
    },
    onSuccess: (id) => {
      // Remove da caixa local imediatamente para refletir inbox apenas com não lidas.
      queryClient.setQueryData<Message[]>(['messages'], (old) => {
        if (!old) return old;
        return old.filter((msg) => msg.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread_count'] });
      toast({ title: 'Mensagem lida e removida da caixa' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao marcar como lida', description: error.message, variant: 'destructive' });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: {
      church_id?: string;
      sender_id: string;
      recipient_id?: string;
      recipient_team_id?: string;
      subject?: string;
      content: string;
      is_broadcast?: boolean;
    }) => {
      let churchId = message.church_id;

      if (!churchId) {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        if (!currentUserId) {
          throw new Error('Usuário não autenticado para enviar mensagem.');
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('church_id')
          .eq('user_id', currentUserId)
          .limit(1)
          .maybeSingle();

        if (roleError) throw roleError;
        if (!roleData?.church_id) {
          throw new Error('Não foi possível identificar a igreja para envio da mensagem.');
        }

        churchId = roleData.church_id;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({ ...message, church_id: churchId })
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
