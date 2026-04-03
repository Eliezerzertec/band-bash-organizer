import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageRead {
  profile_id: string;
  read_at: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

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
  sender?: { id: string; name: string; avatar_url: string | null };
  recipient?: { id: string; name: string };
  recipient_team?: { id: string; name: string };
  message_reads?: MessageRead[];
  is_read_by_me?: boolean;
}

const MESSAGE_HISTORY_LIMIT = 10;

const BASE_SELECT = `
  *,
  sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
  recipient:profiles!messages_recipient_id_fkey(id, name),
  recipient_team:teams!messages_recipient_team_id_fkey(id, name)
`;

export function useMessages(profileId?: string) {
  return useQuery({
    queryKey: ['messages', 'inbox', profileId],
    queryFn: async () => {
      // Tenta buscar com rastreamento individual de leitura (requer migração 20260402)
      const { data, error } = await supabase
        .from('messages')
        .select(`${BASE_SELECT}, message_reads(profile_id, read_at)`)
        .order('created_at', { ascending: false })
        .limit(MESSAGE_HISTORY_LIMIT);

      if (error) {
        // Tabela message_reads ainda não existe → usa fallback com read_at legado
        const { data: fallback, error: fallbackError } = await supabase
          .from('messages')
          .select(BASE_SELECT)
          .order('created_at', { ascending: false })
          .limit(MESSAGE_HISTORY_LIMIT);
        if (fallbackError) throw fallbackError;
        return (fallback as Message[]).map((msg) => ({
          ...msg,
          message_reads: [],
          is_read_by_me: profileId
            ? msg.recipient_id === profileId ? msg.read_at !== null : false
            : msg.read_at !== null,
        }));
      }

      return (data as Message[]).map((msg) => ({
        ...msg,
        is_read_by_me: profileId
          ? (msg.message_reads ?? []).some((r) => r.profile_id === profileId)
          : msg.read_at !== null,
      }));
    },
  });
}

export function useUnreadMessagesCount(profileId?: string) {
  return useQuery({
    queryKey: ['messages', 'unread_count', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      // Tenta usar message_reads (requer migração 20260402)
      const { data, error } = await supabase
        .from('messages')
        .select('id, message_reads(profile_id)')
        .order('created_at', { ascending: false })
        .limit(MESSAGE_HISTORY_LIMIT);

      if (error) {
        // Fallback: usa read_at legado — conta mensagens diretas não lidas
        const { data: fallback, error: fallbackError } = await supabase
          .from('messages')
          .select('id, read_at, recipient_id')
          .order('created_at', { ascending: false })
          .limit(MESSAGE_HISTORY_LIMIT);
        if (fallbackError) throw fallbackError;
        return (fallback ?? []).filter(
          (msg) => msg.recipient_id === profileId && !msg.read_at,
        ).length;
      }

      return (data ?? []).filter(
        (msg) => !(msg.message_reads ?? []).some((r: MessageRead) => r.profile_id === profileId),
      ).length;
    },
  });
}

export function useMessageReadStatus(messageId: string | null, message?: Message | null) {
  const readsQuery = useQuery({
    queryKey: ['message-reads', messageId],
    enabled: !!messageId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_reads')
        .select('profile_id, read_at, profile:profiles(id, name, avatar_url)')
        .eq('message_id', messageId!);
      if (error) throw error;
      return (data ?? []) as MessageRead[];
    },
  });

  const recipientsQuery = useQuery({
    queryKey: ['message-recipients', messageId, message?.church_id, message?.recipient_team_id, message?.recipient_id],
    enabled: !!messageId && !!message,
    queryFn: async () => {
      if (!message) return [] as { id: string; name: string; avatar_url: string | null }[];

      if (message.is_broadcast) {
        const { data: memberRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('church_id', message.church_id)
          .eq('role', 'member');
        if (rolesError) throw rolesError;

        const memberUserIds = [...new Set((memberRoles ?? []).map((r: { user_id: string }) => r.user_id))];
        if (memberUserIds.length === 0) return [];

        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select('id, user_id, name, avatar_url, status')
          .in('user_id', memberUserIds)
          .eq('status', 'active');
        if (membersError) throw membersError;

        return (members ?? []).map((m: { id: string; name: string; avatar_url: string | null }) => ({
          id: m.id,
          name: m.name,
          avatar_url: m.avatar_url,
        }));
      }

      if (message.recipient_team_id) {
        const { data, error } = await supabase
          .from('team_members')
          .select('profile:profiles(id, name, avatar_url)')
          .eq('team_id', message.recipient_team_id);
        if (error) throw error;
        return (data ?? [])
          .map((tm: { profile?: { id: string; name: string; avatar_url: string | null } | null }) => tm.profile)
          .filter((p): p is { id: string; name: string; avatar_url: string | null } => !!p);
      }

      if (message.recipient_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', message.recipient_id)
          .single();
        if (error) throw error;
        return data ? [data] : [];
      }

      return [];
    },
  });

  return { readsQuery, recipientsQuery };
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('mark_message_as_read', { p_message_id: id });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        const rpcMissing = msg.includes('function') && msg.includes('mark_message_as_read');
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
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueriesData<Message[]>(
        { queryKey: ['messages', 'inbox'], exact: false },
        (old) => old?.map((msg) => msg.id === id ? { ...msg, is_read_by_me: true } : msg) ?? old,
      );
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread_count'] });
      queryClient.invalidateQueries({ queryKey: ['message-reads', id] });
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
        if (!currentUserId) throw new Error('Usuario nao autenticado para enviar mensagem.');

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('church_id')
          .eq('user_id', currentUserId)
          .limit(1)
          .maybeSingle();

        if (roleError) throw roleError;
        if (!roleData?.church_id) throw new Error('Nao foi possivel identificar a igreja para envio da mensagem.');

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
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
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
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      toast({ title: 'Mensagem excluida!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir mensagem', description: error.message, variant: 'destructive' });
    },
  });
}
