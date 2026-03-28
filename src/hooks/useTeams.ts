import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string;
  role_in_team: string | null;
  created_at: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
    musical_skills: string[];
  };
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  ministry_id: string;
  leader_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  ministry?: { name: string; church_id: string };
  leader?: { name: string };
  team_members?: TeamMember[];
}

export function useTeams(ministryId?: string) {
  return useQuery({
    queryKey: ['teams', ministryId],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          *,
          ministry:ministries(name, church_id),
          leader:profiles!teams_leader_id_fkey(name),
          team_members(
            id,
            profile_id,
            role_in_team,
            profile:profiles(id, name, avatar_url, musical_skills)
          )
        `)
        .order('name');
      
      if (ministryId) {
        query = query.eq('ministry_id', ministryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Team[];
    },
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          ministry:ministries(name, church_id),
          leader:profiles!teams_leader_id_fkey(name),
          team_members(
            id,
            profile_id,
            role_in_team,
            profile:profiles(id, name, avatar_url, musical_skills)
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Team | null;
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (team: Omit<Team, 'id' | 'created_at' | 'updated_at' | 'ministry' | 'leader' | 'team_members'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar equipe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...team }: Partial<Team> & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(team)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar equipe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Equipe excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir equipe', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: { team_id: string; profile_id: string; role_in_team?: string }) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert(member)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Membro adicionado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao adicionar membro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Membro removido com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover membro', description: error.message, variant: 'destructive' });
    },
  });
}
