import { useState } from 'react';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { Award, TrendingUp, TrendingDown, Loader, Lock } from 'lucide-react';
import { useMemberScores, useCurrentMemberScore } from '@/hooks/useMemberScores';
import { useAuth } from '@/contexts/AuthContext';
import { ScoreGauge } from '@/components/ui/ScoreGauge';

interface MemberScore {
  id: string;
  name: string;
  score: number;
  frequency_score: number;
  commitment_score: number;
  substitution_score: number;
  agenda_block_score: number;
  trend: 'up' | 'down' | 'stable';
}

function getScoreColor(score: number): string {
  if (score >= 800) return 'hsl(150, 80%, 50%)'; // Verde
  if (score >= 600) return 'hsl(200, 80%, 50%)'; // Azul
  if (score >= 400) return 'hsl(40, 95%, 55%)';  // Laranja
  return 'hsl(0, 85%, 60%)';                     // Vermelho
}

export function MemberEvaluationsChart() {
  const { hasRole } = useAuth();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Verificar se é admin
  const isAdmin = hasRole('admin');
  
  // Buscar dados conforme o tipo de usuário
  const { data: allScoresData, isLoading: allLoading } = useMemberScores(isAdmin);
  const { data: currentScoreData, isLoading: currentLoading } = useCurrentMemberScore();

  const isLoading = isAdmin ? allLoading : currentLoading;
  const memberScoresData = isAdmin ? allScoresData : (currentScoreData ? [currentScoreData] : []);

  // Transformar dados do banco em formato para o gráfico
  const formattedScores: MemberScore[] = (memberScoresData || []).map((score: any) => ({
    id: score.id,
    name: score.name || 'Membro Desconhecido',
    score: score.score,
    frequency_score: score.frequency_score,
    commitment_score: score.commitment_score,
    substitution_score: score.substitution_score,
    agenda_block_score: score.agenda_block_score,
    trend: score.score >= 700 ? 'up' : score.score >= 400 ? 'stable' : 'down',
  }));

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
              {isAdmin ? 'Avaliações - Escore dos Membros' : 'Meu Escore de Avaliação'}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isAdmin 
                ? 'Visualize e gerencie os escores de todos os membros'
                : 'Sua pontuação baseada em frequência e comprometimento'
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
                {member.name} ({member.score})
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
            <h4 className="text-sm font-semibold text-foreground">Escore Atual</h4>
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
            <p className="text-xs text-muted-foreground">Frequência</p>
            <p className="text-lg font-bold text-primary">{selectedMember.frequency_score}%</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Comprometimento</p>
            <p className="text-lg font-bold text-primary">{selectedMember.commitment_score}%</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Substitições</p>
            <p className="text-lg font-bold text-warning">{selectedMember.substitution_score}%</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Bloqueios Agenda</p>
            <p className="text-lg font-bold text-destructive">{selectedMember.agenda_block_score}%</p>
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
                    Freq: {member.frequency_score}% | Comp: {member.commitment_score}%
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
        <p>• <span className="text-success">Verde (800+):</span> Alto desempenho</p>
        <p>• <span className="text-primary">Azul (600-799):</span> Desempenho normal</p>
        <p>• <span className="text-warning">Laranja (400-599):</span> Desempenho abaixo da média</p>
        <p>• <span className="text-destructive">Vermelho (&lt;400):</span> Baixo desempenho</p>
      </div>
    </div>
  );
}
