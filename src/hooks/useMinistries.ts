import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Ministry {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  church_id: string;
  leader_id: string | null;
  created_at: string;
  updated_at: string;
  church?: { name: string; address?: string | null; contact?: string | null };
  leader?: { name: string };
}

type SignupMinistryRow = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  church_id: string;
  church_name: string | null;
  church_address: string | null;
  church_contact: string | null;
};

export function useMinistries(churchId?: string) {
  return useQuery({
    queryKey: ['ministries', churchId],
    queryFn: async () => {
      let query = supabase
        .from('ministries')
        .select(`
          *,
          church:church_id(name, address, contact),
          leader:leader_id(name)
        `)
        .order('name');
      
      if (churchId) {
        query = query.eq('church_id', churchId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Ministry[];
    },
  });
}

export function useSignupMinistries() {
  return useQuery({
    queryKey: ['signup-ministries'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_signup_ministries');

      if (error) throw error;

      return ((data || []) as SignupMinistryRow[]).map((ministry) => ({
        id: ministry.id,
        name: ministry.name,
        description: ministry.description,
        logo_url: ministry.logo_url,
        church_id: ministry.church_id,
        leader_id: null,
        created_at: '',
        updated_at: '',
        church: {
          name: ministry.church_name || '',
          address: ministry.church_address,
          contact: ministry.church_contact,
        },
      })) as Ministry[];
    },
  });
}

export function useMinistry(id: string) {
  return useQuery({
    queryKey: ['ministries', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          *,
          church:church_id(name, address, contact),
          leader:leader_id(name)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Ministry | null;
    },
    enabled: !!id,
  });
}

export function useCreateMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ministry: Omit<Ministry, 'id' | 'created_at' | 'updated_at' | 'church' | 'leader'>) => {
      const { data, error } = await supabase
        .from('ministries')
        .insert(ministry)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({ title: 'Ministério criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar ministério', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...ministry }: Partial<Ministry> & { id: string }) => {
      const { data, error } = await supabase
        .from('ministries')
        .update(ministry)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({ title: 'Ministério atualizado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar ministério', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMinistry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      toast({ title: 'Ministério excluído com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir ministério', description: error.message, variant: 'destructive' });
    },
  });
}
