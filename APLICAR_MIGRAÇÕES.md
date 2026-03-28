# Aplicar Migrações de Senha no Supabase

## Opção 1: Supabase Dashboard (Recomendado)

1. Acesse o **Supabase Dashboard**: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Clique em **+ New Query**
5. Copie o conteúdo de AMBOS os arquivos:
   - `supabase/migrations/20260118_create_update_user_password_rpc.sql`
   - `supabase/migrations/20260118_update_user_password_simple.sql`
6. Cole no editor e execute (**Ctrl + Enter**)

## Opção 2: Supabase CLI (Local)

Se tiver Docker instalado e Supabase CLI:

```bash
# No terminal, na raiz do projeto
supabase db push
```

## Opção 3: Verificar se as funções existem

No Supabase Dashboard → SQL Editor, execute:

```sql
SELECT 
  routines.routine_name,
  parameters.parameter_name
FROM information_schema.routines
LEFT JOIN information_schema.parameters 
  ON routines.specific_name = parameters.specific_name
WHERE routines.routine_schema = 'public'
  AND routines.routine_name LIKE 'update_user_password%'
ORDER BY routines.routine_name;
```

Se retornar 0 linhas, execute as migrações.

## Solução de Problemas

### Erro: "function update_user_password_simple does not exist"
- Significa que as migrações SQL não foram aplicadas ao banco
- Execute a migração conforme instruções acima

### Erro: "Erro desconhecido" ao editar
- Verifique os logs do navegador (F12 → Console)
- Certifique-se de que as funções RPC foram criadas

### Tudo está funcionando?
- Edite um membro
- Deixe a senha em branco → deve atualizar perfil ✅
- Preencha a senha → deve atualizar perfil E senha ✅
