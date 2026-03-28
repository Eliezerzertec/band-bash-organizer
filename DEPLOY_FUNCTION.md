# Deploy da Edge Function - Criar Novo Membro

## ❌ Problema Atual

A funcionalidade de criar novo membro está pronta, mas **a Edge Function precisa ser deployada no Supabase**.

Erro atual: `Função 'create-user' não encontrada`

---

## ✅ Solução: Deploy Manual via Supabase Dashboard

### Passo 1: Acessar Supabase Dashboard
1. Abra https://app.supabase.com
2. Faça login com sua conta
3. Selecione o projeto `band-bash-organizer` (ID: `buavxdpzdckkhtzdggnq`)

### Passo 2: Navegar para Edge Functions
1. No menu esquerdo, clique em **Edge Functions**
2. Clique em **Create a new function**
3. Digite o nome: `create-user`
4. Clique em **Create**

### Passo 3: Copiar o Código da Função
1. Abra o arquivo: `supabase/functions/create-user/index.ts` (no seu VS Code)
2. Copie **TODO** o conteúdo do arquivo

### Passo 4: Colar no Supabase Dashboard
1. No editor da função no Supabase, selecione todo o código padrão (Ctrl+A)
2. Cole o código que você copiou (Ctrl+V)
3. Clique em **Deploy** no canto superior direito

### Passo 5: Configurar Environment Variables
1. Depois que a função for deployada, volte para a página da função
2. Clique em **Settings** (ícone de engrenagem)
3. Vá até **Edge Function settings**
4. Em **Environment variables**, adicione:
   - **Chave**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Valor**: Copie de **Project Settings > API Keys > service_role key**

### Passo 6: Salvar e Testar
1. Clique em **Save**
2. Volte para a aplicação React
3. Vá em **Members** > **Novo Membro**
4. Teste criando um novo membro

---

## 📺 Teste da Funcionalidade

1. Clique em **Members** no menu
2. Clique em **Novo Membro**
3. Preencha os campos:
   - **Nome**: João Silva
   - **Email**: joao@example.com
   - **Telefone**: (11) 99999-9999
   - **Senha**: SenhaSegura123

4. Clique em **Criar membro**

**Se funcionar**:
- ✅ Mostrará toast: "Membro criado com sucesso!"
- ✅ O novo membro aparecerá na lista

**Se houver erro**:
- Verifique se a Edge Function foi deployada
- Verifique se a `SUPABASE_SERVICE_ROLE_KEY` está configurada corretamente
- Verifique o browser console (F12) para mais detalhes

---

## 🛠️ Alternativa: Deploy via CLI (Requer Token)

Se preferir fazer deploy via linha de comando:

```bash
# 1. Fazer login no Supabase CLI
npx supabase login

# 2. Deploy da função
cd d:\DESENVOLVIMENTO APP WEB\Nova pasta\Louvor_Novo_2026\band-bash-organizer
npx supabase functions deploy create-user --project-ref buavxdpzdckkhtzdggnq
```

---

## 📝 Resumo Técnico

- **Tipo**: Edge Function (Serverless Deno)
- **Linguagem**: TypeScript/Deno
- **Operação**: Cria novo usuário auth + perfil na base de dados
- **Autenticação**: Usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de auth
- **Input**: `{ email, password, name, phone }`
- **Output**: `{ user_id }`

---

## ⚠️ Notas de Segurança

- Nunca compartilhe a `SUPABASE_SERVICE_ROLE_KEY` publicamente
- A função only aceita requests do seu projeto Supabase
- Apenas admins podem chamar essa função (validado no frontend)

