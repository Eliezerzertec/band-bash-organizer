import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCurrentProfile } from '@/hooks/useProfiles';

// Usamos 'any' para tabelas novas que ainda não constam no schema gerado pelo Supabase
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as any;

export const EVAL_CRITERIA = [
  { key: 'relationship_with_god', label: 'Relacionamento com Deus' },
  { key: 'character_integrity', label: 'Caráter e integridade' },
  { key: 'leadership_submission', label: 'Submissão à liderança' },
  { key: 'musical_skill', label: 'Habilidade Musical' },
  { key: 'pitch_technical_precision_metronome', label: 'Afinação / precisão técnica / metrônomo' },
  { key: 'instrument_voice_knowledge', label: 'Conhecimento do instrumento/voz' },
  { key: 'musical_development', label: 'Musicalidade (desenvolvimento musical na banda)' },
  { key: 'punctuality_frequency', label: 'Pontualidade e frequência' },
  { key: 'preparation_before_rehearsal', label: 'Preparação prévia (estuda antes do ensaio)' },
  { key: 'availability_for_schedule', label: 'Disponibilidade na escala' },
  { key: 'teamwork', label: 'Trabalho em Equipe' },
  { key: 'listening_sensitivity', label: 'Escuta e sensibilidade ao conjunto' },
  { key: 'respectful_communication', label: 'Comunicação respeitosa' },
  { key: 'adaptability', label: 'Adaptabilidade a mudanças' },
  { key: 'worship_posture_focus', label: 'Postura e foco no culto' },
  { key: 'genuine_expression', label: 'Expressão genuína' },
  { key: 'worship_leader_sensitivity', label: 'Sensibilidade ao líder de louvor' },
] as const;

export type EvalCriterionKey = typeof EVAL_CRITERIA[number]['key'];

type CriterionRatings = Record<EvalCriterionKey, number>;
type CriterionAverages = { [K in EvalCriterionKey as `avg_${K}`]: number };

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round((values.reduce((acc, value) => acc + value, 0) / values.length) * 100) / 100;
}

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string; details?: string };
  const text = `${maybeError.message ?? ''} ${maybeError.details ?? ''}`.toLowerCase();
  return maybeError.code === 'PGRST204' || text.includes('column') && text.includes('peer_evaluations');
}

function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string; details?: string };
  const text = `${maybeError.message ?? ''} ${maybeError.details ?? ''}`.toLowerCase();
  return maybeError.code === '23505' || text.includes('duplicate key');
}

function buildLegacyCriteriaPayload(payload: CriterionRatings) {
  const musicality = average([
    payload.musical_skill,
    payload.pitch_technical_precision_metronome,
    payload.instrument_voice_knowledge,
    payload.musical_development,
  ]);

  const punctuality = payload.punctuality_frequency;
  const musicPreparation = payload.preparation_before_rehearsal;

  const groupBehavior = average([
    payload.teamwork,
    payload.listening_sensitivity,
    payload.respectful_communication,
    payload.adaptability,
  ]);

  const temperament = payload.character_integrity;

  const groupContribution = average([
    payload.relationship_with_god,
    payload.leadership_submission,
    payload.availability_for_schedule,
    payload.worship_posture_focus,
    payload.genuine_expression,
    payload.worship_leader_sensitivity,
  ]);

  return {
    musicality: Math.min(5, Math.max(1, Math.round(musicality))),
    punctuality: Math.min(5, Math.max(1, Math.round(punctuality))),
    music_preparation: Math.min(5, Math.max(1, Math.round(musicPreparation))),
    group_behavior: Math.min(5, Math.max(1, Math.round(groupBehavior))),
    temperament: Math.min(5, Math.max(1, Math.round(temperament))),
    group_contribution: Math.min(5, Math.max(1, Math.round(groupContribution))),
  };
}

export interface PeerEvaluation {
  id: string;
  evaluator_id: string;
  evaluated_id: string;
  church_id: string | null;
  relationship_with_god: number;
  character_integrity: number;
  leadership_submission: number;
  musical_skill: number;
  pitch_technical_precision_metronome: number;
  instrument_voice_knowledge: number;
  musical_development: number;
  punctuality_frequency: number;
  preparation_before_rehearsal: number;
  availability_for_schedule: number;
  teamwork: number;
  listening_sensitivity: number;
  respectful_communication: number;
  adaptability: number;
  worship_posture_focus: number;
  genuine_expression: number;
  worship_leader_sensitivity: number;
  created_at: string;
  updated_at: string;
}

export interface PeerEvaluationScore extends CriterionAverages {
  profile_id: string;
  total_evaluators: number;
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return useQuery({
    queryKey: ['peer-eval-scores-all', isAdmin],
    queryFn: async () => {
      if (!isAdmin) return [];

      const { data, error } = await db
        .from('peer_evaluation_scores')
        .select('*')
        .order('overall_score', { ascending: false });
      if (error) throw error;
      const scores = (data ?? []) as PeerEvaluationScore[];
      const enriched = await enrichScoresWithMemberData(scores);
      return enriched.sort((a, b) => Number(b.overall_score) - Number(a.overall_score));
    },
    enabled: isAdmin,
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
    } & CriterionRatings) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!currentProfile?.id) throw new Error('Perfil do usuário não encontrado');
      if (payload.evaluated_id === currentProfile.id) throw new Error('Você não pode avaliar a si mesmo');

      const record = {
        evaluator_id: currentProfile.id,
        ...payload,
        updated_at: new Date().toISOString(),
      };

      // Fluxo primário: tenta com schema atual (17 critérios), sem depender de select de retorno.
      // Isso evita erros de RLS no retorno e reduz falhas com schema cache.
      const insertPrimary = await db.from('peer_evaluations').insert(record);

      if (!insertPrimary.error) {
        return { id: 'inserted' } as PeerEvaluation;
      }

      // Se já existe avaliação para o par, atualiza a linha existente.
      if (isDuplicateKeyError(insertPrimary.error)) {
        const updatePrimary = await db
          .from('peer_evaluations')
          .update({ ...record })
          .eq('evaluator_id', currentProfile.id)
          .eq('evaluated_id', payload.evaluated_id);

        if (!updatePrimary.error) {
          return { id: 'updated' } as PeerEvaluation;
        }

        if (!isMissingColumnError(updatePrimary.error)) {
          throw updatePrimary.error;
        }
      } else if (!isMissingColumnError(insertPrimary.error)) {
        throw insertPrimary.error;
      }

      // Fallback: banco ainda com schema antigo (6 critérios).
      const legacyRecord = {
        evaluator_id: currentProfile.id,
        evaluated_id: payload.evaluated_id,
        ...buildLegacyCriteriaPayload(payload),
        updated_at: new Date().toISOString(),
      };

      const legacyInsert = await db.from('peer_evaluations').insert(legacyRecord);
      if (!legacyInsert.error) {
        return { id: 'inserted-legacy' } as PeerEvaluation;
      }

      if (isDuplicateKeyError(legacyInsert.error)) {
        const legacyUpdate = await db
          .from('peer_evaluations')
          .update({ ...legacyRecord })
          .eq('evaluator_id', currentProfile.id)
          .eq('evaluated_id', payload.evaluated_id);

        if (!legacyUpdate.error) {
          return { id: 'updated-legacy' } as PeerEvaluation;
        }

        throw legacyUpdate.error;
      }

      throw legacyInsert.error;
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
