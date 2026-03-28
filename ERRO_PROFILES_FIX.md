# 🔧 FIXAR ERRO AO SALVAR EM PROFILES

## ❌ Erro Encontrado

Ao criar membro, recebe erro ao salvar dados em `profiles`

## ✅ Solução Rápida (2 minutos)

### Passo 1: Abrir Supabase Dashboard
- Acesse: https://app.supabase.com
- Selecione seu projeto

### Passo 2: Executar Script SQL
1. Menu esquerdo → **SQL Editor**
2. Clique em **New Query**
3. Copie **TODO** o conteúdo de:
   ```
   FIX_PROFILES_RLS_NOW.sql
   ```
4. Cole no editor
5. Clique em **Execute** (ou Ctrl+Enter)

### Passo 3: Verificar Sucesso
Deve aparecer uma tabela com as policies:
- ✅ "Users can insert own profile"
- ✅ "Service role can manage profiles"
- (mais outras que já existem)

### Passo 4: Testar
- Volte para a app
- Members → **Novo Membro**
- Preencha e clique **Criar Membro**
- Deve aparecer ✅ "Membro criado com sucesso!"

---

## 🐛 Se Tiver Outro Erro

Abra o console do navegador (F12) e procure por mensagens como:

| Erro | Causa | Solução |
|------|-------|---------|
| **42501** | Erro de permissão RLS | Execute FIX_PROFILES_RLS_NOW.sql |
| **23505** | Email duplicado | Use um email diferente |
| **RLS policy violation** | Policy bloqueando INSERT | Execute o script SQL acima |
| **Rate limit** | Muitas requisições | Espere 8 segundos e tente novamente |

---

## 📋 O que o Script Faz

1. **Remove** policies antigas que podem estar conflitando
2. **Recria** as 2 policies necessárias:
   - `Users can insert own profile` - Permite que usuário crie seu próprio perfil
   - `Service role can manage profiles` - Permite que sistema crie perfis
3. **Verifica** se tudo está correto

---

## 📊 Status

- ✅ Formulário criado com todos os campos
- ✅ Hook aprimorado com melhor tratamento de erro
- ❌ RLS policy pode estar bloqueando (executar SQL acima)

**Depois de executar o SQL, tudo deve funcionar!**

