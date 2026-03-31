import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/integrations/supabase/types';

export interface Schedule {
  id: string;
  event_name?: string;
  title?: string;
  description?: string;
  event_date: string;
  event_type?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_at: string;
  church_id?: string;
  ministry_id?: string;
  schedule_type?: string;
  church?: {
    id: string;
    name: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
  schedule_assignments?: {
    id: string;
    profile_id: string;
    schedule_id: string;
    role_assigned?: string;
    role?: string;
    team_id?: string;
    team?: {
      id: string;
      name: string;
    };
    profile?: {
      id: string;
      name: string;
    };
  }[];
}

export interface SchedulePayload {
  title?: string;
  event_name?: string;
  description?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  church_id: string;
  ministry_id?: string | null;
}

export interface ScheduleUpdatePayload extends Partial<SchedulePayload> {
  id: string;
}

type ScheduleInsert = Database['public']['Tables']['schedules']['Insert'];
type ScheduleUpdate = Database['public']['Tables']['schedules']['Update'];

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          church:churches(id, name),
          ministry:ministries(id, name),
          schedule_assignments(
            id,
            profile_id,
            schedule_id,
            role_assigned,
            team_id,
            team:teams(id, name),
            profile:profiles(id, name)
          )
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as Schedule[];
    },
  });
};

export const useRemoveScheduleAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('schedule_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSchedule: SchedulePayload) => {
      const insertData: ScheduleInsert = {
        title: newSchedule.title || newSchedule.event_name,
        description: newSchedule.description,
        event_date: newSchedule.event_date,
        start_time: newSchedule.start_time || '00:00',
        end_time: newSchedule.end_time,
        location: newSchedule.location,
        church_id: newSchedule.church_id,
        ministry_id: newSchedule.ministry_id,
      };

      const { data, error } = await supabase
        .from('schedules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ScheduleUpdatePayload) => {
      const updateData: ScheduleUpdate = {
        title: updates.title || updates.event_name,
        description: updates.description,
        event_date: updates.event_date,
        start_time: updates.start_time,
        end_time: updates.end_time,
        location: updates.location,
        church_id: updates.church_id,
        ministry_id: updates.ministry_id,
      };

      const { data, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useAddScheduleAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: {
      schedule_id: string;
      profile_id: string;
      team_id?: string;
      role_assigned?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('schedule_assignments')
        .insert([assignment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};

