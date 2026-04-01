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
    team_id?: string | null;
    role_assigned: string | null;
    schedule?: {
      id: string;
      title: string;
      event_date: string;
      start_time: string;
    };
  };
}

export interface EligibleSubstitute {
  profile_id: string;
  role_in_team: string | null;
  profile: {
    id: string;
    name: string;
    avatar_url: string | null;
    musical_skills: string[] | null;
    status?: 'active' | 'inactive' | 'pending_approval';
  };
}

export interface MyAssignmentOption {
  id: string;
  team_id: string | null;
  role_assigned: string | null;
  schedule: {
    id: string;
    title: string;
    event_date: string;
    start_time: string;
  } | null;
}

export function useSubstitutionRequests(status?: 'pending' | 'accepted' | 'rejected') {
  return useQuery({
    queryKey: ['substitution_requests', status],
    queryFn: async () => {
      // Calcular data de 30 dias atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
      
      let query = supabase
        .from('substitution_requests')
        .select(`
          *,
          requester:profiles!substitution_requests_requester_id_fkey(id, name, avatar_url),
          substitute:profiles!substitution_requests_substitute_id_fkey(id, name, avatar_url),
          schedule_assignment:schedule_assignments(
            id,
            team_id,
            role_assigned,
            schedule:schedules(id, title, event_date, start_time)
          )
        `)
        .gte('created_at', thirtyDaysAgoISO)
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
      if (request.substitute_id && request.substitute_id === request.requester_id) {
        throw new Error('O membro escalado nao pode ser substituto de si mesmo.');
      }

      if (request.substitute_id) {
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('schedule_assignments')
          .select('schedule_id, schedule:schedules!inner(event_date)')
          .eq('id', request.schedule_assignment_id)
          .maybeSingle();

        if (assignmentError) throw assignmentError;

        const scheduleId = assignmentData?.schedule_id;
        const eventDate = assignmentData?.schedule?.event_date;

        if (eventDate) {
          const { data: sameDateAssignment, error: sameDateError } = await supabase
            .from('schedule_assignments')
            .select('id, schedule:schedules!inner(event_date)')
            .eq('profile_id', request.substitute_id)
            .eq('schedule.event_date', eventDate)
            .neq('id', request.schedule_assignment_id)
            .maybeSingle();

          if (sameDateError) throw sameDateError;
          if (sameDateAssignment) {
            throw new Error('Este membro ja esta escalado na mesma data e nao pode ser substituto.');
          }
        }

        if (scheduleId) {
          const { data: alreadyAssigned, error: alreadyAssignedError } = await supabase
            .from('schedule_assignments')
            .select('id')
            .eq('schedule_id', scheduleId)
            .eq('profile_id', request.substitute_id)
            .neq('id', request.schedule_assignment_id)
            .maybeSingle();

          if (alreadyAssignedError) throw alreadyAssignedError;
          if (alreadyAssigned) {
            throw new Error('Este membro ja esta escalado na mesma agenda e nao pode ser substituto.');
          }
        }
      }

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

export function useMyAssignmentOptions(profileId?: string) {
  return useQuery({
    queryKey: ['substitution_assignment_options', profileId],
    enabled: !!profileId,
    queryFn: async () => {
      if (!profileId) return [] as MyAssignmentOption[];

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('schedule_assignments')
        .select(`
          id,
          team_id,
          role_assigned,
          schedule:schedules(id, title, event_date, start_time)
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = ((data || []) as MyAssignmentOption[]).filter((item) => {
        const eventDate = item.schedule?.event_date;
        return !!eventDate && eventDate >= today;
      });

      return rows;
    },
  });
}

export function useEligibleSubstitutes(assignmentId?: string) {
  return useQuery({
    queryKey: ['eligible_substitutes', assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      if (!assignmentId) return [] as EligibleSubstitute[];

      const { data: assignment, error: assignmentError } = await supabase
        .from('schedule_assignments')
        .select('id, team_id, schedule_id, role_assigned, profile_id')
        .eq('id', assignmentId)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      if (!assignment?.team_id) return [] as EligibleSubstitute[];

      let assignedProfileIds = new Set<string>();
      let sameDateProfileIds = new Set<string>();

      if (assignment.schedule_id) {
        const { data: sameScheduleAssignments, error: sameScheduleError } = await supabase
          .from('schedule_assignments')
          .select('profile_id')
          .eq('schedule_id', assignment.schedule_id)
          .neq('id', assignment.id);

        if (sameScheduleError) throw sameScheduleError;

        assignedProfileIds = new Set(
          (sameScheduleAssignments || [])
            .map((row) => row.profile_id)
            .filter((profileId): profileId is string => !!profileId)
        );
      }

      let targetDate: string | null = null;
      if (assignment.schedule_id) {
        const { data: scheduleRow, error: scheduleError } = await supabase
          .from('schedules')
          .select('event_date')
          .eq('id', assignment.schedule_id)
          .maybeSingle();

        if (scheduleError) throw scheduleError;
        targetDate = scheduleRow?.event_date ?? null;
      }

      if (targetDate) {
        const { data: schedulesOnSameDate, error: schedulesOnSameDateError } = await supabase
          .from('schedules')
          .select('id')
          .eq('event_date', targetDate);

        if (schedulesOnSameDateError) throw schedulesOnSameDateError;

        const scheduleIdsOnSameDate = (schedulesOnSameDate || []).map((row) => row.id);

        if (scheduleIdsOnSameDate.length > 0) {
          const { data: sameDateAssignments, error: sameDateError } = await supabase
            .from('schedule_assignments')
            .select('profile_id')
            .in('schedule_id', scheduleIdsOnSameDate)
            .neq('id', assignment.id);

          if (sameDateError) throw sameDateError;

          sameDateProfileIds = new Set(
            (sameDateAssignments || [])
              .map((row) => row.profile_id)
              .filter((profileId): profileId is string => !!profileId)
          );
        }
      }

      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('profile_id, role_in_team, profile:profiles(id, name, avatar_url, musical_skills, status)')
        .eq('team_id', assignment.team_id)
        .neq('profile_id', assignment.profile_id);

      if (membersError) throw membersError;

      const memberList = ((members || []) as EligibleSubstitute[]).filter(
        (member) =>
          member.profile?.status === 'active' &&
          !assignedProfileIds.has(member.profile_id) &&
          !sameDateProfileIds.has(member.profile_id)
      );
      const normalize = (value: string) =>
        value
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();

      let requestedRole = assignment.role_assigned ? normalize(assignment.role_assigned) : '';

      if (!requestedRole) {
        const { data: assigneeTeamMember, error: assigneeTeamMemberError } = await supabase
          .from('team_members')
          .select('role_in_team')
          .eq('team_id', assignment.team_id)
          .eq('profile_id', assignment.profile_id)
          .maybeSingle();

        if (assigneeTeamMemberError) throw assigneeTeamMemberError;
        requestedRole = assigneeTeamMember?.role_in_team ? normalize(assigneeTeamMember.role_in_team) : '';
      }

      if (!requestedRole) {
        return memberList.sort((a, b) =>
          (a.profile.name || '').localeCompare(b.profile.name || '', 'pt-BR', {
            sensitivity: 'base',
          })
        );
      }

      const sameCategory = memberList.filter((member) => {
        const teamRole = member.role_in_team ? normalize(member.role_in_team) : null;
        const skills = (member.profile.musical_skills || []).map((s) => normalize(s));
        const roleMatch =
          teamRole === requestedRole ||
          (teamRole ? teamRole.includes(requestedRole) || requestedRole.includes(teamRole) : false);
        const skillMatch =
          skills.includes(requestedRole) ||
          skills.some((skill) => skill.includes(requestedRole) || requestedRole.includes(skill));

        return roleMatch || skillMatch;
      });

      return sameCategory.sort((a, b) =>
        (a.profile.name || '').localeCompare(b.profile.name || '', 'pt-BR', {
          sensitivity: 'base',
        })
      );
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
      if (status === 'accepted') {
        const { data: requestData, error: requestError } = await supabase
          .from('substitution_requests')
          .select(`
            schedule_assignment_id,
            substitute_id,
            schedule_assignment:schedule_assignments!inner(id, schedule_id, schedule:schedules!inner(event_date))
          `)
          .eq('id', id)
          .single();

        if (requestError) throw requestError;
        if (!requestData.substitute_id) {
          throw new Error('Esta solicitacao nao possui substituto definido.');
        }

        const scheduleId = requestData.schedule_assignment?.schedule_id;
        const eventDate = requestData.schedule_assignment?.schedule?.event_date;
        if (!scheduleId) {
          throw new Error('Nao foi possivel identificar a escala da solicitacao.');
        }

        if (eventDate) {
          const { data: sameDateConflict, error: sameDateError } = await supabase
            .from('schedule_assignments')
            .select('id, schedule:schedules!inner(event_date)')
            .eq('profile_id', requestData.substitute_id)
            .eq('schedule.event_date', eventDate)
            .neq('id', requestData.schedule_assignment_id)
            .maybeSingle();

          if (sameDateError) throw sameDateError;
          if (sameDateConflict) {
            throw new Error('Este membro ja possui escala na mesma data. Escolha outro substituto.');
          }
        }

        const { data: existingAssignment, error: existingError } = await supabase
          .from('schedule_assignments')
          .select('id')
          .eq('schedule_id', scheduleId)
          .eq('profile_id', requestData.substitute_id)
          .neq('id', requestData.schedule_assignment_id)
          .maybeSingle();

        if (existingError) throw existingError;
        if (existingAssignment) {
          throw new Error('Este membro ja esta escalado neste evento. Escolha outro substituto.');
        }

        const { error: assignmentError } = await supabase
          .from('schedule_assignments')
          .update({ profile_id: requestData.substitute_id })
          .eq('id', requestData.schedule_assignment_id);

        if (assignmentError) throw assignmentError;
      }

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
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
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
      const { data, error } = await supabase
        .from('substitution_requests')
        .delete()
        .eq('id', id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (data) return;

      const { data: updated, error: updateError } = await supabase
        .from('substitution_requests')
        .update({
          status: 'rejected',
          response_message: 'Solicitação cancelada pelo solicitante.',
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();

      if (updateError) {
        throw error || updateError;
      }

      if (!updated) {
        throw new Error('Apenas pedidos pendentes podem ser cancelados.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substitution_requests'] });
      toast({ title: 'Solicitação cancelada!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao cancelar solicitação', description: error.message, variant: 'destructive' });
    },
  });
}
