-- =============================================
-- Alternative: Update user password directly
-- This works without complex RPC setup
-- Created: 2026-01-18
-- =============================================

CREATE OR REPLACE FUNCTION public.update_user_password_simple(
  user_id UUID,
  new_password TEXT
)
RETURNS TABLE(success boolean, message TEXT) AS $$
BEGIN
  -- Validate password length
  IF LENGTH(new_password) < 6 THEN
    RETURN QUERY SELECT false::boolean, 'Password must be at least 6 characters'::TEXT;
    RETURN;
  END IF;

  -- Update password in auth.users (this works with SECURITY DEFINER)
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  RETURN QUERY SELECT true::boolean, 'Password updated successfully'::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::boolean, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.update_user_password_simple(UUID, TEXT) TO authenticated, anon;
