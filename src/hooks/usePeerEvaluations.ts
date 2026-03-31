import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCurrentProfile } from '@/hooks/useProfiles';

// Usamos 'any' para tabelas novas que ainda não constam no schema gerado pelo Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as any;

export interface PeerEvaluation {
  id: string;
  evaluator_id: string;
  evaluated_id: string;
  church_id: string | null;
  musicality: number;
  punctuality: number;
  music_preparation: number;
  group_behavior: number;
  temperament: number;
  group_contribution: number;
  created_at: string;
  updated_at: string;
}

export interface PeerEvaluationScore {
  profile_id: string;
  total_evaluators: number;
  avg_musicality: number;
  avg_punctuality: number;
  avg_music_preparation: number;
  avg_group_behavior: number;
  avg_temperament: number;
  avg_group_contribution: number;
  overall_score: number;
  // enriquecido no frontend
  name?: string;
  email?: string;
  musical_skills?: string[];
  avatar_url?: string | null;
}

type ScoreProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  musical_skills: string[] | null;
};

async function enrichScoresWithMemberData(scores: PeerEvaluationScore[]): Promise<PeerEvaluationScore[]> {
  if (!scores.length) return scores;

  const ids = [...new Set(scores.map((s) => s.profile_id).filter(Boolean))];
  if (!ids.length) return scores;

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, musical_skills')
    .in('id', ids);

  if (error) throw error;

  const byId = new Map((profiles as ScoreProfileRow[] | null ?? []).map((p) => [p.id, p]));

  return scores.map((score) => {
    const profile = byId.get(score.profile_id);
    return {
      ...score,
      name: profile?.name ?? score.name,
      email: profile?.email ?? score.email,
      avatar_url: profile?.avatar_url ?? score.avatar_url ?? null,
      musical_skills: profile?.musical_skills ?? score.musical_skills,
    };
  });
}

export const EVAL_CRITERIA = [
  { key: 'musicality',         label: 'Musicalidade' },
  { key: 'punctuality',        label: 'Comprometimento com horário' },
  { key: 'music_preparation',  label: 'Comprometimento em tirar as músicas' },
  { key: 'group_behavior',     label: 'Comportamento no grupo' },
  { key: 'temperament',        label: 'Temperamento' },
  { key: 'group_contribution', label: 'Contribuição para o crescimento e harmonia do grupo' },
] as const;

export type EvalCriterionKey = typeof EVAL_CRITERIA[number]['key'];

// Escore geral de um membro (via view peer_evaluation_scores)
export function usePeerEvaluationScore(profileId: string) {
  return useQuery({
    queryKey: ['peer-eval-score', profileId],
    queryFn: async () => {
      const { data, error } = await db
        .from('peer_evaluation_scores')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const [enriched] = await enrichScoresWithMemberData([data as PeerEvaluationScore]);
      return enriched ?? null;
    },
    enabled: !!profileId,
  });
}

// Todos os escores para visão geral / admin
export function useAllPeerEvaluationScores() {
  return useQuery({
    queryKey: ['peer-eval-scores-all'],
    queryFn: async () => {
      const { data, error } = await db
        .from('peer_evaluation_scores')
        .select('*')
        .order('overall_score', { ascending: false });
      if (error) throw error;
      const scores = (data ?? []) as PeerEvaluationScore[];
      const enriched = await enrichScoresWithMemberData(scores);
      return enriched.sort((a, b) => Number(b.overall_score) - Number(a.overall_score));
    },
  });
}

// Avaliação que o usuário logado já fez para um colega específico
export function useMyEvaluationOf(evaluatedId: string) {
  const { user } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  return useQuery({
    queryKey: ['peer-eval-mine', evaluatedId, currentProfile?.id],
    queryFn: async () => {
      if (!user || !currentProfile?.id) return null;
      const { data, error } = await db
        .from('peer_evaluations')
        .select('*')
        .eq('evaluator_id', currentProfile.id)
        .eq('evaluated_id', evaluatedId)
        .maybeSingle();
      if (error) throw error;
      return data as PeerEvaluation | null;
    },
    enabled: !!user && !!currentProfile?.id && !!evaluatedId,
  });
}

// Membros ativos para avaliar (exclui o próprio usuário logado)
export function useMembersToEvaluate() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['members-to-evaluate'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, musical_skills, phone')
        .neq('user_id', user.id)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

// Criar ou atualizar avaliação (upsert por avaliador + avaliado)
export function useUpsertPeerEvaluation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      evaluated_id: string;
      musicality: number;
      punctuality: number;
      music_preparation: number;
      group_behavior: number;
      temperament: number;
      group_contribution: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentProfile?.id) throw new Error('Perfil do usuário não encontrado');
      if (payload.evaluated_id === currentProfile.id) throw new Error('Você não pode avaliar a si mesmo');

      const record = {
        evaluator_id: currentProfile.id,
        ...payload,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await db
        .from('peer_evaluations')
        .upsert(record, { onConflict: 'evaluator_id,evaluated_id' })
        .select()
        .single();

      if (error) throw error;
      return data as PeerEvaluation;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['peer-eval-score', variables.evaluated_id] });
      queryClient.invalidateQueries({ queryKey: ['peer-eval-scores-all'] });
      queryClient.invalidateQueries({ queryKey: ['peer-eval-mine', variables.evaluated_id] });
      toast({ title: 'Avaliação salva', description: 'Sua avaliação foi registrada com sucesso.' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar avaliação',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });
}
