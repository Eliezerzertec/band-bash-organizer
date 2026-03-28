# Erro ao Criar Escala - Solução

## Problema

Erro: `Could not find the 'schedule_type' column of 'schedules' in the schema cache`

## Causa

A migration que adiciona o campo `schedule_type` na tabela `schedules` não foi aplicada ao banco de dados.

## Solução Rápida (FIZ AGORA)

Removi temporariamente o envio do campo `schedule_type` do formulário, para que as escalas possam ser criadas normalmente.

## Próximo Passo (Aplicar a Migration)

1. Abra o **Supabase Dashboard** (https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Copie e cole o código de `APPLY_MIGRATION_MANUALLY.sql`:

```sql
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'normal' NOT NULL;
```

4. Clique em "Run"
5. Pronto! O campo será criado

## Função do Campo

- Tipo de chamado: **Normal** ou **Especial**
- Será usado para diferenciar tipos de escalas
- O valor padrão é sempre 'normal'

## Status Atual

✅ Escalas podem ser criadas normalmente
✅ Formulário continua validando o tipo
⏳ Campo `schedule_type` será enviado após a migration ser aplicada

## Verificar se Funcionou

Depois de aplicar a migration no Supabase, você pode:

1. Recarregar a aplicação
2. Clicar em "Nova Escala"
3. Preencher os dados normalmente
4. Clicar em "Criar"

Pronto! A escala será salva com o tipo de chamado.
