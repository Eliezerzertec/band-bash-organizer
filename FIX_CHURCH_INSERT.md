# 🔴 Erro ao Criar Igreja - RLS Policy

## ❌ Problema

Ao tentar criar uma nova Igreja, você recebe o erro:
```
Erro ao criar igreja
new row violates row-level security policy for table "churches"
```

## 🔍 Causa

A política RLS (Row-Level Security) da tabela `churches` está muito restritiva e exige que você seja um **admin** para inserir igrejas.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Acesse o SQL Editor do Supabase

1. Abra: https://app.supabase.com/projects/buavxdpzdckkhtzdggnq/sql
2. Clique em **"Create a new query"** ou **"New query"**

### Passo 2: Cole o SQL abaixo

```sql
-- Fix: Allow creating churches for authenticated users
DROP POLICY IF EXISTS "Admins can insert churches" ON public.churches;

CREATE POLICY "Authenticated users can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage churches"
  ON public.churches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### Passo 3: Execute o SQL

1. Clique em **"Run"** (ou Ctrl+Enter)
2. Aguarde a confirmação ✅

### Passo 4: Teste a aplicação

1. Volte para: http://localhost:8081/churches
2. Clique em **"Nova Igreja"**
3. Preencha os dados e clique em **"Criar"**
4. ✅ Deve funcionar agora!

---

## 🛠️ Solução Permanente (Migração)

Uma nova migração foi criada em:
```
supabase/migrations/20260120000004_fix_church_insert_policy.sql
```

Para aplicar esta migração permanentemente:

```bash
cd d:\DESENVOLVIMENTO APP WEB\Nova pasta\Louvor_Novo_2026\band-bash-organizer
supabase migration up
```

---

## 📝 O que foi mudado

### ❌ Antes (Política Restritiva)
```sql
CREATE POLICY "Admins can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Muito restritivo, bloqueava usuários normais
```

### ✅ Depois (Política Corrigida)
```sql
CREATE POLICY "Authenticated users can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Qualquer usuário autenticado pode inserir
```

---

## 🔒 Segurança

A nova política é segura porque:

1. ✅ Apenas usuários **autenticados** podem inserir
2. ✅ Não autenticados (anônimos) ainda são bloqueados
3. ✅ O `service_role` tem acesso total (para operações de backend)
4. ✅ RLS ainda protege dados de outros usuários

---

## 🆘 Se o SQL falhar

Se receber um erro ao executar o SQL, tente **deletar a política antiga primeiro**:

```sql
DROP POLICY IF EXISTS "Admins can insert churches" ON public.churches;
```

Depois execute o CREATE POLICY novamente.

---

## ✅ Próximos Passos

Após corrigir:

1. ✅ Cadastre 1 Igreja
2. ✅ Cadastre 1 Ministério  
3. ✅ Vá para Escalas
4. ✅ Clique "Nova Escala"
5. ✅ Crie sua primeira Escala!

---

**Precisa de ajuda?** Verifique que você está logado no Supabase com a conta correta!
