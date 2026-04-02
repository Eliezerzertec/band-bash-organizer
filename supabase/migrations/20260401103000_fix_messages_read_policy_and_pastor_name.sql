-- Garante coluna pastor_name em ambientes onde migracoes antigas nao foram aplicadas corretamente
ALTER TABLE public.churches
  ADD COLUMN IF NOT EXISTS pastor_name TEXT;

-- Permite marcar como lidas mensagens de destinatario direto, broadcast e equipe
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;
CREATE POLICY "Users can update message read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  )
  WITH CHECK (
    recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  );
