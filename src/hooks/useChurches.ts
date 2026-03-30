import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Church {
  id: string;
  name: string;
  address: string | null;
  contact: string | null;
  logo_url: string | null;
  pastor_name: string | null;
  created_at: string;
  updated_at: string;
}

export function useChurches() {
  return useQuery({
    queryKey: ['churches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Church[];
    },
  });
}

export function useChurch(id: string) {
  return useQuery({
    queryKey: ['churches', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Church | null;
    },
    enabled: !!id,
  });
}

export function useCreateChurch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (church: Omit<Church, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('churches')
        .insert(church)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      toast({ title: 'Igreja criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar igreja', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateChurch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...church }: Partial<Church> & { id: string }) => {
      const { data, error } = await supabase
        .from('churches')
        .update(church)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      toast({ title: 'Igreja atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar igreja', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteChurch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('churches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churches'] });
      toast({ title: 'Igreja excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir igreja', description: error.message, variant: 'destructive' });
    },
  });
}
