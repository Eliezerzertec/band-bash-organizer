-- =============================================
-- FIX: Allow creating churches for authenticated users
-- Created: 2026-01-20
-- Purpose: Fix RLS policy that was preventing church creation
-- =============================================

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Admins can insert churches" ON public.churches;

-- Create new policy that allows authenticated users to insert churches
CREATE POLICY "Authenticated users can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Alternative: Also add service_role bypass
CREATE POLICY "Service role can manage churches"
  ON public.churches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
