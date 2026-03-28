# 🔧 RESUMO: Erro SQL ao fazer Deploy

## ❌ Erro Recebido
```
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "//" 
```

## ✅ Correções Aplicadas

1. **Arquivo `deno.json`** criado
   - Necessário para Deno reconhecer o projeto

2. **Código da função simplificado**
   - Removido import estático
   - Usando import dinâmico (mais compatível)
   - Sem type annotations complexas

3. **Documentação criada**
   - `ERRO_SQL_DEPLOY.md` - Instruções detalhadas

---

## 🚀 Próximos Passos (AGORA)

### 1. Se houve erro anterior, DELETE a função
1. Acesse: https://app.supabase.com
2. Menu esquerdo: **Edge Functions**
3. Clique na função `create-user` (se existir)
4. Clique em **⋮** (três pontinhos) → **Delete**

### 2. Crie uma Nova Função
1. Clique em **Create a new function**
2. Nome: `create-user`
3. Clique em **Create**

### 3. Cole o Código Atualizado
Abra em VS Code: `supabase/functions/create-user/index.ts`

Copie o código (Ctrl+A → Ctrl+C)

Cole no Supabase Dashboard (remova código padrão, Ctrl+V)

### 4. Deploy
Clique em **Deploy** (canto superior direito)

### 5. Variáveis de Ambiente
1. Na função, clique em **Settings** ⚙️
2. **Add new environment variable**:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [Copie de Project Settings > API Keys > service_role]
3. Clique em **Save**

### 6. Teste
- Volte para a app
- Members → Novo Membro
- Teste criar um membro

---

## 📌 Arquivo de Código

O arquivo atualizado está em:
```
supabase/functions/create-user/index.ts
```

Está 100% compatível com Deno e Supabase Edge Functions.

---

## 💡 Se Continuar com Erro

1. **Verifique no navegador (F12)**
   - Console → Veja mensagem de erro completa
   - Cole aqui

2. **Verifique no Supabase Dashboard**
   - Edge Functions → create-user → Logs
   - Veja se há erro na execução

3. **Common issues**:
   - ❌ Função criada como "SQL Function" (deve ser "Edge Function")
   - ❌ Service Role Key incorreta ou não configurada
   - ❌ Código não salvo corretamente

---

**Arquivos de ajuda:**
- [ERRO_SQL_DEPLOY.md](ERRO_SQL_DEPLOY.md) - Guia completo
- [FIX_CREATE_MEMBER_ERROR.md](FIX_CREATE_MEMBER_ERROR.md) - Guia rápido
- [DEPLOY_FUNCTION.md](DEPLOY_FUNCTION.md) - Documentação técnica

