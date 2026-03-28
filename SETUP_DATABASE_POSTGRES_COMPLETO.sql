-- ============================================================
-- SETUP COMPLETO POSTGRESQL / SUPABASE
-- Projeto: Band Bash Organizer
-- Data: 2026-03-28
-- ============================================================
-- Este arquivo consolida tabelas, tipos, funcoes, triggers,
-- RLS policies e permissoes (grants) em um unico script.

-- ------------------------------------------------------------
-- EXTENSOES NECESSARIAS
-- ------------------------------------------------------------
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  EXCEPTION
    WHEN undefined_file THEN
      RAISE NOTICE 'Extensao pgcrypto nao disponivel neste servidor. Usando fallback de UUID.';
  END;

  BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  EXCEPTION
    WHEN undefined_file THEN
      RAISE NOTICE 'Extensao uuid-ossp nao disponivel neste servidor. Usando fallback de UUID.';
  END;
END
$$;

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'member');
  END IF;
END
$$;

-- ------------------------------------------------------------
-- UUID HELPER (funciona com ou sem extensoes)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_generate_uuid()
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_uuid UUID;
BEGIN
  IF to_regprocedure('gen_random_uuid()') IS NOT NULL THEN
    EXECUTE 'SELECT gen_random_uuid()' INTO v_uuid;
    RETURN v_uuid;
  END IF;

  IF to_regprocedure('uuid_generate_v4()') IS NOT NULL THEN
    EXECUTE 'SELECT uuid_generate_v4()' INTO v_uuid;
    RETURN v_uuid;
  END IF;

  -- Fallback sem extensao
  RETURN (
    substr(md5(random()::text || clock_timestamp()::text), 1, 8) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
    '4' || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr('89ab', (floor(random() * 4)::int + 1), 1) || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 12)
  )::uuid;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'substitution_status') THEN
    CREATE TYPE public.substitution_status AS ENUM ('pending', 'accepted', 'rejected');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status') THEN
    CREATE TYPE public.member_status AS ENUM ('active', 'inactive');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_criteria') THEN
    CREATE TYPE public.evaluation_criteria AS ENUM (
      'frequency',
      'commitment',
      'substitution_requests',
      'agenda_blocks',
      'other'
    );
  END IF;
END
$$;

-- ------------------------------------------------------------
-- TABELAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.churches (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  logo_url TEXT,
  pastor_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  musical_skills TEXT[] DEFAULT '{}',
  status public.member_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, church_id)
);

CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  schedule_type VARCHAR(20) NOT NULL DEFAULT 'normal',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_assignments (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role_assigned TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.substitution_requests (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  schedule_assignment_id UUID REFERENCES public.schedule_assignments(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  substitute_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  status public.substitution_status NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  subject TEXT,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.member_scores (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER DEFAULT 500 NOT NULL CHECK (score >= 10 AND score <= 1000),
  frequency_score INTEGER DEFAULT 500,
  commitment_score INTEGER DEFAULT 500,
  substitution_score INTEGER DEFAULT 500,
  agenda_block_score INTEGER DEFAULT 500,
  total_substitutions_requested INTEGER DEFAULT 0,
  total_agenda_blocks INTEGER DEFAULT 0,
  last_evaluation_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.member_evaluations (
  id UUID PRIMARY KEY DEFAULT public.app_generate_uuid(),
  member_score_id UUID REFERENCES public.member_scores(id) ON DELETE CASCADE NOT NULL,
  criterion public.evaluation_criteria NOT NULL,
  previous_score INTEGER,
  new_score INTEGER NOT NULL,
  reason TEXT,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ajustes de colunas para bancos ja existentes
ALTER TABLE public.churches ADD COLUMN IF NOT EXISTS pastor_name VARCHAR(100);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue';
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS schedule_type VARCHAR(20) DEFAULT 'normal' NOT NULL;

-- Comentarios
COMMENT ON COLUMN public.churches.pastor_name IS 'Nome do pastor responsavel pela igreja';
COMMENT ON COLUMN public.teams.color IS 'Identificador de cor da equipe: blue, red, green, purple, orange, pink, indigo, cyan';
COMMENT ON COLUMN public.schedules.schedule_type IS 'Tipo de escala: normal ou especial';

-- ------------------------------------------------------------
-- INDICES
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_church_id ON public.user_roles(church_id);

CREATE INDEX IF NOT EXISTS idx_churches_pastor_name ON public.churches(pastor_name);

CREATE INDEX IF NOT EXISTS idx_ministries_church_id ON public.ministries(church_id);
CREATE INDEX IF NOT EXISTS idx_ministries_leader_id ON public.ministries(leader_id);

CREATE INDEX IF NOT EXISTS idx_teams_ministry_id ON public.teams(ministry_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON public.teams(leader_id);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);

CREATE INDEX IF NOT EXISTS idx_schedules_church_id ON public.schedules(church_id);
CREATE INDEX IF NOT EXISTS idx_schedules_ministry_id ON public.schedules(ministry_id);
CREATE INDEX IF NOT EXISTS idx_schedules_schedule_type ON public.schedules(schedule_type);

CREATE INDEX IF NOT EXISTS idx_schedule_assignments_schedule_id ON public.schedule_assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_profile_id ON public.schedule_assignments(profile_id);

CREATE INDEX IF NOT EXISTS idx_substitution_requests_requester_id ON public.substitution_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_substitution_requests_substitute_id ON public.substitution_requests(substitute_id);

CREATE INDEX IF NOT EXISTS idx_messages_church_id ON public.messages(church_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);

CREATE INDEX IF NOT EXISTS idx_member_scores_user_id ON public.member_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_member_scores_profile_id ON public.member_scores(profile_id);
CREATE INDEX IF NOT EXISTS idx_member_evaluations_member_score_id ON public.member_evaluations(member_score_id);

-- ------------------------------------------------------------
-- FUNCOES AUXILIARES DE SEGURANCA
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.has_role_in_church(p_church_id UUID, p_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND church_id = p_church_id
      AND role = p_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_church_admin(p_church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role_in_church(p_church_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_church_member(p_church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND church_id = p_church_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_church_id_for_ministry(p_ministry_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.ministries WHERE id = p_ministry_id
$$;

CREATE OR REPLACE FUNCTION public.get_church_id_for_team(p_team_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.church_id
  FROM public.teams t
  JOIN public.ministries m ON t.ministry_id = m.id
  WHERE t.id = p_team_id
$$;

CREATE OR REPLACE FUNCTION public.get_church_id_for_schedule(p_schedule_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.schedules WHERE id = p_schedule_id
$$;

CREATE OR REPLACE FUNCTION public.get_church_id_for_assignment(p_assignment_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.church_id
  FROM public.schedule_assignments sa
  JOIN public.schedules s ON sa.schedule_id = s.id
  WHERE sa.id = p_assignment_id
$$;

-- ------------------------------------------------------------
-- FUNCOES DE SUPORTE (TIMESTAMP, SIGNUP, LOGIN)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.auto_confirm_member_email()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_user_password(
  user_id UUID,
  new_password TEXT
)
RETURNS JSON AS $$
BEGIN
  IF LENGTH(new_password) < 6 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Password must be at least 6 characters'
    );
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_user_password_simple(
  user_id UUID,
  new_password TEXT
)
RETURNS TABLE(success boolean, message TEXT) AS $$
BEGIN
  IF LENGTH(new_password) < 6 THEN
    RETURN QUERY SELECT false::boolean, 'Password must be at least 6 characters'::TEXT;
    RETURN;
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = user_id;

  RETURN QUERY SELECT true::boolean, 'Password updated successfully'::TEXT;
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false::boolean, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------
-- TRIGGERS
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS update_churches_updated_at ON public.churches;
CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON public.schedules;
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_substitution_requests_updated_at ON public.substitution_requests;
CREATE TRIGGER update_substitution_requests_updated_at
  BEFORE UPDATE ON public.substitution_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_member_scores_updated_at ON public.member_scores;
CREATE TRIGGER update_member_scores_updated_at
  BEFORE UPDATE ON public.member_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS auto_confirm_member_email_trigger ON public.profiles;
CREATE TRIGGER auto_confirm_member_email_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_member_email();

-- ------------------------------------------------------------
-- AJUSTE AUTH (LOGIN SEM CONFIRMACAO DE EMAIL)
-- ------------------------------------------------------------
ALTER TABLE auth.users
  ALTER COLUMN email_confirmed_at DROP NOT NULL;

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL
  AND created_at > now() - interval '30 days';

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- LIMPEZA DE POLICIES LEGADAS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view their churches" ON public.churches;
DROP POLICY IF EXISTS "Admins can insert churches" ON public.churches;
DROP POLICY IF EXISTS "Authenticated users can insert churches" ON public.churches;
DROP POLICY IF EXISTS "Admins can update their churches" ON public.churches;
DROP POLICY IF EXISTS "Admins can delete their churches" ON public.churches;
DROP POLICY IF EXISTS "Service role can manage churches" ON public.churches;

DROP POLICY IF EXISTS "Users can view profiles in their churches" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "view_profiles_in_church" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_delete_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "service_role_delete_all" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_service_role_all" ON public.profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON public.profiles;

DROP POLICY IF EXISTS "Users can view roles in their churches" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

DROP POLICY IF EXISTS "Members can view ministries" ON public.ministries;
DROP POLICY IF EXISTS "Admins can insert ministries" ON public.ministries;
DROP POLICY IF EXISTS "Admins can update ministries" ON public.ministries;
DROP POLICY IF EXISTS "Admins can delete ministries" ON public.ministries;

DROP POLICY IF EXISTS "Members can view teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
DROP POLICY IF EXISTS "Admins can delete teams" ON public.teams;

DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can delete team members" ON public.team_members;

DROP POLICY IF EXISTS "Members can view schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;

DROP POLICY IF EXISTS "Members can view assignments" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Admins can insert assignments" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Admins can update assignments" ON public.schedule_assignments;
DROP POLICY IF EXISTS "Admins can delete assignments" ON public.schedule_assignments;

DROP POLICY IF EXISTS "Users can view related substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Members can create substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Users can update substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Admins can delete substitution requests" ON public.substitution_requests;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;

DROP POLICY IF EXISTS "Users can view own score" ON public.member_scores;
DROP POLICY IF EXISTS "Admins can view all scores" ON public.member_scores;
DROP POLICY IF EXISTS "Service role can manage scores" ON public.member_scores;

DROP POLICY IF EXISTS "Admins can view evaluations" ON public.member_evaluations;
DROP POLICY IF EXISTS "Service role can manage evaluations" ON public.member_evaluations;

-- ------------------------------------------------------------
-- POLICIES RLS - CHURCHES
-- ------------------------------------------------------------
CREATE POLICY "Members can view their churches"
  ON public.churches FOR SELECT
  TO authenticated
  USING (public.is_church_member(id));

CREATE POLICY "Authenticated users can insert churches"
  ON public.churches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update their churches"
  ON public.churches FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(id));

CREATE POLICY "Admins can delete their churches"
  ON public.churches FOR DELETE
  TO authenticated
  USING (public.is_church_admin(id));

CREATE POLICY "Service role can manage churches"
  ON public.churches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- POLICIES RLS - PROFILES
-- ------------------------------------------------------------
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

CREATE POLICY "authenticated_can_insert_profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_delete_own_profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "service_role_all_access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- POLICIES RLS - USER_ROLES
-- ------------------------------------------------------------
CREATE POLICY "Users can view roles in their churches"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_church_member(church_id));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(church_id) OR user_id = auth.uid());

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(church_id));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- ------------------------------------------------------------
-- POLICIES RLS - MINISTRIES
-- ------------------------------------------------------------
CREATE POLICY "Members can view ministries"
  ON public.ministries FOR SELECT
  TO authenticated
  USING (public.is_church_member(church_id));

CREATE POLICY "Admins can insert ministries"
  ON public.ministries FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(church_id));

CREATE POLICY "Admins can update ministries"
  ON public.ministries FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(church_id));

CREATE POLICY "Admins can delete ministries"
  ON public.ministries FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- ------------------------------------------------------------
-- POLICIES RLS - TEAMS
-- ------------------------------------------------------------
CREATE POLICY "Members can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (public.is_church_member(public.get_church_id_for_ministry(ministry_id)));

CREATE POLICY "Admins can insert teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(public.get_church_id_for_ministry(ministry_id)));

CREATE POLICY "Admins can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_ministry(ministry_id)));

CREATE POLICY "Admins can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_ministry(ministry_id)));

-- ------------------------------------------------------------
-- POLICIES RLS - TEAM_MEMBERS
-- ------------------------------------------------------------
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (public.is_church_member(public.get_church_id_for_team(team_id)));

CREATE POLICY "Admins can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(public.get_church_id_for_team(team_id)));

CREATE POLICY "Admins can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_team(team_id)));

CREATE POLICY "Admins can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_team(team_id)));

-- ------------------------------------------------------------
-- POLICIES RLS - SCHEDULES
-- ------------------------------------------------------------
CREATE POLICY "Members can view schedules"
  ON public.schedules FOR SELECT
  TO authenticated
  USING (public.is_church_member(church_id));

CREATE POLICY "Admins can insert schedules"
  ON public.schedules FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(church_id));

CREATE POLICY "Admins can update schedules"
  ON public.schedules FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(church_id));

CREATE POLICY "Admins can delete schedules"
  ON public.schedules FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- ------------------------------------------------------------
-- POLICIES RLS - SCHEDULE_ASSIGNMENTS
-- ------------------------------------------------------------
CREATE POLICY "Members can view assignments"
  ON public.schedule_assignments FOR SELECT
  TO authenticated
  USING (public.is_church_member(public.get_church_id_for_schedule(schedule_id)));

CREATE POLICY "Admins can insert assignments"
  ON public.schedule_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_church_admin(public.get_church_id_for_schedule(schedule_id)));

CREATE POLICY "Admins can update assignments"
  ON public.schedule_assignments FOR UPDATE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_schedule(schedule_id)));

CREATE POLICY "Admins can delete assignments"
  ON public.schedule_assignments FOR DELETE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_schedule(schedule_id)));

-- ------------------------------------------------------------
-- POLICIES RLS - SUBSTITUTION_REQUESTS
-- ------------------------------------------------------------
CREATE POLICY "Users can view related substitution requests"
  ON public.substitution_requests FOR SELECT
  TO authenticated
  USING (
    requester_id = public.get_current_profile_id() OR
    substitute_id = public.get_current_profile_id() OR
    public.is_church_admin(public.get_church_id_for_assignment(schedule_assignment_id))
  );

CREATE POLICY "Members can create substitution requests"
  ON public.substitution_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = public.get_current_profile_id());

CREATE POLICY "Users can update substitution requests"
  ON public.substitution_requests FOR UPDATE
  TO authenticated
  USING (
    requester_id = public.get_current_profile_id() OR
    substitute_id = public.get_current_profile_id() OR
    public.is_church_admin(public.get_church_id_for_assignment(schedule_assignment_id))
  );

CREATE POLICY "Admins can delete substitution requests"
  ON public.substitution_requests FOR DELETE
  TO authenticated
  USING (public.is_church_admin(public.get_church_id_for_assignment(schedule_assignment_id)));

-- ------------------------------------------------------------
-- POLICIES RLS - MESSAGES
-- ------------------------------------------------------------
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = public.get_current_profile_id() OR
    recipient_id = public.get_current_profile_id() OR
    (is_broadcast = true AND public.is_church_member(church_id)) OR
    (
      recipient_team_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    ) OR
    public.is_church_admin(church_id)
  );

CREATE POLICY "Admins can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = public.get_current_profile_id()
    AND public.is_church_admin(church_id)
  );

CREATE POLICY "Users can update message read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = public.get_current_profile_id());

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- ------------------------------------------------------------
-- POLICIES RLS - MEMBER SCORES
-- ------------------------------------------------------------
CREATE POLICY "Users can view own score"
  ON public.member_scores FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all scores"
  ON public.member_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage scores"
  ON public.member_scores FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- POLICIES RLS - MEMBER EVALUATIONS
-- ------------------------------------------------------------
CREATE POLICY "Admins can view evaluations"
  ON public.member_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Service role can manage evaluations"
  ON public.member_evaluations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ------------------------------------------------------------
-- PERMISSOES (GRANTS)
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_user_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_password_simple(UUID, TEXT) TO authenticated, anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO service_role;

-- ============================================================
-- FIM
-- ============================================================
