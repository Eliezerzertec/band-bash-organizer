-- Add missing RLS policies for profiles INSERT

-- 1. Tentar deletar policies antigas se existirem (para limpar)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END
$$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END
$$;

-- 2. Criar policies novas
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Verificar policies criadas
SELECT tablename, policyname, permissive, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
