import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubstitutionRequest {
  id: string;
  schedule_assignment_id: string;
  requester_id: string;
  substitute_id: string | null;
  reason: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  response_message: string | null;
  created_at: string;
  updated_at: string;
  requester?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  substitute?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  schedule_assignment?: {
    id: string;
    role_assigned: string | null;
    schedule?: {
      id: string;
      title: string;
      event_date: string;
      start_time: string;
    };
  };
}

export function useSubstitutionRequests(status?: 'pending' | 'accepted' | 'rejected') {
  return useQuery({
    queryKey: ['substitution_requests', status],
    queryFn: async () => {
      let query = supabase
        .from('substitution_requests')
        .select(`
          *,
          requester:profiles!substitution_requests_requester_id_fkey(id, name, avatar_url),
          substitute:profiles!substitution_requests_substitute_id_fkey(id, name, avatar_url),
          schedule_assignment:schedule_assignments(
            id,
            role_assigned,
            schedule:schedules(id, title, event_date, start_time)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SubstitutionRequest[];
    },
  });
}

export function usePendingSubstitutionsCount() {
  return useQuery({
    queryKey: ['substitution_requests', 'pending_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('substitution_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useCreateSubstitutionRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: { 
      schedule_assignment_id: string; 
      requester_id: string; 
      substitute_id?: string; 
      reason?: string 
    }) => {
      const { data, error } = await supabase
        .from('substitution_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substitution_requests'] });
      toast({ title: 'Solicitação de substituição enviada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao solicitar substituição', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRespondToSubstitution() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, response_message }: { 
      id: string; 
      status: 'accepted' | 'rejected'; 
      response_message?: string 
    }) => {
      const { data, error } = await supabase
        .from('substitution_requests')
        .update({ status, response_message })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['substitution_requests'] });
      toast({ 
        title: variables.status === 'accepted' 
          ? 'Substituição aceita!' 
          : 'Substituição recusada' 
      });
    },
    onError: (error) => {
      toast({ title: 'Erro ao responder substituição', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSubstitutionRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('substitution_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substitution_requests'] });
      toast({ title: 'Solicitação excluída!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir solicitação', description: error.message, variant: 'destructive' });
    },
  });
}
