-- =============================================
-- ADD DELETE POLICY FOR PROFILES TABLE
-- Execute this in Supabase SQL Editor
-- =============================================

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "allow_delete_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_delete_all" ON public.profiles;

-- Allow authenticated users to delete their own profile
CREATE POLICY "allow_delete_own_profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Also allow service_role to delete any profile
CREATE POLICY "service_role_delete_all"
ON public.profiles
FOR DELETE
USING (auth.role() = 'service_role');

-- Verify policies
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;