-- Adiciona status 'pending_approval' ao enum member_status
-- Membros que se cadastram via /cadastro-musico ficam pendentes até admin ativar

ALTER TYPE member_status ADD VALUE IF NOT EXISTS 'pending_approval';
