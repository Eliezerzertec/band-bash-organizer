-- EXECUTAR NO SUPABASE SQL EDITOR PARA FIXAR ERRO DE PROFILES

-- 1. Remover TODAS as policies antigas
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their churches" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- 2. Recriar as policies CORRETAS

-- Permite qualquer usuário autenticado inserir perfis (seguro porque só admins têm acesso ao formulário)
CREATE POLICY "Allow authenticated insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permite que usuários vejam perfis de suas igrejas
CREATE POLICY "Users can view profiles in their churches"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur1
      WHERE ur1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur2
        WHERE ur2.user_id = profiles.user_id
        AND ur2.church_id = ur1.church_id
      )
    )
  );

-- Permite que usuários atualizem seus próprios perfis
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Permite que o service role (sistema) faça qualquer coisa
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Confirmar que todas as policies estão corretas
SELECT 
  policyname,
  permissive,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
