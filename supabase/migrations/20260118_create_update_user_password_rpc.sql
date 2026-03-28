-- =============================================
-- RPC Function: Update user password (server-side)
-- Created: 2026-01-18
-- Purpose: Safely update member password via RPC
-- =============================================

CREATE OR REPLACE FUNCTION public.update_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Validate password length
  IF LENGTH(new_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 6 characters'
    );
  END IF;

  -- Update the user password in auth.users table
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Password updated successfully'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_password(UUID, TEXT) TO authenticated;
