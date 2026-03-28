# ❌ Erro ao fazer Deploy da Edge Function

## Problema
```
Error: Failed to run sql query: ERROR: 42601: syntax error at or near "//" LINE 1: // @ts-nocheck
```

## 🔍 Causa
O Supabase está tentando executar o arquivo TypeScript como SQL. Isso significa:
- ❌ O arquivo pode ter sido copiado para um lugar errado
- ❌ Ou foi criado como SQL Function em vez de Edge Function

## ✅ Solução: Usar o Supabase Dashboard

### Passo 1: Abra o Dashboard
https://app.supabase.com → Selecione seu projeto

### Passo 2: Navegue para Edge Functions
Menu esquerdo → **Edge Functions** → **Create a new function**

### Passo 3: Digite o Nome
- Nome: `create-user`
- Clique em **Create**

### Passo 4: IMPORTANTE - Remova o Código Padrão
Supabase cria uma função padrão. **Delete tudo** e deixe em branco.

### Passo 5: Cole o Código Correto
Abra em VS Code: `supabase/functions/create-user/index.ts`

Copie o código inteiro (Ctrl+A → Ctrl+C)

Cole no editor do Supabase Dashboard (Ctrl+V)

### Passo 6: Deploy
Clique em **Deploy** (canto superior direito)

Aguarde até ver: ✅ Function deployed successfully

### Passo 7: Configure Variáveis de Ambiente
1. Na página da função, clique em **Settings** (ícone ⚙️)
2. Role até "Environment Variables"
3. Clique em **Add new environment variable**
4. Configure:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Copie de **Project Settings > API Keys > service_role key**
5. Clique em **Save**

## 🧪 Teste
1. Volte para a aplicação
2. Vá em **Members** → **Novo Membro**
3. Preencha os dados
4. Clique em **Criar membro**

Se funcionar: ✅ Toast verde dizendo "Membro criado com sucesso!"

Se não funcionar:
- Abra o console do navegador (F12)
- Veja a mensagem de erro
- Coloque print aqui

---

## 📋 Checklist

- [ ] Edge Function criada no Dashboard (NÃO em SQL Functions)
- [ ] Código TypeScript/Deno colado corretamente
- [ ] Deploy executado (viu mensagem de sucesso)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada em Settings
- [ ] Testado criar um novo membro

---

## ⚠️ Notas Importantes

1. **Não confunda**:
   - ❌ SQL Functions (diferente)
   - ✅ Edge Functions (isso é o que você precisa)

2. **Código não pode ter erros**:
   - Se houver erro no código TypeScript, o Deploy falhará
   - O código fornecido está correto, então copie exatamente

3. **Service Role Key**:
   - Está em: Project Settings → API Keys → service_role (🔑 com fundo azul)
   - **Nunca** compartilhe essa chave publicamente

