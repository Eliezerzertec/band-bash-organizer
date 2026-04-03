-- =============================================================================
-- message_reads: rastreamento individual de leitura por perfil
-- Resolve o bug onde marcar uma mensagem broadcast como lida
-- escondia a mensagem para todos os outros membros.
-- =============================================================================

-- 1) Tabela de leituras individuais
CREATE TABLE IF NOT EXISTS public.message_reads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID        NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, profile_id)
);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Membro vê só suas próprias leituras; admin vê todas da sua igreja
CREATE POLICY "Users can view own reads"
  ON public.message_reads FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND public.is_church_admin(m.church_id)
    )
  );

-- Membro só registra leitura para si mesmo
CREATE POLICY "Users can insert own read"
  ON public.message_reads FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE INDEX IF NOT EXISTS idx_message_reads_message_id
  ON public.message_reads (message_id);

CREATE INDEX IF NOT EXISTS idx_message_reads_profile_id
  ON public.message_reads (profile_id);

-- 2) Migra leituras já existentes (mensagens diretas com read_at preenchido)
INSERT INTO public.message_reads (message_id, profile_id, read_at)
SELECT m.id, m.recipient_id, m.read_at
FROM   public.messages m
WHERE  m.read_at     IS NOT NULL
  AND  m.recipient_id IS NOT NULL
ON CONFLICT (message_id, profile_id) DO NOTHING;

-- 3) Substitui mark_message_as_read para usar message_reads
--    (não toca mais em messages.read_at, evitando ocultar mensagem para todos)
CREATE OR REPLACE FUNCTION public.mark_message_as_read(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile_id UUID;
  v_visible          BOOLEAN := false;
BEGIN
  current_profile_id := public.get_current_profile_id();

  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil autenticado não encontrado';
  END IF;

  -- Verifica se a mensagem é visível para o usuário atual
  SELECT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE  m.id = p_message_id
      AND (
        m.recipient_id = current_profile_id
        OR (m.is_broadcast = true AND public.is_church_member(m.church_id))
        OR (
          m.recipient_team_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE  tm.team_id   = m.recipient_team_id
              AND  tm.profile_id = current_profile_id
          )
        )
        OR public.is_church_admin(m.church_id)
      )
  ) INTO v_visible;

  IF NOT v_visible THEN
    RETURN false;
  END IF;

  INSERT INTO public.message_reads (message_id, profile_id, read_at)
  VALUES (p_message_id, current_profile_id, now())
  ON CONFLICT (message_id, profile_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL   ON FUNCTION public.mark_message_as_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_as_read(UUID) TO authenticated;

-- 4) Função de limpeza: apaga mensagens com mais de 10 dias (chame manualmente
--    ou via pg_cron: SELECT cron.schedule('0 3 * * *', 'SELECT purge_old_messages()'))
CREATE OR REPLACE FUNCTION public.purge_old_messages()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.messages
  WHERE created_at < (now() - INTERVAL '10 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL   ON FUNCTION public.purge_old_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_messages() TO authenticated;

-- 5) Index adicional para queries de histórico dos últimos 10 dias
CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages (created_at DESC);
