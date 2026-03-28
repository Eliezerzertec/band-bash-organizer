# Atualizações do Sistema de Escalas

## Data: 20 de janeiro de 2026

### Mudanças Implementadas

#### 1. **Novo Campo: Tipo de Chamado**
- ✅ Adicionado campo "Tipo de Chamado" com opções: **Normal** ou **Especial**
- Campo obrigatório no formulário de criação de escala
- Padrão: "Normal"

#### 2. **Horários Pré-configurados**
- ✅ Hora de início padrão: **19:00** (mudado de 09:00)
- ✅ Hora de término padrão: **20:30** (mudado de vazio)
- Horários podem ser alterados manualmente no formulário

#### 3. **Seleção por Equipes**
- ✅ Substituído sistema de seleção de **membros individuais** por seleção de **equipes**
- Interface mais simples e objetiva
- Equipes selecionadas aparecem em lista confirmável

#### 4. **Banco de Dados**
- ✅ Criada migration: `20260120000005_add_schedule_type.sql`
- Adicionado campo `schedule_type` na tabela `schedules`
- Tipo: VARCHAR(20), Padrão: 'normal'

#### 5. **Tipos TypeScript**
- ✅ Atualizada interface `Schedule` em `useSchedules.ts`
- Adicionado campo `schedule_type: 'normal' | 'especial'`

### Arquivos Modificados

1. `src/components/forms/ScheduleFormDialog.tsx`
   - Adicionado campo `schedule_type` ao schema Zod
   - Novo estado `selectedTeams` para rastrear equipes selecionadas
   - Substituída seção "Membros da Escala" por "Equipes da Escala"
   - Atualizada função `onSubmit` para usar equipes
   - Removidas funções de manipulação de membros individuais
   - Pré-configurados horários: 19:00 e 20:30

2. `src/hooks/useSchedules.ts`
   - Atualizada interface `Schedule` com campo `schedule_type`

3. `supabase/migrations/20260120000005_add_schedule_type.sql`
   - Nova migration para adicionar coluna `schedule_type`

### Como Usar

1. Abrir página de Escalas (http://localhost:8081/schedules)
2. Clique em "Nova Escala"
3. Preencha os campos:
   - Título (obrigatório)
   - Descrição (opcional)
   - Data do evento (obrigatório)
   - Tipo de Chamado: **Normal** ou **Especial** (obrigatório)
4. Horários já vêm com 19:00 às 20:30 (customize se necessário)
5. Selecione a Igreja (obrigatório)
6. Selecione Ministério (opcional)
7. Selecione as Equipes que participarão (obrigatório)
8. Clique em "Criar"

### Validações

- ✅ Título obrigatório
- ✅ Data obrigatório
- ✅ Igreja obrigatória
- ✅ Tipo de Chamado obrigatório
- ✅ Pelo menos uma equipe deve ser selecionada
- ✅ Horários não podem ser vazios (padrão 19:00-20:30)

### Próximos Passos (Sugeridos)

1. Confirmar que a migration foi aplicada no banco de dados
2. Testar criação de nova escala com equipes
3. Testar edição de escalas existentes
4. Validar visualização das escalas com o tipo de chamado
5. Integrar tipo de chamado na listagem de escalas
