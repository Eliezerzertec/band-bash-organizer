-- Hardening de mensagens: leitura segura, update controlado e indices para performance

-- 1) Funcao segura para marcar mensagem como lida (evita UPDATE amplo via cliente)
CREATE OR REPLACE FUNCTION public.mark_message_as_read(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile_id UUID;
  updated_count INTEGER := 0;
BEGIN
  current_profile_id := public.get_current_profile_id();

  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil autenticado não encontrado';
  END IF;

  UPDATE public.messages m
  SET read_at = COALESCE(m.read_at, now())
  WHERE m.id = p_message_id
    AND (
      m.recipient_id = current_profile_id
      OR (m.is_broadcast = true AND public.is_church_member(m.church_id))
      OR (
        m.recipient_team_id IS NOT NULL AND EXISTS (
          SELECT 1
          FROM public.team_members tm
          WHERE tm.team_id = m.recipient_team_id
            AND tm.profile_id = current_profile_id
        )
      )
      OR public.is_church_admin(m.church_id)
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_message_as_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_as_read(UUID) TO authenticated;

-- 2) Restringe UPDATE direto em mensagens (forca uso da RPC)
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;

-- 2.1) Garante que apenas admins da igreja possam apagar mensagens
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- 3) Indices para queries de inbox e contador de nao lidas
CREATE INDEX IF NOT EXISTS idx_messages_unread_recipient_created
  ON public.messages (recipient_id, created_at DESC)
  WHERE read_at IS NULL AND recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_unread_broadcast_church_created
  ON public.messages (church_id, created_at DESC)
  WHERE read_at IS NULL AND is_broadcast = true;

CREATE INDEX IF NOT EXISTS idx_messages_unread_team_created
  ON public.messages (recipient_team_id, created_at DESC)
  WHERE read_at IS NULL AND recipient_team_id IS NOT NULL;
