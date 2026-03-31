import { useState } from 'react';
import { Star, User, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentProfile } from '@/hooks/useProfiles';
import {
  EVAL_CRITERIA,
  type EvalCriterionKey,
  useMembersToEvaluate,
  useUpsertPeerEvaluation,
  usePeerEvaluationScore,
  useAllPeerEvaluationScores,
} from '@/hooks/usePeerEvaluations';

const createInitialRatings = (): Record<EvalCriterionKey, number> =>
  Object.fromEntries(EVAL_CRITERIA.map(({ key }) => [key, 0])) as Record<EvalCriterionKey, number>;

function toScorePoints(overallScore: number): number {
  // Compatibilidade: migrações antigas podem retornar 1-5, novas retornam 0-1000.
  return overallScore <= 5 ? Math.round(overallScore * 200) : Math.round(overallScore);
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="focus:outline-none disabled:cursor-default"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const points = toScorePoints(score);
  const color =
    points >= 900
      ? 'bg-green-500'
      : points >= 700
      ? 'bg-blue-500'
      : points >= 500
      ? 'bg-yellow-500'
      : 'bg-red-500';
  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {points} pts
    </span>
  );
}

// ─── Formulário de avaliação de um único membro ───────────────────────────────
function EvalForm({
  memberId,
  memberName,
  onClose,
}: {
  memberId: string;
  memberName: string;
  onClose: () => void;
}) {
  const upsert = useUpsertPeerEvaluation();

  const [ratings, setRatings] = useState<Record<EvalCriterionKey, number>>(createInitialRatings);

  const allFilled = Object.values(ratings).every((v) => v > 0);

  const handleSubmit = () => {
    upsert.mutate({ evaluated_id: memberId, ...ratings }, { onSuccess: onClose });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Avalie <strong>{memberName}</strong> de 1 a 5 estrelas em cada critério:
      </p>

      {EVAL_CRITERIA.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <span className="text-sm flex-1">{label}</span>
          <StarRating
            value={ratings[key]}
            onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
          />
        </div>
      ))}

      <Separator />

      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button
          size="sm"
          disabled={!allFilled || upsert.isPending}
          onClick={handleSubmit}
        >
          {upsert.isPending ? 'Salvando...' : 'Salvar avaliação'}
        </Button>
      </div>
    </div>
  );
}

// ─── Card de um membro (lista de avaliação) ───────────────────────────────────
function MemberEvalCard({
  member,
}: {
  member: { id: string; name: string | null; avatar_url: string | null; musical_skills: string[] | null };
}) {
  const [open, setOpen] = useState(false);
  const name = member.name ?? 'Membro';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar_url ?? ''} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{name}</p>
              {member.musical_skills && member.musical_skills.length > 0 && (
                <p className="text-xs text-muted-foreground">{member.musical_skills.slice(0, 3).join(' · ')}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Avaliar
            </Button>
          </div>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <EvalForm
            memberId={member.id}
            memberName={name}
            onClose={() => setOpen(false)}
          />
        </CardContent>
      )}
    </Card>
  );
}

// ─── Painel de Escores (visão geral) ─────────────────────────────────────────
function ScoresPanel() {
  const { data: scores, isLoading } = useAllPeerEvaluationScores();

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando escores...</p>;
  if (!scores || scores.length === 0)
    return <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada ainda.</p>;

  const withNames = scores;

  return (
    <div className="space-y-3">
      {withNames.map((s) => (
        <div key={s.profile_id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <Avatar className="h-9 w-9">
            <AvatarImage src={s.avatar_url ?? ''} />
            <AvatarFallback>{(s.name ?? 'M').charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{s.name ?? 'Membro'}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {EVAL_CRITERIA.map(({ key, label }) => {
                const avg = Number(s[`avg_${key}` as keyof typeof s] ?? 0);
                return (
                  <span key={key} className="text-xs text-muted-foreground">
                    {label.split(' ')[0]}: {avg.toFixed(1)}★
                  </span>
                );
              })}
            </div>
          </div>
          <div className="text-right shrink-0">
            <ScoreBadge score={Number(s.overall_score)} />
            <p className="text-xs text-muted-foreground mt-1">{s.total_evaluators} avaliador(es)</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PeerEvaluations() {
  const { user } = useAuth();
  const { data: currentProfile } = useCurrentProfile();
  const { data: members, isLoading } = useMembersToEvaluate();
  const isAdmin = user?.role === 'admin';
  const { data: myScore, isLoading: isLoadingMyScore } = usePeerEvaluationScore(currentProfile?.id || '');
  const [tab, setTab] = useState<'evaluate' | 'scores'>('evaluate');

  if (!user) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Award className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Avaliação entre Membros</h1>
          <p className="text-sm text-muted-foreground">
            Avalie seus colegas de equipe de 1 a 5 estrelas em cada critério. O escore geral é a média de todas as avaliações recebidas.
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('evaluate')}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'evaluate' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="inline w-4 h-4 mr-1" />
          Avaliar colegas
        </button>
        {isAdmin ? (
          <button
            onClick={() => setTab('scores')}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'scores' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="inline w-4 h-4 mr-1" />
            Escores gerais
          </button>
        ) : (
          <button
            onClick={() => setTab('scores')}
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'scores' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Award className="inline w-4 h-4 mr-1" />
            Minha pontuação
          </button>
        )}
      </div>

      {/* Conteúdo */}
      {tab === 'evaluate' ? (
        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando membros...</p>}
          {!isLoading && members && members.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum colega para avaliar no momento.</p>
          )}
          {members?.map((m) => (
            <MemberEvalCard
              key={m.id}
              member={m}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isAdmin ? 'Ranking de Escores' : 'Minha pontuação'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <ScoresPanel />
            ) : isLoadingMyScore ? (
              <p className="text-sm text-muted-foreground">Carregando sua pontuação...</p>
            ) : myScore ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Sua média geral</p>
                    <p className="text-2xl font-bold">{toScorePoints(Number(myScore.overall_score || 0))} pts</p>
                  </div>
                  <Badge variant="outline">{myScore.total_evaluators} avaliador(es)</Badge>
                </div>
                <div className="grid gap-2">
                  {EVAL_CRITERIA.map(({ key, label }) => {
                    const avg = Number(myScore[`avg_${key}` as keyof typeof myScore] ?? 0);
                    return (
                      <div key={key} className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-sm">{label}</span>
                        <ScoreBadge score={avg} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Você ainda não recebeu avaliações.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
