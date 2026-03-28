-- ============================================
-- ADD MISSING INSERT POLICY FOR PROFILES
-- Execute this in Supabase SQL Editor
-- ============================================

-- Add INSERT policy that was missing from migration
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also add service role full access
CREATE POLICY "Service role has full access"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Verify policies
SELECT policyname, permissive, roles FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;