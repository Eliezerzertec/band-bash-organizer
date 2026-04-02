import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface MemberScore {
  id: string;
  user_id: string;
  profile_id: string;
  name: string;
  score: number;
  frequency_score: number;
  commitment_score: number;
  substitution_score: number;
  agenda_block_score: number;
  total_substitutions_requested: number;
  total_agenda_blocks: number;
  last_evaluation_at: string;
  created_at: string;
  updated_at: string;
}

export interface MemberEvaluation {
  id: string;
  member_score_id: string;
  criterion: 'frequency' | 'commitment' | 'substitution_requests' | 'agenda_blocks' | 'other';
  previous_score: number | null;
  new_score: number;
  reason: string | null;
  evaluator_id: string | null;
  created_at: string;
}

// Dados mockados enquanto a migration não é executada
const MOCK_MEMBER_SCORES: MemberScore[] = [
  {
    id: '1',
    user_id: 'user-1',
    profile_id: 'profile-1',
    name: 'João Silva',
    score: 850,
    frequency_score: 95,
    commitment_score: 90,
    substitution_score: 75,
    agenda_block_score: 85,
    total_substitutions_requested: 2,
    total_agenda_blocks: 0,
    last_evaluation_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-2',
    profile_id: 'profile-2',
    name: 'Maria Santos',
    score: 720,
    frequency_score: 80,
    commitment_score: 85,
    substitution_score: 65,
    agenda_block_score: 75,
    total_substitutions_requested: 5,
    total_agenda_blocks: 1,
    last_evaluation_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'user-3',
    profile_id: 'profile-3',
    name: 'Pedro Costa',
    score: 580,
    frequency_score: 70,
    commitment_score: 65,
    substitution_score: 55,
    agenda_block_score: 60,
    total_substitutions_requested: 8,
    total_agenda_blocks: 2,
    last_evaluation_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'user-4',
    profile_id: 'profile-4',
    name: 'Ana Oliveira',
    score: 920,
    frequency_score: 98,
    commitment_score: 95,
    substitution_score: 90,
    agenda_block_score: 95,
    total_substitutions_requested: 1,
    total_agenda_blocks: 0,
    last_evaluation_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'user-5',
    profile_id: 'profile-5',
    name: 'Carlos Ferreira',
    score: 480,
    frequency_score: 60,
    commitment_score: 55,
    substitution_score: 40,
    agenda_block_score: 50,
    total_substitutions_requested: 12,
    total_agenda_blocks: 3,
    last_evaluation_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Get all member scores (somente admin)
export function useMemberScores(adminOnly: boolean = false) {
  return useQuery({
    queryKey: ['member-scores', adminOnly],
    queryFn: async () => {
      // TODO: Substituir por dados reais do banco após executar migration
      // Se adminOnly = false, retorna apenas mock
      if (!adminOnly) return [];
      
      return MOCK_MEMBER_SCORES;
    },
  });
}

// Get current user score
export function useCurrentMemberScore() {
  return useQuery({
    queryKey: ['current-member-score'],
    queryFn: async () => {
      // TODO: Substituir por dados reais do banco após executar migration
      // Retorna apenas o primeiro membro como exemplo
      return MOCK_MEMBER_SCORES[0] || null;
    },
  });
}

// Get single member score
export function useMemberScore(userId: string) {
  return useQuery({
    queryKey: ['member-score', userId],
    queryFn: async () => {
      // TODO: Substituir por dados reais do banco após executar migration
      return MOCK_MEMBER_SCORES.find(m => m.user_id === userId) || null;
    },
    enabled: !!userId,
  });
}

// Get evaluation history for a member
export function useMemberEvaluationHistory(memberScoreId: string) {
  return useQuery({
    queryKey: ['member-evaluations', memberScoreId],
    queryFn: async () => {
      // TODO: Substituir por dados reais do banco após executar migration
      return [] as MemberEvaluation[];
    },
    enabled: !!memberScoreId,
  });
}

// Update member score
export function useUpdateMemberScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      score,
      frequencyScore,
      commitmentScore,
      substitutionScore,
      agendaBlockScore,
      reason,
    }: {
      userId: string;
      score: number;
      frequencyScore?: number;
      commitmentScore?: number;
      substitutionScore?: number;
      agendaBlockScore?: number;
      reason?: string;
    }) => {
      // Validar score
      if (score < 10 || score > 1000) {
        throw new Error('Score deve estar entre 10 e 1000');
      }

      // TODO: Substituir por dados reais do banco após executar migration
      const currentScore = MOCK_MEMBER_SCORES.find(m => m.user_id === userId);
      if (!currentScore) {
        throw new Error('Avaliação do membro não encontrada');
      }

      return currentScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-scores'] });
      queryClient.invalidateQueries({ queryKey: ['member-score'] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação do membro atualizada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao atualizar avaliação',
        variant: 'destructive',
      });
    },
  });
}

// Create member score (for new members)
export function useCreateMemberScore() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      // TODO: Substituir por dados reais do banco após executar migration
      const newScore: MemberScore = {
        id: Math.random().toString(),
        user_id: userId,
        profile_id: Math.random().toString(),
        name: 'Novo Membro',
        score: 500,
        frequency_score: 500,
        commitment_score: 500,
        substitution_score: 500,
        agenda_block_score: 500,
        total_substitutions_requested: 0,
        total_agenda_blocks: 0,
        last_evaluation_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-scores'] });
      toast({
        title: 'Sucesso',
        description: 'Avaliação criada com valor inicial de 500',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar avaliação',
        variant: 'destructive',
      });
    },
  });
}
