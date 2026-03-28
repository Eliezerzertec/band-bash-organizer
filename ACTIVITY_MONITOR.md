# Monitor de Atividades dos Membros

## Visão Geral

O **Activity Monitor** é um novo componente que exibe o nível de participação de cada membro do ministério de louvor com indicadores visuais em cores.

## Características

### Níveis de Participação

- **🟢 Verde - Participação Ideal**: Membro com nível de engajamento ideal
- **🔵 Azul - Pouco Participativo**: Membro com baixa taxa de participação
- **🔴 Vermelho - Muito Ativo**: Membro com alta atividade

### Componentes

#### `ActivityMonitor`
Componente que exibe o status de atividade de um único membro.

**Props:**
- `member: Profile` - Perfil do membro

**Features:**
- Ícone indicador de tendência (↓ baixa, ⊕ ideal, ↑ alta)
- Fundo colorido baseado no nível
- Indicador visual de ponto colorido

#### `ActivityMonitorSection`
Seção completa com resumo e lista de todos os membros.

**Props:**
- `members: Profile[]` - Array de membros

**Features:**
- Cards resumidos com estatísticas por nível
- Percentual de membros em cada categoria
- Lista scrollável com todos os membros
- Caixa de notas sobre implementação futura

## Integração

O componente está integrado na página **Members.tsx**:
- Exibe acima da tabela de membros
- Mostra resumo de participação
- Lista completa de atividades

## Gancho para Implementação Futura

### TODO: Implementar Cálculo Real de Atividades

O componente atualmente usa dados fictícios. Para implementação real, considerar:

1. **Dados de Escalas**
   - Número de vezes escalado
   - Frequência de comparecimento nas escalas
   - Taxa de conclusão de escalas

2. **Dados de Substituição**
   - Número de substituições realizadas
   - Resposta a pedidos de substituição
   - Engajamento em substituições

3. **Dados de Equipes**
   - Participação em atividades da equipe
   - Engajamento em ensaios
   - Contribuição geral

4. **Histórico Temporal**
   - Data da última participação
   - Tendência de participação (aumentando/diminuindo)
   - Análise por período (últimos 30/60/90 dias)

5. **Limites de Participação**
   - Definir rangos para classificação:
     - `low`: < 30% de participação
     - `ideal`: 30-80% de participação
     - `high`: > 80% de participação

### Funções a Implementar

```typescript
// No hook useProfiles ou novo hook useActivityMetrics:

// Calcular taxa de participação do membro
function calculateParticipationRate(memberId: string): Promise<number>

// Obter últimas atividades
function getMemberActivityHistory(memberId: string, days?: number): Promise<Activity[]>

// Calcular tendência de engajamento
function calculateEngagementTrend(memberId: string): Promise<'increasing' | 'stable' | 'decreasing'>

// Obter estatísticas detalhadas
function getMemberActivityStats(memberId: string): Promise<{
  scheduleCount: number
  attendanceRate: number
  substitutionCount: number
  teamEngagement: number
  lastParticipation: Date | null
}>
```

## Armazenamento de Dados

### Tabelas Necessárias

- `schedule_participations` - Registro de escalas
- `substitutions` - Dados de substituições
- `team_activities` - Atividades da equipe
- `member_attendance` - Histórico de presença

### Campos Relacionados em `profiles`

```typescript
{
  // ... campos existentes
  last_participation?: timestamp
  participation_rate?: number
  activity_status?: 'low' | 'ideal' | 'high'
}
```

## Uso Futuro para Avaliação

O monitor de atividades será usado como critério para:
- **Escore de Avaliação**: Considerar participação na fórmula final
- **Seleção de Equipes**: Priorizar membros com melhor participação
- **Relatórios**: Gerar insights sobre engajamento
- **Notificações**: Alertar sobre membros com baixa participação

## Melhorias Planejadas

- [ ] Gráfico de tendência temporal
- [ ] Filtrar membros por nível de participação
- [ ] Exportar relatório de atividades
- [ ] Notificações automáticas para baixa participação
- [ ] Análise comparativa entre membros
- [ ] Previsão de participação futura
- [ ] Identificar membros em risco de desligamento

## Notas Técnicas

- Componente usa Tailwind CSS para cores
- Icons do Lucide React
- Usa tipos `Profile` do hook `useProfiles`
- Integrado com sistema existente de cores da aplicação
