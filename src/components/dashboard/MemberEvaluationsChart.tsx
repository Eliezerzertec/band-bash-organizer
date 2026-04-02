import { useState } from 'react';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { Award, TrendingUp, TrendingDown, Loader, Lock } from 'lucide-react';
import { useAllPeerEvaluationScores, usePeerEvaluationScore } from '@/hooks/usePeerEvaluations';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentProfile } from '@/hooks/useProfiles';
import { ScoreGauge } from '@/components/ui/ScoreGauge';

interface MemberScore {
  id: string;
  name: string;
  score: number;
  avg_musicality: number;
  avg_punctuality: number;
  avg_music_preparation: number;
  avg_group_behavior: number;
  avg_temperament: number;
  avg_group_contribution: number;
  total_evaluators: number;
  musical_skills: string[];
  trend: 'up' | 'down' | 'stable';
}

function getScoreColor(score: number): string {
  if (score >= 800) return 'hsl(150, 80%, 50%)'; // Verde
  if (score >= 600) return 'hsl(200, 80%, 50%)'; // Azul
  if (score >= 400) return 'hsl(40, 95%, 55%)';  // Laranja
  return 'hsl(0, 85%, 60%)';                     // Vermelho
}

function toScorePoints(overallScore: number): number {
  // Compatibilidade: migrações antigas podem retornar 1-5, novas retornam 0-1000.
  return overallScore <= 5 ? Math.round(overallScore * 200) : Math.round(overallScore);
}

export function MemberEvaluationsChart() {
  const { hasRole } = useAuth();
  const { data: profile } = useCurrentProfile();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Verificar se é admin
  const isAdmin = hasRole('admin');
  
  // Buscar dados reais de avaliação por pares
  const { data: allScoresData, isLoading: allLoading } = useAllPeerEvaluationScores();
  const { data: currentScoreData, isLoading: currentLoading } = usePeerEvaluationScore(profile?.id || '');

  const isLoading = isAdmin ? allLoading : currentLoading;
  const memberScoresData = isAdmin ? (allScoresData ?? []) : (currentScoreData ? [currentScoreData] : []);

  // Converter para escala 0-1000 para reaproveitar o gauge existente
  const formattedScores: MemberScore[] = memberScoresData.map((score) => {
    const overall = Number(score.overall_score || 0);
    const score1000 = toScorePoints(overall);

    return {
      id: score.profile_id,
      name: score.name || 'Membro',
      score: score1000,
      avg_musicality: Number(score.avg_musicality || 0),
      avg_punctuality: Number(score.avg_punctuality || 0),
      avg_music_preparation: Number(score.avg_music_preparation || 0),
      avg_group_behavior: Number(score.avg_group_behavior || 0),
      avg_temperament: Number(score.avg_temperament || 0),
      avg_group_contribution: Number(score.avg_group_contribution || 0),
      total_evaluators: Number(score.total_evaluators || 0),
      musical_skills: score.musical_skills || [],
      trend: score1000 >= 800 ? 'up' : score1000 >= 400 ? 'stable' : 'down',
    };
  });

  // Membro selecionado ou o primeiro da lista
  const selectedMember = selectedMemberId 
    ? formattedScores.find(m => m.id === selectedMemberId) 
    : formattedScores[0];

  if (isLoading) {
    return (
      <div className="card-elevated p-4 md:p-5 animate-slide-up flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  if (!memberScoresData || memberScoresData.length === 0) {
    return (
      <div className="card-elevated p-4 md:p-5 animate-slide-up flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">Nenhuma avaliação disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-4 md:p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <AnimatedIcon color="primary" animation="pulse" size="md" className="hidden sm:flex">
            <Award className="w-5 h-5" />
          </AnimatedIcon>
          <div>
            <h3 className="font-semibold text-foreground">
              {isAdmin ? 'Avaliações dos Membros' : 'Minha Avaliação'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isAdmin 
                ? 'Visualize os resultados calculados com as avaliações dos membros'
                : 'Sua nota média recebida nas avaliações dos colegas'
              }
            </p>
          </div>
        </div>
        
        {/* Seletor de membros (apenas para admin) */}
        {isAdmin && formattedScores.length > 1 && (
          <select 
            value={selectedMemberId || ''}
            onChange={(e) => setSelectedMemberId(e.target.value || null)}
            className="text-sm bg-muted/60 rounded-xl px-2 md:px-3 py-1.5 md:py-2 border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">Selecionar membro...</option>
            {formattedScores.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.score} pts)
              </option>
            ))}
          </select>
        )}
        
        {/* Badge de membro (apenas para não-admin) */}
        {!isAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Acesso Pessoal</span>
          </div>
        )}
      </div>

      {/* Gauge Chart */}
      {selectedMember && (
        <div className="mb-6 bg-muted/30 rounded-lg p-4">
          <div className="text-center mb-2">
            <h4 className="text-sm font-semibold text-foreground">Pontuação atual</h4>
            <p className="text-xs text-muted-foreground">{selectedMember.name}</p>
          </div>
          <ScoreGauge 
            score={selectedMember.score} 
            maxScore={1000}
            size="md"
          />
        </div>
      )}

      {/* Score Details */}
      {selectedMember && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Musicalidade</p>
            <p className="text-lg font-bold text-primary">{selectedMember.avg_musicality.toFixed(1)}★</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Pontualidade</p>
            <p className="text-lg font-bold text-primary">{selectedMember.avg_punctuality.toFixed(1)}★</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Tirar músicas</p>
            <p className="text-lg font-bold text-warning">{selectedMember.avg_music_preparation.toFixed(1)}★</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Comportamento</p>
            <p className="text-lg font-bold text-destructive">{selectedMember.avg_group_behavior.toFixed(1)}★</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Temperamento</p>
            <p className="text-lg font-bold text-primary">{selectedMember.avg_temperament.toFixed(1)}★</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Contribuição</p>
            <p className="text-lg font-bold text-primary">{selectedMember.avg_group_contribution.toFixed(1)}★</p>
          </div>
        </div>
      )}

      {/* Members List - Apenas para admin */}
      {isAdmin && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground mb-3">Ranking de Avaliações</h4>
          <div className="space-y-2 max-h-72 overflow-y-auto">
          {formattedScores.map((member, index) => (
            <div 
              key={member.id}
              onClick={() => setSelectedMemberId(member.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                selectedMemberId === member.id 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-muted/30 hover:bg-muted/50 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-semibold text-sm text-primary flex-shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Avaliadores: {member.total_evaluators} | {member.score} pts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{member.score}</p>
                  <p className="text-xs text-muted-foreground">/ 1000</p>
                </div>
                <div className="w-6 h-6 rounded flex items-center justify-center">
                  {member.trend === 'up' && (
                    <TrendingUp className="w-5 h-5 text-success" />
                  )}
                  {member.trend === 'down' && (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                  {member.trend === 'stable' && (
                    <div className="w-1 h-4 bg-warning rounded" />
                  )}
                </div>
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getScoreColor(member.score) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground space-y-1">
        <p>• Pontuação exibida em escala de 0 a 1000 (nota média x 200)</p>
        <p>• Nota média real: 1.0 a 5.0 estrelas</p>
      </div>
    </div>
  );
}
