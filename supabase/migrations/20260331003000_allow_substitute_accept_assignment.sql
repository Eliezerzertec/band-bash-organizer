-- Permite que o substituto assuma a escala ao aceitar uma solicitacao pendente.
-- A regra e estrita: so pode atualizar o proprio profile_id para si mesmo.

DROP POLICY IF EXISTS "Substitutes can accept pending assignment" ON public.schedule_assignments;

CREATE POLICY "Substitutes can accept pending assignment"
  ON public.schedule_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.substitution_requests sr
      WHERE sr.schedule_assignment_id = schedule_assignments.id
        AND sr.status = 'pending'
        AND sr.substitute_id = public.get_current_profile_id()
    )
  )
  WITH CHECK (
    profile_id = public.get_current_profile_id()
  );
