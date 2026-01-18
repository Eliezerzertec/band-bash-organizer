import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTeams: number;
  totalSchedules: number;
  upcomingSchedules: number;
  pendingSubstitutions: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // Get profiles count
      const { count: totalMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get teams count
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      // Get schedules count
      const { count: totalSchedules } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true });

      const { count: upcomingSchedules } = await supabase
        .from('schedules')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', today);

      // Get pending substitutions count
      const { count: pendingSubstitutions } = await supabase
        .from('substitution_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        totalTeams: totalTeams || 0,
        totalSchedules: totalSchedules || 0,
        upcomingSchedules: upcomingSchedules || 0,
        pendingSubstitutions: pendingSubstitutions || 0,
      } as DashboardStats;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Get recent substitution requests
      const { data: substitutions } = await supabase
        .from('substitution_requests')
        .select(`
          id,
          status,
          created_at,
          requester:profiles!substitution_requests_requester_id_fkey(name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent schedules
      const { data: schedules } = await supabase
        .from('schedules')
        .select('id, title, event_date, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort by date
      const activities = [
        ...(substitutions || []).map(s => ({
          id: s.id,
          type: 'substitution' as const,
          title: `Solicitação de substituição`,
          description: `${s.requester?.name || 'Usuário'} solicitou substituição`,
          avatar: s.requester?.avatar_url,
          name: s.requester?.name || 'Usuário',
          status: s.status,
          timestamp: s.created_at,
        })),
        ...(schedules || []).map(s => ({
          id: s.id,
          type: 'schedule' as const,
          title: s.title,
          description: `Nova escala criada`,
          timestamp: s.created_at,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return activities;
    },
  });
}
