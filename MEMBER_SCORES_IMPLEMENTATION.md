# 🎯 Integração de Avaliações com Dados Reais

## 📋 Resumo das Mudanças

### 1. ✅ Hook `useMemberScores.ts` Criado
**Localização:** `src/hooks/useMemberScores.ts`

Novo hook React Query com todas as operações de score:

#### Interfaces
```typescript
MemberScore       // Score atual do membro
MemberEvaluation  // Histórico de avaliações
```

#### Hooks Disponíveis
- **`useMemberScores()`** - Busca todos os scores ordenados por pontuação
- **`useMemberScore(userId)`** - Busca score de um membro específico
- **`useMemberEvaluationHistory(memberScoreId)`** - Busca histórico de avaliações
- **`useUpdateMemberScore()`** - Atualiza score e registra no histórico
- **`useCreateMemberScore()`** - Cria score inicial para novo membro

#### Validações
- Score entre 10 e 1000
- Registro automático em `member_evaluations`
- Toast notifications para sucesso/erro
- Invalidação automática de cache

---

### 2. ✅ Componente `MemberEvaluationsChart` Atualizado
**Localização:** `src/components/dashboard/MemberEvaluationsChart.tsx`

#### Mudanças
- ✅ Remove dados hardcoded
- ✅ Conecta ao hook `useMemberScores()`
- ✅ Busca dados reais do banco
- ✅ Adiciona estados de carregamento e erro
- ✅ Mapeia dados da API para formato do gráfico

#### Fluxo de Dados
```
useMemberScores()
    ↓ (isLoading, error, data)
    ↓
Loader Component / Error Component
    ↓
formattedScores
    ↓
MemberEvaluationsChart Component
```

#### Estados Visuais
- 🔄 **Carregando** - Spinner com mensagem
- ❌ **Erro** - Mensagem de erro com detalhes
- ✅ **Sucesso** - Gráfico com dados reais

---

## 🔌 Como Usar

### Exemplo 1: Obter Todos os Scores
```typescript
import { useMemberScores } from '@/hooks/useMemberScores';

function Dashboard() {
  const { data: scores, isLoading } = useMemberScores();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return scores?.map(score => (
    <div key={score.id}>{score.profile.name}: {score.score}</div>
  ));
}
```

### Exemplo 2: Atualizar Score de um Membro
```typescript
import { useUpdateMemberScore } from '@/hooks/useMemberScores';

function UpdateScore() {
  const updateScore = useUpdateMemberScore();
  
  const handleUpdate = () => {
    updateScore.mutate({
      userId: 'user-id-123',
      score: 650,
      frequencyScore: 680,
      commitmentScore: 620,
      reason: 'Presença em 5 reuniões consecutivas'
    });
  };
  
  return <button onClick={handleUpdate}>Atualizar Score</button>;
}
```

### Exemplo 3: Ver Histórico de Avaliações
```typescript
import { useMemberEvaluationHistory } from '@/hooks/useMemberScores';

function EvaluationHistory({ memberScoreId }) {
  const { data: history } = useMemberEvaluationHistory(memberScoreId);
  
  return history?.map(eval => (
    <div key={eval.id}>
      {eval.previous_score} → {eval.new_score}
      <p>{eval.reason}</p>
    </div>
  ));
}
```

---

## 🗄️ Estrutura de Dados

### `member_scores` Table
```
┌─────────────────────────┐
│ member_scores           │
├─────────────────────────┤
│ id (uuid)               │ ← Primary Key
│ user_id (uuid)          │ ← FK to auth.users
│ profile_id (uuid)       │ ← FK to profiles
│ score (10-1000)         │ ← Total Score
│ frequency_score         │ ← Frequência %
│ commitment_score        │ ← Comprometimento %
│ substitution_score      │ ← Impacto Substituições
│ agenda_block_score      │ ← Impacto Bloqueios
│ total_substitutions_requested
│ total_agenda_blocks
│ last_evaluation_at      │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

### `member_evaluations` Table (Histórico)
```
┌─────────────────────────┐
│ member_evaluations      │
├─────────────────────────┤
│ id (uuid)               │ ← Primary Key
│ member_score_id (uuid)  │ ← FK to member_scores
│ criterion (enum)        │ ← Tipo de avaliação
│ previous_score          │ ← Score anterior
│ new_score               │ ← Novo score
│ reason (text)           │ ← Justificativa
│ evaluator_id            │ ← Admin que fez
│ created_at              │
└─────────────────────────┘
```

---

## 📊 RLS Policies

### Leitura de Scores
- ✅ Usuário pode ver próprio score
- ✅ Admin pode ver todos os scores
- ✅ Service role tem acesso total

### Atualização de Scores
- ✅ Service role pode atualizar (para funções/triggers)
- ✅ Admin pode atualizar (com função)

---

## 🎨 Componentes Visuais

### Dashboard Integration
```tsx
<MemberEvaluationsChart />
```

**Displays:**
1. 📊 Gráfico de barras com Score, Frequência, Comprometimento
2. 🏆 Ranking ordenado por pontuação
3. 📈 Indicadores de tendência (↑ ↓ ≡)
4. 🎯 Código de cores por performance

**Estados:**
- Verde 800+ (Alto)
- Azul 600-799 (Normal)
- Laranja 400-599 (Abaixo da média)
- Vermelho <400 (Baixo)

---

## 🚀 Próximas Etapas

### Phase 1: Lógica de Cálculo ⏳
- [ ] Implementar cálculo automático de frequência %
- [ ] Implementar cálculo automático de comprometimento %
- [ ] Criar função para penalidades por substituições
- [ ] Criar função para penalidades por bloqueios de agenda

### Phase 2: Automação 🤖
- [ ] Trigger ao marcar presença/ausência
- [ ] Trigger ao solicitar substituição
- [ ] Trigger ao bloquear agenda
- [ ] Trigger ao chegar atrasado

### Phase 3: Admin Interface 👨‍💼
- [ ] Página para gerenciar scores manualmente
- [ ] Formulário para ajustar scores com motivo
- [ ] Dashboard de histórico de avaliações
- [ ] Relatório de tendências por período

### Phase 4: Refinamentos 🔧
- [ ] Implementar regra de -500 quando todos diminuem
- [ ] Adicionar filtros de performance no dashboard
- [ ] Exportar relatórios de avaliações
- [ ] Configurar alertas de baixo desempenho

---

## ✅ Status Atual

| Item | Status | Observações |
|------|--------|------------|
| Estrutura do Banco | ✅ Pronto | Migration criada |
| Hook React Query | ✅ Pronto | Todas operações CRUD |
| Componente UI | ✅ Pronto | Integrado no dashboard |
| Dados Reais | ✅ Funcional | Busca do banco |
| Cálculo de Scores | ⏳ Pendente | Aguardando critérios |
| Admin Interface | ⏳ Pendente | Phase 3 |
| Automação | ⏳ Pendente | Phase 2 |

---

## 📝 Notas

- Todos os hooks incluem tratamento de erro e notificações toast
- Cache do React Query é invalidado automaticamente após mutações
- RLS policies garantem segurança dos dados
- Score padrão para novo membro: 500
- Score pode variar entre 10 e 1000 por validação do banco

**Próximo passo:** Aguardando critérios de avaliação detalhados do usuário para implementar lógica de cálculo de scores.
