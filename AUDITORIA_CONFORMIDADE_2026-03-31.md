# Auditoria Técnica e Conformidade

Data: 31/03/2026
Projeto: band-bash-organizer

## 1) Escopo da revisão
- Fluxo de login, roteamento e perfil de acesso (admin/membro).
- Exibição de informações no dashboard do membro.
- Integridade de consultas/hook de relatórios com o schema real do Supabase.
- Padronização de tipagem TypeScript e limpeza de inconsistências de lint.
- Validação de build e testes.

## 2) Inconsistências encontradas
1. Tipagem frágil com uso extensivo de `any` em hooks e páginas críticas.
2. Campo inconsistente ao criar assignments de escala por equipe (`member.skill`), divergente do tipo real (`role_in_team`).
3. Parse de data com risco de fuso (UTC vs local) em páginas de escalas.
4. Consultas de relatórios usando colunas inexistentes no schema atual (ex.: `profiles.ministry_id`, `schedule_assignments.status`, `profiles.last_sign_in_at`).
5. Configuração Tailwind usando `require()` em arquivo TypeScript (incompatível com regra de lint).
6. Edge Functions com `@ts-nocheck`, reduzindo segurança de compilação.
7. Dependências incompletas em `useEffect` na sidebar/header.
8. Erro de runtime externo `mgt.clearMarks is not a function` em ambiente de navegador (não originado no código-fonte do app).

## 3) Correções aplicadas

### 3.1 Tipagem e padronização
- Removido `any` em pontos críticos de:
  - `src/hooks/useSchedules.ts`
  - `src/hooks/useProfiles.ts`
  - `src/pages/Schedules.tsx`
  - `src/pages/MySchedules.tsx`
  - `src/pages/Reports.tsx`
  - `src/components/dashboard/MemberEvaluationsChart.tsx`
- Ajustadas interfaces vazias para aliases de tipo em:
  - `src/components/ui/command.tsx`
  - `src/components/ui/textarea.tsx`

### 3.2 Escalas e dados do membro
- Corrigido assignment ao gerar escala por equipe:
  - de `member.skill` para `member.role_in_team` em `src/components/forms/ScheduleFormDialog.tsx`.
- Ajustado prefill em edição de escala para refletir equipes já atribuídas.
- Removido estado/código morto não utilizado no formulário de escala.
- Padronizado parse local de data (evita deslocamento de dia) em:
  - `src/pages/Schedules.tsx`
  - `src/pages/MySchedules.tsx`

### 3.3 Dashboard e navegação de membro
- Mantido suporte de navegação/roteamento por role (admin vs membro), incluindo acesso direto ao dashboard do membro.
- Menu lateral com item de dashboard do membro já integrado no fluxo de role.

### 3.4 Relatórios compatíveis com schema real
- Reescrito `src/hooks/useReportsData.ts` para usar campos existentes no banco.
- Corrigidas consultas inválidas e normalizada obtenção de ministério via relacionamento de equipes.
- Mantida API de retorno dos hooks, com dados consistentes para telas de relatórios.

### 3.5 Configuração e runtime
- Tailwind config migrado de `require` para import ESM em `tailwind.config.ts`.
- Removido `@ts-nocheck` e tipado `catch` nas Edge Functions:
  - `supabase/functions/create-user/index.ts`
  - `supabase/functions/create-user/index_v2.ts`
- Ajustes de dependências de hooks:
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
- Adicionada proteção de compatibilidade para APIs globais externas em runtime:
  - `src/lib/runtimeGuards.ts`
  - `src/main.tsx`
  - A proteção cria um `window.mgt.clearMarks` no-op quando ausente, evitando crash de scripts externos sem impactar a lógica do app.

## 4) Validações executadas
- `npm run lint`
  - Resultado: 0 erros, 8 warnings (não bloqueantes, padrão de Fast Refresh em componentes shadcn e contexto).
- `npm run build`
  - Resultado: build OK.
- `npm run test`
  - Resultado: testes OK (1/1).

## 5) Pontos pendentes (não bloqueantes)
1. Warnings de `react-refresh/only-export-components` em arquivos UI/contexto padrão do projeto.
2. Bundle principal ainda grande (>500 kB minificado), com sugestão futura de code-splitting por rota.
3. Métricas de presença em relatórios continuam aproximadas enquanto não houver coluna/fonte explícita de presença/falta por assignment.

## 6) Garantia sobre painel do membro
- O fluxo foi ajustado para manter consistência entre cadastro/atribuição no painel admin e exibição no painel do membro.
- As informações de escala, equipe, instrumento/função e contexto da agenda ficam disponíveis no dashboard do membro quando atribuídas corretamente no admin.
- Para ambientes com dados legados, aplicar migrações SQL pendentes do diretório `supabase/migrations` é essencial para refletir permissões RLS corretamente.

## 7) Recomendação operacional imediata
- Executar migrações pendentes no Supabase para garantir paridade de RLS e visibilidade de dados:
  - `supabase db push`

