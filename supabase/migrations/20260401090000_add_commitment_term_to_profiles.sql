-- Adiciona campos de termo de compromisso ao perfil do membro
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commitment_term_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commitment_term_accepted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS commitment_term_payload JSONB NULL;

COMMENT ON COLUMN public.profiles.commitment_term_accepted IS 'Indica se o membro aceitou o termo de compromisso do Ministerio de Louvor.';
COMMENT ON COLUMN public.profiles.commitment_term_accepted_at IS 'Data/hora em que o membro aceitou o termo no cadastro.';
COMMENT ON COLUMN public.profiles.commitment_term_payload IS 'Snapshot dos dados do termo (igreja, ministerio, funcao, etc.) para emissao de PDF.';
