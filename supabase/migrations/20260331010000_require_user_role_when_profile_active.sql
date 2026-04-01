-- Garante que perfis ativos tenham vínculo em user_roles
-- Evita ativação de membro sem vínculo de igreja/role

CREATE OR REPLACE FUNCTION public.ensure_active_profile_has_user_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF NEW.user_id IS NULL THEN
      RAISE EXCEPTION 'Perfil ativo sem user_id não é permitido';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = NEW.user_id
        AND ur.role IN ('member', 'admin')
    ) THEN
      RAISE EXCEPTION 'Não é permitido ativar perfil sem vínculo em user_roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_active_profile_has_user_role ON public.profiles;

CREATE TRIGGER trg_ensure_active_profile_has_user_role
BEFORE INSERT OR UPDATE OF status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_active_profile_has_user_role();
