import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleAssignment {
  id: string;
  schedule_id: string;
  profile_id: string;
  team_id: string | null;
  role_assigned: string | null;
  notes: string | null;
  created_at: string;
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  team?: {
    id: string;
    name: string;
  };
}

export interface Schedule {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  church_id: string;
  ministry_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  church?: { name: string };
  ministry?: { name: string };
  schedule_assignments?: ScheduleAssignment[];
}

export function useSchedules(churchId?: string, fromDate?: string) {
  return useQuery({
    queryKey: ['schedules', churchId, fromDate],
    queryFn: async () => {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          church:churches(name),
          ministry:ministries(name),
          schedule_assignments(
            id,
            profile_id,
            team_id,
            role_assigned,
            notes,
            profile:profiles(id, name, avatar_url),
            team:teams(id, name)
          )
        `)
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (churchId) {
        query = query.eq('church_id', churchId);
      }
      
      if (fromDate) {
        query = query.gte('event_date', fromDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Schedule[];
    },
  });
}

export function useUpcomingSchedules(limit = 5) {
  const today = new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ['schedules', 'upcoming', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          church:churches(name),
          ministry:ministries(name),
          schedule_assignments(
            id,
            profile_id,
            role_assigned,
            profile:profiles(id, name, avatar_url)
          )
        `)
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data as Schedule[];
    },
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          church:churches(name),
          ministry:ministries(name),
          schedule_assignments(
            id,
            profile_id,
            team_id,
            role_assigned,
            notes,
            profile:profiles(id, name, avatar_url),
            team:teams(id, name)
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Schedule | null;
    },
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at' | 'church' | 'ministry' | 'schedule_assignments'>) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert(schedule)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: 'Escala criada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar escala', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...schedule }: Partial<Schedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update(schedule)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: 'Escala atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar escala', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: 'Escala excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir escala', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddScheduleAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: { schedule_id: string; profile_id: string; team_id?: string; role_assigned?: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('schedule_assignments')
        .insert(assignment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: 'Membro escalado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao escalar membro', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveScheduleAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: 'Membro removido da escala!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover membro', description: error.message, variant: 'destructive' });
    },
  });
}
