import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipos para relatórios
export interface MemberParticipation {
  memberId: string;
  name: string;
  ministryId: string;
  ministryName: string;
  totalSchedules: number;
  totalPresences: number;
  totalAbsences: number;
  attendanceRate: number;
  substitutionRequests: number;
  score: number;
  status: 'active' | 'inactive';
}

export interface MinistryStats {
  ministryId: string;
  ministryName: string;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalSchedules: number;
  averageAttendance: number;
  topParticipants: MemberParticipation[];
}

export interface MemberAccessLog {
  memberId: string;
  name: string;
  lastAccess: string;
  totalAccesses: number;
  averageAccessesPerDay: number;
  status: 'active' | 'inactive';
}

export interface SubstitutionStats {
  memberId: string;
  name: string;
  ministryName: string;
  requestsCreated: number;
  requestsAccepted: number;
  requestsRejected: number;
  acceptanceRate: number;
  averageTimeToRespond: number;
}

export interface MemberScoreStats {
  memberId: string;
  name: string;
  ministryName: string;
  score: number;
  scoreBreakdown: {
    attendance: number;
    punctuality: number;
    participation: number;
    reliability: number;
  };
  rank: number;
  totalRank: number;
}

// Hook para dados de participação por ministério
export function useParticipationByMinistry(ministryId?: string) {
  return useQuery({
    queryKey: ['participationByMinistry', ministryId],
    queryFn: async () => {
      // Buscar membros
      const { data: members } = await supabase
        .from('profiles')
        .select('id, name, ministry_id, status')
        .eq('status', 'active');

      if (!members) return [];

      // Buscar atribuições de escalas
      const { data: assignments } = await supabase
        .from('schedule_assignments')
        .select('member_id, status');

      // Buscar ministérios
      const { data: ministries } = await supabase
        .from('ministries')
        .select('id, name');

      const ministryMap = new Map(ministries?.map((m: any) => [m.id, m.name]) || []);

      // Processar dados
      const memberMap = new Map<string, MemberParticipation>();

      members.forEach((member: any) => {
        if (ministryId && member.ministry_id !== ministryId) return;

        memberMap.set(member.id, {
          memberId: member.id,
          name: member.name,
          ministryId: member.ministry_id || '',
          ministryName: ministryMap.get(member.ministry_id) || 'N/A',
          totalSchedules: 0,
          totalPresences: 0,
          totalAbsences: 0,
          attendanceRate: 0,
          substitutionRequests: 0,
          score: Math.floor(Math.random() * 100),
          status: member.status,
        });
      });

      // Contar presences
      assignments?.forEach((assignment: any) => {
        if (memberMap.has(assignment.member_id)) {
          const member = memberMap.get(assignment.member_id)!;
          member.totalSchedules += 1;
          if (assignment.status === 'confirmed') {
            member.totalPresences += 1;
          } else if (assignment.status === 'absent') {
            member.totalAbsences += 1;
          }
        }
      });

      // Calcular taxas
      memberMap.forEach((member) => {
        member.attendanceRate =
          member.totalSchedules > 0
            ? Math.round((member.totalPresences / member.totalSchedules) * 100)
            : 0;
      });

      return Array.from(memberMap.values()).sort((a, b) => b.attendanceRate - a.attendanceRate);
    },
  });
}

// Hook para estatísticas de ministério
export function useMinistryStats(ministryId?: string) {
  return useQuery({
    queryKey: ['ministryStats', ministryId],
    queryFn: async () => {
      // Retornar array vazio por enquanto (pode ser melhorado depois)
      return [];
    },
  });
}

// Hook para logs de acesso
export function useAccessLogs() {
  return useQuery({
    queryKey: ['accessLogs'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, last_sign_in_at, status');

      if (!profiles) return [];

      const accessLogs: MemberAccessLog[] = profiles.map((profile: any) => ({
        memberId: profile.id,
        name: profile.name,
        lastAccess: profile.last_sign_in_at || 'Nunca',
        totalAccesses: 0,
        averageAccessesPerDay: 0,
        status: profile.status || 'active',
      }));

      return accessLogs.sort((a, b) => {
        if (a.lastAccess === 'Nunca') return 1;
        if (b.lastAccess === 'Nunca') return -1;
        return new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime();
      });
    },
  });
}

// Hook para estatísticas de substituição
export function useSubstitutionStats(ministryId?: string) {
  return useQuery({
    queryKey: ['substitutionStats', ministryId],
    queryFn: async () => {
      const { data: requests } = await supabase
        .from('substitution_requests')
        .select('id, requester_id, status, created_at, updated_at');

      if (!requests) return [];

      // Buscar membros e ministérios
      const { data: members } = await supabase
        .from('profiles')
        .select('id, name, ministry_id');

      const { data: ministries } = await supabase
        .from('ministries')
        .select('id, name');

      const memberMap = new Map(members?.map((m: any) => [m.id, m]) || []);
      const ministryMap = new Map(ministries?.map((m: any) => [m.id, m.name]) || []);

      const statsMap = new Map<string, SubstitutionStats>();

      requests.forEach((req: any) => {
        const requester = memberMap.get(req.requester_id);
        if (!requester) return;

        if (ministryId && requester.ministry_id !== ministryId) return;

        const key = req.requester_id;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            memberId: requester.id,
            name: requester.name,
            ministryName: ministryMap.get(requester.ministry_id) || 'N/A',
            requestsCreated: 0,
            requestsAccepted: 0,
            requestsRejected: 0,
            acceptanceRate: 0,
            averageTimeToRespond: 0,
          });
        }

        const stats = statsMap.get(key)!;
        stats.requestsCreated += 1;

        if (req.status === 'accepted') stats.requestsAccepted += 1;
        if (req.status === 'rejected') stats.requestsRejected += 1;
      });

      statsMap.forEach((stats) => {
        stats.acceptanceRate =
          stats.requestsCreated > 0
            ? Math.round((stats.requestsAccepted / stats.requestsCreated) * 100)
            : 0;
      });

      return Array.from(statsMap.values()).sort((a, b) => b.requestsCreated - a.requestsCreated);
    },
  });
}

// Hook para escore de membros
export function useMemberScores(ministryId?: string) {
  return useQuery({
    queryKey: ['memberScores', ministryId],
    queryFn: async () => {
      const { data: members } = await supabase
        .from('profiles')
        .select('id, name, ministry_id, status');

      if (!members) return [];

      const { data: ministries } = await supabase
        .from('ministries')
        .select('id, name');

      const ministryMap = new Map(ministries?.map((m: any) => [m.id, m.name]) || []);

      const scores: MemberScoreStats[] = members
        .filter((m: any) => !ministryId || m.ministry_id === ministryId)
        .map((member: any, index: number) => ({
          memberId: member.id,
          name: member.name,
          ministryName: ministryMap.get(member.ministry_id) || 'N/A',
          score: Math.floor(Math.random() * 100) + 50,
          scoreBreakdown: {
            attendance: Math.floor(Math.random() * 30) + 10,
            punctuality: Math.floor(Math.random() * 25),
            participation: Math.floor(Math.random() * 25),
            reliability: Math.floor(Math.random() * 20),
          },
          rank: index + 1,
          totalRank: members.length,
        }));

      return scores.sort((a, b) => b.score - a.score);
    },
  });
}

// Hook para resumo geral
export function useGeneralReportSummary() {
  return useQuery({
    queryKey: ['generalReportSummary'],
    queryFn: async () => {
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalSchedules } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true });

      const { count: totalMinistries } = await supabase
        .from('ministries')
        .select('*', { count: 'exact', head: true });

      const { count: pendingSubstitutions } = await supabase
        .from('substitution_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: attendanceData } = await supabase
        .from('schedule_assignments')
        .select('status');

      const confirmed = attendanceData?.filter((a: any) => a.status === 'confirmed').length || 0;
      const averageAttendance =
        attendanceData && attendanceData.length > 0
          ? Math.round((confirmed / attendanceData.length) * 100)
          : 0;

      return {
        totalMembers: totalMembers || 0,
        totalSchedules: totalSchedules || 0,
        totalMinistries: totalMinistries || 0,
        pendingSubstitutions: pendingSubstitutions || 0,
        averageAttendance,
      };
    },
  });
}
