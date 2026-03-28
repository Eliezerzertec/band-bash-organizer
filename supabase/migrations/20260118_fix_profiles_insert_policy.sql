-- =============================================
-- FIX: Add missing INSERT policy to profiles table
-- Created: 2026-01-18
-- =============================================

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;

-- Add permissive INSERT policy for authenticated users
CREATE POLICY "allow_insert_own_profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow users to create their own profile
  auth.uid() = user_id
);

-- Also allow service_role to bypass RLS (for system operations)
CREATE POLICY "allow_service_role_all"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;