-- Permitir cancelamento de pedido de substituicao por solicitante e administrador
-- Regra: somente pedidos pendentes podem ser cancelados

DROP POLICY IF EXISTS "Admins can delete substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Requesters can cancel pending substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Admins can cancel pending substitution requests" ON public.substitution_requests;

CREATE POLICY "Requesters can cancel pending substitution requests"
ON public.substitution_requests
FOR DELETE
TO authenticated
USING (
  requester_id = public.get_current_profile_id()
  AND status = 'pending'
);

CREATE POLICY "Admins can cancel pending substitution requests"
ON public.substitution_requests
FOR DELETE
TO authenticated
USING (
  public.is_church_admin(public.get_church_id_for_assignment(schedule_assignment_id))
  AND status = 'pending'
);
