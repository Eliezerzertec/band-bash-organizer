-- Garante que o substituto nao esteja escalado na mesma agenda
-- e que nao seja o mesmo membro da escala original.

CREATE OR REPLACE FUNCTION public.validate_substitution_request_substitute()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_schedule_id UUID;
  current_profile_id UUID;
BEGIN
  IF NEW.substitute_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT sa.schedule_id, sa.profile_id
    INTO target_schedule_id, current_profile_id
  FROM public.schedule_assignments sa
  WHERE sa.id = NEW.schedule_assignment_id;

  IF target_schedule_id IS NULL THEN
    RAISE EXCEPTION 'Escala de origem nao encontrada para substituicao.';
  END IF;

  IF NEW.substitute_id = current_profile_id THEN
    RAISE EXCEPTION 'O membro escalado nao pode substituir a si mesmo.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.schedule_assignments sa
    WHERE sa.schedule_id = target_schedule_id
      AND sa.profile_id = NEW.substitute_id
      AND sa.id <> NEW.schedule_assignment_id
  ) THEN
    RAISE EXCEPTION 'Este membro ja esta escalado na mesma agenda.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_substitution_request_substitute
  ON public.substitution_requests;

CREATE TRIGGER trg_validate_substitution_request_substitute
BEFORE INSERT OR UPDATE OF schedule_assignment_id, substitute_id
ON public.substitution_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_substitution_request_substitute();
