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

interface ProfileLite {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface AssignmentLite {
  profile_id: string;
}

interface SubstitutionLite {
  requester_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MinistryLite {
  id: string;
  name: string;
}

interface TeamMembershipLite {
  profile_id: string;
  team: {
    ministry_id: string;
    ministry: {
      id: string;
      name: string;
    } | null;
  } | null;
}

interface MemberWithMinistry {
  memberId: string;
  name: string;
  status: 'active' | 'inactive';
  ministryId: string;
  ministryName: string;
  createdAt: string;
}

async function fetchMemberMinistryData() {
  const [{ data: members, error: membersError }, { data: ministries }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('id, name, status, created_at').eq('status', 'active'),
    supabase.from('ministries').select('id, name'),
    supabase.from('team_members').select('profile_id, team:teams(ministry_id, ministry:ministries(id, name))'),
  ]);

  if (membersError) throw membersError;

  const ministryMap = new Map((ministries as MinistryLite[] | null)?.map((m) => [m.id, m.name]) || []);
  const membershipRows = (memberships as TeamMembershipLite[] | null) || [];
  const memberMinistryMap = new Map<string, { ministryId: string; ministryName: string }>();

  membershipRows.forEach((row) => {
    if (!row.team?.ministry_id || memberMinistryMap.has(row.profile_id)) return;
    memberMinistryMap.set(row.profile_id, {
      ministryId: row.team.ministry_id,
      ministryName: row.team.ministry?.name || ministryMap.get(row.team.ministry_id) || 'N/A',
    });
  });

  const membersWithMinistry: MemberWithMinistry[] = ((members as ProfileLite[] | null) || []).map((member) => {
    const ministry = memberMinistryMap.get(member.id);
    return {
      memberId: member.id,
      name: member.name,
      status: member.status,
      ministryId: ministry?.ministryId || '',
      ministryName: ministry?.ministryName || 'N/A',
      createdAt: member.created_at,
    };
  });

  return { membersWithMinistry };
}

// Hook para dados de participação por ministério
export function useParticipationByMinistry(ministryId?: string) {
  return useQuery({
    queryKey: ['participationByMinistry', ministryId],
    queryFn: async () => {
      const [{ membersWithMinistry }, { data: assignments }, { data: substitutionRequests }] = await Promise.all([
        fetchMemberMinistryData(),
        supabase.from('schedule_assignments').select('profile_id'),
        supabase.from('substitution_requests').select('requester_id'),
      ]);

      const assignmentRows = (assignments as AssignmentLite[] | null) || [];
      const substitutions = (substitutionRequests as Pick<SubstitutionLite, 'requester_id'>[] | null) || [];

      const scheduleCountByMember = new Map<string, number>();
      assignmentRows.forEach((assignment) => {
        scheduleCountByMember.set(assignment.profile_id, (scheduleCountByMember.get(assignment.profile_id) || 0) + 1);
      });

      const substitutionCountByMember = new Map<string, number>();
      substitutions.forEach((item) => {
        substitutionCountByMember.set(item.requester_id, (substitutionCountByMember.get(item.requester_id) || 0) + 1);
      });

      const members = membersWithMinistry
        .filter((member) => !ministryId || member.ministryId === ministryId)
        .map((member) => {
          const totalSchedules = scheduleCountByMember.get(member.memberId) || 0;
          const substitutionRequests = substitutionCountByMember.get(member.memberId) || 0;
          const totalPresences = totalSchedules;
          const attendanceRate = totalSchedules > 0 ? 100 : 0;

          return {
            memberId: member.memberId,
            name: member.name,
            ministryId: member.ministryId,
            ministryName: member.ministryName,
            totalSchedules,
            totalPresences,
            totalAbsences: 0,
            attendanceRate,
            substitutionRequests,
            score: Math.max(0, Math.min(100, 100 - substitutionRequests * 5)),
            status: member.status,
          } satisfies MemberParticipation;
        });

      return members.sort((a, b) => b.attendanceRate - a.attendanceRate || b.totalSchedules - a.totalSchedules);
    },
  });
}

// Hook para estatísticas de ministério
export function useMinistryStats(ministryId?: string) {
  return useQuery({
    queryKey: ['ministryStats', ministryId],
    queryFn: async () => {
      const participation = await fetchMemberMinistryData();
      const members = participation.membersWithMinistry.filter((member) => !ministryId || member.ministryId === ministryId);

      if (!members.length) return [] as MinistryStats[];

      const grouped = new Map<string, MinistryStats>();
      members.forEach((member) => {
        const key = member.ministryId || 'sem-ministerio';
        if (!grouped.has(key)) {
          grouped.set(key, {
            ministryId: member.ministryId,
            ministryName: member.ministryName,
            totalMembers: 0,
            activeMembers: 0,
            inactiveMembers: 0,
            totalSchedules: 0,
            averageAttendance: 0,
            topParticipants: [],
          });
        }

        const stat = grouped.get(key)!;
        stat.totalMembers += 1;
        if (member.status === 'active') stat.activeMembers += 1;
        if (member.status === 'inactive') stat.inactiveMembers += 1;
      });

      return Array.from(grouped.values());
    },
  });
}

// Hook para logs de acesso
export function useAccessLogs() {
  return useQuery({
    queryKey: ['accessLogs'],
    queryFn: async () => {
      const { membersWithMinistry } = await fetchMemberMinistryData();

      const accessLogs: MemberAccessLog[] = membersWithMinistry.map((member) => ({
        memberId: member.memberId,
        name: member.name,
        lastAccess: member.createdAt,
        totalAccesses: 1,
        averageAccessesPerDay: 1,
        status: member.status,
      }));

      return accessLogs.sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime());
    },
  });
}

// Hook para estatísticas de substituição
export function useSubstitutionStats(ministryId?: string) {
  return useQuery({
    queryKey: ['substitutionStats', ministryId],
    queryFn: async () => {
      const [{ membersWithMinistry }, { data: requests }] = await Promise.all([
        fetchMemberMinistryData(),
        supabase.from('substitution_requests').select('requester_id, status'),
      ]);

      const requestRows = (requests as SubstitutionLite[] | null) || [];
      const memberMap = new Map(membersWithMinistry.map((m) => [m.memberId, m]));
      const statsMap = new Map<string, SubstitutionStats>();

      requestRows.forEach((req) => {
        const requester = memberMap.get(req.requester_id);
        if (!requester) return;
        if (ministryId && requester.ministryId !== ministryId) return;

        if (!statsMap.has(req.requester_id)) {
          statsMap.set(req.requester_id, {
            memberId: requester.memberId,
            name: requester.name,
            ministryName: requester.ministryName,
            requestsCreated: 0,
            requestsAccepted: 0,
            requestsRejected: 0,
            acceptanceRate: 0,
            averageTimeToRespond: 0,
          });
        }

        const stats = statsMap.get(req.requester_id)!;
        stats.requestsCreated += 1;
        if (req.status === 'accepted') stats.requestsAccepted += 1;
        if (req.status === 'rejected') stats.requestsRejected += 1;
      });

      statsMap.forEach((stats) => {
        stats.acceptanceRate =
          stats.requestsCreated > 0 ? Math.round((stats.requestsAccepted / stats.requestsCreated) * 100) : 0;
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
      const [{ membersWithMinistry }, { data: assignments }, { data: requests }] = await Promise.all([
        fetchMemberMinistryData(),
        supabase.from('schedule_assignments').select('profile_id'),
        supabase.from('substitution_requests').select('requester_id'),
      ]);

      const assignmentRows = (assignments as AssignmentLite[] | null) || [];
      const requestRows = (requests as Pick<SubstitutionLite, 'requester_id'>[] | null) || [];

      const assignmentCount = new Map<string, number>();
      assignmentRows.forEach((row) => {
        assignmentCount.set(row.profile_id, (assignmentCount.get(row.profile_id) || 0) + 1);
      });

      const substitutionCount = new Map<string, number>();
      requestRows.forEach((row) => {
        substitutionCount.set(row.requester_id, (substitutionCount.get(row.requester_id) || 0) + 1);
      });

      const scores: MemberScoreStats[] = membersWithMinistry
        .filter((member) => !ministryId || member.ministryId === ministryId)
        .map((member) => {
          const schedulesTotal = assignmentCount.get(member.memberId) || 0;
          const subsTotal = substitutionCount.get(member.memberId) || 0;
          const attendance = Math.min(40, schedulesTotal * 4);
          const punctuality = Math.max(0, 25 - subsTotal * 2);
          const participation = Math.min(20, schedulesTotal * 2);
          const reliability = Math.max(0, 15 - subsTotal);
          const score = attendance + punctuality + participation + reliability;

          return {
            memberId: member.memberId,
            name: member.name,
            ministryName: member.ministryName,
            score,
            scoreBreakdown: {
              attendance,
              punctuality,
              participation,
              reliability,
            },
            rank: 0,
            totalRank: 0,
          };
        })
        .sort((a, b) => b.score - a.score)
        .map((member, index, all) => ({
          ...member,
          rank: index + 1,
          totalRank: all.length,
        }));

      return scores;
    },
  });
}

// Hook para resumo geral
export function useGeneralReportSummary() {
  return useQuery({
    queryKey: ['generalReportSummary'],
    queryFn: async () => {
      const [
        { count: totalMembers },
        { count: totalSchedules },
        { count: totalMinistries },
        { count: pendingSubstitutions },
        { data: assignments },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('schedules').select('*', { count: 'exact', head: true }),
        supabase.from('ministries').select('*', { count: 'exact', head: true }),
        supabase.from('substitution_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('schedule_assignments').select('profile_id'),
      ]);

      const averageAttendance = ((assignments as AssignmentLite[] | null)?.length || 0) > 0 ? 100 : 0;

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
