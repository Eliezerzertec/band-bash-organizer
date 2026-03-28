# ERRO: Função 'create-user' não encontrada

## ⚡ Solução Rápida (3 minutos)

### 1️⃣ Acesse Supabase
Abra: https://app.supabase.com

### 2️⃣ Edge Functions
- Clique em **Edge Functions** (menu esquerdo)
- Clique em **Create a new function**
- Digite nome: `create-user`
- Clique em **Create**

### 3️⃣ Copie o Código
Abra em VS Code: `supabase/functions/create-user/index.ts`

Copie TODO o conteúdo (Ctrl+A → Ctrl+C)

### 4️⃣ Cole no Supabase
- Selecione todo código na função (Ctrl+A)
- Cole (Ctrl+V)
- Clique em **Deploy** (canto superior)

### 5️⃣ Configure Variáveis
- Clique em **Settings** (engrenagem)
- Em **Environment variables**, adicione:
  - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
  - **Value**: Copie de Project Settings > API Keys > service_role key
- Clique em **Save**

### 6️⃣ Teste
- Volte para Members > Novo Membro
- Preencha e clique em "Criar membro"

✅ Pronto!

---

## 📚 Arquivo Completo de Instruções
Ver: `DEPLOY_FUNCTION.md`
