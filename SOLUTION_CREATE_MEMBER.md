# 🔧 SOLUÇÃO: Erro ao Criar Membro

## ❌ Problema Identificado

A tabela `profiles` tem uma restrição RLS (Row Level Security) que **bloqueia INSERT**. 

Isso significa que quando a função tenta criar um novo perfil, o banco de dados rejeita porque não há política de INSERT configurada.

---

## ✅ Solução: Aplicar Migration

### Passo 1: Executar o Script SQL
No Supabase Dashboard:

1. Acesse: https://app.supabase.com
2. Seu projeto → **SQL Editor**
3. Clique em **New Query**
4. **Copie TODO o conteúdo** de:
   ```
   fix_profiles_policies.sql
   ```
5. Cole no SQL Editor
6. Clique em **Execute** (ou Ctrl+Enter)

### Passo 2: Verificar Sucesso
Você deve ver uma tabela com as políticas RLS:
- ✅ "Users can insert own profile"
- ✅ "Service role can manage profiles"
- (mais outras políticas que já existem)

### Passo 3: Testar Novamente
- Volte para a app
- Members → **Novo Membro**
- Preencha os dados:
  - Nome: João Silva
  - Email: joao@example.com
  - Telefone: (11) 99999-9999
  - Senha: Senha123456

- Clique em **Criar membro**

---

## 🔍 O que a Migration Faz

Adiciona duas políticas RLS ao `profiles`:

1. **Users can insert own profile**
   - Permite que um usuário crie seu próprio perfil

2. **Service role can manage profiles**
   - Permite que a Edge Function (com service role) crie perfis de novos usuários

---

## 📋 Checklist

- [ ] Migration executada com sucesso (viu "Success")
- [ ] Testou criar novo membro
- [ ] Toast verde apareceu ("Membro criado com sucesso!")
- [ ] Novo membro aparece na lista de Members

---

## 💡 Se Ainda Não Funcionar

1. Abra o console do navegador (F12)
2. Vá em **Console**
3. Tente criar membro novamente
4. Copie a mensagem de erro completa
5. Cole aqui para diagnóstico

---

## 📚 Arquivo da Migration

```sql
Localização: supabase/migrations/20260119000000_fix_profiles_rls.sql
Conteúdo: Políticas RLS para INSERT em profiles
```

