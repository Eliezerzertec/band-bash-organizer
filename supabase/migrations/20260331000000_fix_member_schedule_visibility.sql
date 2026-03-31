-- =============================================
-- FIX: Permitir que membros vejam suas próprias escalas
-- mesmo sem user_roles (criados pelo admin sem church membership)
-- =============================================

-- 1. Corrigir RLS de schedule_assignments
--    Membro pode ver seu próprio assignment OU estar na mesma igreja
DROP POLICY IF EXISTS "Members can view assignments" ON public.schedule_assignments;
CREATE POLICY "Members can view assignments"
  ON public.schedule_assignments FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR public.is_church_member(public.get_church_id_for_schedule(schedule_id))
  );

-- 2. Corrigir RLS de schedules
--    Membro pode ver escala se for da mesma igreja OU se estiver escalado nela
DROP POLICY IF EXISTS "Members can view schedules" ON public.schedules;
CREATE POLICY "Members can view schedules"
  ON public.schedules FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(church_id)
    OR EXISTS (
      SELECT 1
      FROM public.schedule_assignments sa
      WHERE sa.schedule_id = id
        AND sa.profile_id = public.get_current_profile_id()
    )
  );

-- 3. Garantir que team_members também seja visível para o próprio membro
DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR public.is_church_member(public.get_church_id_for_team(team_id))
  );

-- 4. Garantir que teams sejam visíveis para membros das equipes
DROP POLICY IF EXISTS "Members can view teams" ON public.teams;
CREATE POLICY "Members can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(public.get_church_id_for_ministry(ministry_id))
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = id
        AND tm.profile_id = public.get_current_profile_id()
    )
  );

-- 5. Garantir que ministérios sejam visíveis para membros das equipes
DROP POLICY IF EXISTS "Members can view ministries" ON public.ministries;
CREATE POLICY "Members can view ministries"
  ON public.ministries FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(church_id)
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.team_members tm ON tm.team_id = t.id
      WHERE t.ministry_id = id
        AND tm.profile_id = public.get_current_profile_id()
    )
  );

-- 6. Garantir que mensagens broadcast sejam visíveis para todos os membros autenticados
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = public.get_current_profile_id()
    OR recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  );
