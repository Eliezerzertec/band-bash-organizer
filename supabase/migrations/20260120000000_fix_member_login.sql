-- =============================================
-- FIX: Allow member login without email verification
-- Created: 2026-01-20
-- Problem: Members couldn't login because email wasn't confirmed
-- Solution: Auto-confirm emails and disable email verification requirement
-- =============================================

-- 1. Update auth schema to allow unconfirmed emails to login
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at DROP NOT NULL;

-- 2. Allow users to sign in before email confirmation
-- This is done through Supabase Auth settings (in dashboard), but we can 
-- also set a default confirmation time if the user created an account via admin

-- 3. For existing unconfirmed emails, mark them as confirmed
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL
AND created_at > now() - interval '30 days';

-- 4. Create a function to auto-confirm new members during creation
CREATE OR REPLACE FUNCTION public.auto_confirm_member_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm email for new auth users created by admin
  UPDATE auth.users
  SET email_confirmed_at = now(),
      raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{provider}',
        '"email"'::jsonb
      )
  WHERE id = NEW.user_id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to auto-confirm when profile is created
DROP TRIGGER IF EXISTS "auto_confirm_member_email_trigger" ON public.profiles;
CREATE TRIGGER "auto_confirm_member_email_trigger"
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_member_email();

-- =============================================
-- Notes:
-- - Members created via Edge Function will have confirmed emails
-- - The trigger ensures auto-confirmation on profile creation
-- - This allows immediate login after member creation
-- =============================================
