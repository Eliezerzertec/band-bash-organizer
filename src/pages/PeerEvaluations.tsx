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
  useMyEvaluationOf,
  useUpsertPeerEvaluation,
  usePeerEvaluationScore,
  useAllPeerEvaluationScores,
} from '@/hooks/usePeerEvaluations';

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
  const color =
    score >= 4.5
      ? 'bg-green-500'
      : score >= 3.5
      ? 'bg-blue-500'
      : score >= 2.5
      ? 'bg-yellow-500'
      : 'bg-red-500';
  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {score.toFixed(1)} ★
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
  const { data: existing } = useMyEvaluationOf(memberId);
  const upsert = useUpsertPeerEvaluation();

  const [ratings, setRatings] = useState<Record<EvalCriterionKey, number>>({
    musicality: 0,
    punctuality: 0,
    music_preparation: 0,
    group_behavior: 0,
    temperament: 0,
    group_contribution: 0,
  });

  // Preencher com avaliação existente quando chegar
  const [synced, setSynced] = useState(false);
  if (!synced && existing) {
    setRatings({
      musicality: existing.musicality,
      punctuality: existing.punctuality,
      music_preparation: existing.music_preparation,
      group_behavior: existing.group_behavior,
      temperament: existing.temperament,
      group_contribution: existing.group_contribution,
    });
    setSynced(true);
  }

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
          {upsert.isPending ? 'Salvando...' : existing ? 'Atualizar avaliação' : 'Enviar avaliação'}
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
  const { data: existing } = useMyEvaluationOf(member.id);
  const { data: score } = usePeerEvaluationScore(member.id);
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
            {score && <ScoreBadge score={Number(score.overall_score)} />}
            {existing && (
              <Badge variant="outline" className="text-xs">Avaliado</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {existing ? 'Editar' : 'Avaliar'}
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
  const [tab, setTab] = useState<'evaluate' | 'scores'>('evaluate');
  void currentProfile; // usado para consistência futura

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
        <button
          onClick={() => setTab('scores')}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'scores' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="inline w-4 h-4 mr-1" />
          Escores gerais
        </button>
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
            <CardTitle className="text-base">Ranking de Escores</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoresPanel />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
