-- Expor ministerios cadastrados no banco para a tela publica de cadastro de musicos
CREATE OR REPLACE FUNCTION public.list_signup_ministries()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  church_id UUID,
  church_name TEXT,
  church_address TEXT,
  church_contact TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.name,
    m.description,
    m.logo_url,
    m.church_id,
    c.name AS church_name,
    c.address AS church_address,
    c.contact AS church_contact
  FROM public.ministries m
  LEFT JOIN public.churches c ON c.id = m.church_id
  ORDER BY m.name;
$$;

REVOKE ALL ON FUNCTION public.list_signup_ministries() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_signup_ministries() TO anon, authenticated;
