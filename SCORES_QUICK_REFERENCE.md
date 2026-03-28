# ⚡ Quick Reference - Member Scores

## 🔗 Arquivos Modificados
```
src/hooks/useMemberScores.ts                          ← NOVO ✨
src/components/dashboard/MemberEvaluationsChart.tsx   ← ATUALIZADO
src/pages/Dashboard.tsx                               ← JÁ ATUALIZADO
supabase/migrations/20260120000002_*                  ← JÁ CRIADA
```

## 📦 Dependências
```typescript
import { useMemberScores } from '@/hooks/useMemberScores';
```

## 🎯 Próximo Passo
Usuário deve fornecer os critérios de avaliação e pontuação:
- Como calcular frequência %?
- Como calcular comprometimento %?
- Qual penalidade por substituição?
- Qual penalidade por bloqueio de agenda?
- Quando reduzir -500 de todos?

## ✅ O Que Já Funciona
1. Dashboard carrega avaliações reais do banco ✅
2. Gráfico atualiza conforme dados mudam ✅
3. Rankings ordenados por pontuação ✅
4. Indicadores de tendência ✅
5. Estados de carregamento/erro ✅

## ❌ O Que Falta
1. Lógica de cálculo de scores
2. Triggers automáticos no banco
3. Interface de admin para ajustes
4. Testes de funcionalidade

## 🚀 Para Executar
1. Deploy da migration: `supabase db push`
2. Criar alguns registros de `member_scores` com INSERT
3. Recarregar dashboard para ver dados reais
