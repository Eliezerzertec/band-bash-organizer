-- ============================================
-- SETUP COMPLETO: PROFILES COM TODAS AS PERMISSÕES
-- ============================================

-- 1. REMOVER TODAS as policies antigas
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their churches" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- 2. HABILITAR RLS NA TABELA
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLICIES CORRETAS PARA O FORMULÁRIO

-- ✅ POLICY 1: INSERT - Permite qualquer autenticado inserir novo membro
-- (Seguro porque formulário de criar membro é só para admins)
CREATE POLICY "authenticated_can_insert_profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ✅ POLICY 2: SELECT - Permite ver perfis da sua chiesa
CREATE POLICY "view_profiles_in_church"
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

-- ✅ POLICY 3: UPDATE - Permite editar próprio perfil
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ✅ POLICY 4: DELETE - Permite deletar próprio perfil
CREATE POLICY "users_delete_own_profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ✅ POLICY 5: SERVICE ROLE - Sistema pode fazer tudo
CREATE POLICY "service_role_all_access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. VERIFICAR QUE TUDO FOI CRIADO
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
