-- SOLUÇÃO IMEDIATA: Copiar e colar este SQL no Supabase SQL Editor
-- Para evitar o erro "Could not find the 'schedule_type' column"

-- 1. Primeiro, remova o campo se ele existir (em caso de erro anterior)
-- ALTER TABLE schedules DROP COLUMN IF EXISTS schedule_type;

-- 2. Adicionar a coluna schedule_type
ALTER TABLE schedules
ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'normal' NOT NULL;

-- Pronto! Agora as escalas podem ser criadas com sucesso.
