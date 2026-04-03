-- DATABASE EXPORT PARA VPS
-- Gerado em 2026-04-02
-- Inclui: base completa + migracoes recentes


-- ============================================================================
-- [BASE] SETUP_DATABASE_POSTGRES_COMPLETO.sql
-- ============================================================================

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



-- ============================================================================
-- [MIGRATION] 20260331000000_fix_member_schedule_visibility.sql
-- ============================================================================

-- =============================================
-- FIX: Permitir que membros vejam suas próprias escalas
-- mesmo sem user_roles (criados pelo admin sem church membership)
-- =============================================

-- 1. Corrigir RLS de schedule_assignments
--    Membro pode ver seu próprio assignment OU estar na mesma igreja
DROP POLICY IF EXISTS "Members can view assignments" ON public.schedule_assignments;
CREATE POLICY "Members can view assignments"
  ON public.schedule_assignments FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR public.is_church_member(public.get_church_id_for_schedule(schedule_id))
  );

-- 2. Corrigir RLS de schedules
--    Membro pode ver escala se for da mesma igreja OU se estiver escalado nela
DROP POLICY IF EXISTS "Members can view schedules" ON public.schedules;
CREATE POLICY "Members can view schedules"
  ON public.schedules FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(church_id)
    OR EXISTS (
      SELECT 1
      FROM public.schedule_assignments sa
      WHERE sa.schedule_id = id
        AND sa.profile_id = public.get_current_profile_id()
    )
  );

-- 3. Garantir que team_members também seja visível para o próprio membro
DROP POLICY IF EXISTS "Members can view team members" ON public.team_members;
CREATE POLICY "Members can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR public.is_church_member(public.get_church_id_for_team(team_id))
  );

-- 4. Garantir que teams sejam visíveis para membros das equipes
DROP POLICY IF EXISTS "Members can view teams" ON public.teams;
CREATE POLICY "Members can view teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(public.get_church_id_for_ministry(ministry_id))
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = id
        AND tm.profile_id = public.get_current_profile_id()
    )
  );

-- 5. Garantir que ministérios sejam visíveis para membros das equipes
DROP POLICY IF EXISTS "Members can view ministries" ON public.ministries;
CREATE POLICY "Members can view ministries"
  ON public.ministries FOR SELECT
  TO authenticated
  USING (
    public.is_church_member(church_id)
    OR EXISTS (
      SELECT 1
      FROM public.teams t
      JOIN public.team_members tm ON tm.team_id = t.id
      WHERE t.ministry_id = id
        AND tm.profile_id = public.get_current_profile_id()
    )
  );

-- 6. Garantir que mensagens broadcast sejam visíveis para todos os membros autenticados
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = public.get_current_profile_id()
    OR recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  );



-- ============================================================================
-- [MIGRATION] 20260331003000_allow_substitute_accept_assignment.sql
-- ============================================================================

-- Permite que o substituto assuma a escala ao aceitar uma solicitacao pendente.
-- A regra e estrita: so pode atualizar o proprio profile_id para si mesmo.

DROP POLICY IF EXISTS "Substitutes can accept pending assignment" ON public.schedule_assignments;

CREATE POLICY "Substitutes can accept pending assignment"
  ON public.schedule_assignments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.substitution_requests sr
      WHERE sr.schedule_assignment_id = schedule_assignments.id
        AND sr.status = 'pending'
        AND sr.substitute_id = public.get_current_profile_id()
    )
  )
  WITH CHECK (
    profile_id = public.get_current_profile_id()
  );



-- ============================================================================
-- [MIGRATION] 20260331004000_prevent_invalid_substitutes.sql
-- ============================================================================

-- Garante que o substituto nao esteja escalado na mesma agenda
-- e que nao seja o mesmo membro da escala original.

CREATE OR REPLACE FUNCTION public.validate_substitution_request_substitute()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_schedule_id UUID;
  current_profile_id UUID;
BEGIN
  IF NEW.substitute_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT sa.schedule_id, sa.profile_id
    INTO target_schedule_id, current_profile_id
  FROM public.schedule_assignments sa
  WHERE sa.id = NEW.schedule_assignment_id;

  IF target_schedule_id IS NULL THEN
    RAISE EXCEPTION 'Escala de origem nao encontrada para substituicao.';
  END IF;

  IF NEW.substitute_id = current_profile_id THEN
    RAISE EXCEPTION 'O membro escalado nao pode substituir a si mesmo.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.schedule_assignments sa
    WHERE sa.schedule_id = target_schedule_id
      AND sa.profile_id = NEW.substitute_id
      AND sa.id <> NEW.schedule_assignment_id
  ) THEN
    RAISE EXCEPTION 'Este membro ja esta escalado na mesma agenda.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_substitution_request_substitute
  ON public.substitution_requests;

CREATE TRIGGER trg_validate_substitution_request_substitute
BEFORE INSERT OR UPDATE OF schedule_assignment_id, substitute_id
ON public.substitution_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_substitution_request_substitute();



-- ============================================================================
-- [MIGRATION] 20260331005000_allow_requester_cancel_substitution.sql
-- ============================================================================

-- Permitir cancelamento de pedido de substituicao por solicitante e administrador
-- Regra: somente pedidos pendentes podem ser cancelados

DROP POLICY IF EXISTS "Admins can delete substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Requesters can cancel pending substitution requests" ON public.substitution_requests;
DROP POLICY IF EXISTS "Admins can cancel pending substitution requests" ON public.substitution_requests;

CREATE POLICY "Requesters can cancel pending substitution requests"
ON public.substitution_requests
FOR DELETE
TO authenticated
USING (
  requester_id = public.get_current_profile_id()
  AND status = 'pending'
);

CREATE POLICY "Admins can cancel pending substitution requests"
ON public.substitution_requests
FOR DELETE
TO authenticated
USING (
  public.is_church_admin(public.get_church_id_for_assignment(schedule_assignment_id))
  AND status = 'pending'
);



-- ============================================================================
-- [MIGRATION] 20260331006000_peer_evaluations.sql
-- ============================================================================

-- Tabela de avaliações entre pares (membros avaliam colegas)
CREATE TABLE IF NOT EXISTS peer_evaluations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  evaluated_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  church_id           UUID REFERENCES churches(id) ON DELETE CASCADE,

  -- Critérios: 1 a 5 estrelas
  musicality          SMALLINT NOT NULL CHECK (musicality BETWEEN 1 AND 5),
  punctuality         SMALLINT NOT NULL CHECK (punctuality BETWEEN 1 AND 5),
  music_preparation   SMALLINT NOT NULL CHECK (music_preparation BETWEEN 1 AND 5),
  group_behavior      SMALLINT NOT NULL CHECK (group_behavior BETWEEN 1 AND 5),
  temperament         SMALLINT NOT NULL CHECK (temperament BETWEEN 1 AND 5),
  group_contribution  SMALLINT NOT NULL CHECK (group_contribution BETWEEN 1 AND 5),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Um membro avalia cada colega apenas uma vez (pode atualizar)
  CONSTRAINT uq_peer_eval UNIQUE (evaluator_id, evaluated_id)
);

-- Índices para consultas de agregação
CREATE INDEX IF NOT EXISTS idx_peer_eval_evaluated ON peer_evaluations (evaluated_id);
CREATE INDEX IF NOT EXISTS idx_peer_eval_evaluator ON peer_evaluations (evaluator_id);
CREATE INDEX IF NOT EXISTS idx_peer_eval_church    ON peer_evaluations (church_id);

-- View que calcula a média por critério e o escore geral de cada membro avaliado
CREATE OR REPLACE VIEW peer_evaluation_scores AS
SELECT
  evaluated_id                                    AS profile_id,
  COUNT(*)                                        AS total_evaluators,
  ROUND(AVG(musicality)::numeric, 2)              AS avg_musicality,
  ROUND(AVG(punctuality)::numeric, 2)             AS avg_punctuality,
  ROUND(AVG(music_preparation)::numeric, 2)       AS avg_music_preparation,
  ROUND(AVG(group_behavior)::numeric, 2)          AS avg_group_behavior,
  ROUND(AVG(temperament)::numeric, 2)             AS avg_temperament,
  ROUND(AVG(group_contribution)::numeric, 2)      AS avg_group_contribution,
  -- Escore geral: média de todos os critérios (escala 1-5)
  ROUND((
    AVG(musicality) +
    AVG(punctuality) +
    AVG(music_preparation) +
    AVG(group_behavior) +
    AVG(temperament) +
    AVG(group_contribution)
  )::numeric / 6, 2)                              AS overall_score
FROM peer_evaluations
GROUP BY evaluated_id;

-- RLS
ALTER TABLE peer_evaluations ENABLE ROW LEVEL SECURITY;

-- Membro pode ver avaliações que fez ou que recebeu
CREATE POLICY "member_see_own_evals" ON peer_evaluations
  FOR SELECT USING (
    auth.uid() = evaluator_id OR auth.uid() = evaluated_id
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Membro pode criar avaliação (não pode avaliar a si mesmo)
CREATE POLICY "member_insert_eval" ON peer_evaluations
  FOR INSERT WITH CHECK (
    auth.uid() = evaluator_id
    AND evaluator_id <> evaluated_id
  );

-- Membro pode atualizar apenas a própria avaliação
CREATE POLICY "member_update_own_eval" ON peer_evaluations
  FOR UPDATE USING (auth.uid() = evaluator_id);

-- Admin pode deletar qualquer avaliação
CREATE POLICY "admin_delete_eval" ON peer_evaluations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );



-- ============================================================================
-- [MIGRATION] 20260331007000_fix_peer_evaluations_rls.sql
-- ============================================================================

-- Corrige RLS de peer_evaluations para mapear auth.uid() (auth.users.id)
-- para profiles.id (evaluator_id / evaluated_id)

ALTER TABLE IF EXISTS peer_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_see_own_evals" ON peer_evaluations;
DROP POLICY IF EXISTS "member_insert_eval" ON peer_evaluations;
DROP POLICY IF EXISTS "member_update_own_eval" ON peer_evaluations;
DROP POLICY IF EXISTS "admin_delete_eval" ON peer_evaluations;

CREATE POLICY "member_see_own_evals"
ON peer_evaluations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluated_id
      AND p.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);

CREATE POLICY "member_insert_eval"
ON peer_evaluations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
  AND evaluator_id <> evaluated_id
);

CREATE POLICY "member_update_own_eval"
ON peer_evaluations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles p
    WHERE p.id = peer_evaluations.evaluator_id
      AND p.user_id = auth.uid()
  )
  AND evaluator_id <> evaluated_id
);

CREATE POLICY "admin_delete_eval"
ON peer_evaluations
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  )
);



-- ============================================================================
-- [MIGRATION] 20260331008000_expand_peer_evaluation_criteria.sql
-- ============================================================================

-- Expande critérios de avaliação de membros para 17 dimensões
-- Mantém colunas antigas por compatibilidade histórica

ALTER TABLE IF EXISTS peer_evaluations
  ADD COLUMN IF NOT EXISTS relationship_with_god SMALLINT,
  ADD COLUMN IF NOT EXISTS character_integrity SMALLINT,
  ADD COLUMN IF NOT EXISTS leadership_submission SMALLINT,
  ADD COLUMN IF NOT EXISTS musical_skill SMALLINT,
  ADD COLUMN IF NOT EXISTS pitch_technical_precision_metronome SMALLINT,
  ADD COLUMN IF NOT EXISTS instrument_voice_knowledge SMALLINT,
  ADD COLUMN IF NOT EXISTS musical_development SMALLINT,
  ADD COLUMN IF NOT EXISTS punctuality_frequency SMALLINT,
  ADD COLUMN IF NOT EXISTS preparation_before_rehearsal SMALLINT,
  ADD COLUMN IF NOT EXISTS availability_for_schedule SMALLINT,
  ADD COLUMN IF NOT EXISTS teamwork SMALLINT,
  ADD COLUMN IF NOT EXISTS listening_sensitivity SMALLINT,
  ADD COLUMN IF NOT EXISTS respectful_communication SMALLINT,
  ADD COLUMN IF NOT EXISTS adaptability SMALLINT,
  ADD COLUMN IF NOT EXISTS worship_posture_focus SMALLINT,
  ADD COLUMN IF NOT EXISTS genuine_expression SMALLINT,
  ADD COLUMN IF NOT EXISTS worship_leader_sensitivity SMALLINT;

-- Backfill para registros antigos
UPDATE peer_evaluations
SET
  relationship_with_god = COALESCE(relationship_with_god, 3),
  character_integrity = COALESCE(character_integrity, temperament, 3),
  leadership_submission = COALESCE(leadership_submission, group_behavior, 3),
  musical_skill = COALESCE(musical_skill, musicality, 3),
  pitch_technical_precision_metronome = COALESCE(pitch_technical_precision_metronome, musicality, 3),
  instrument_voice_knowledge = COALESCE(instrument_voice_knowledge, music_preparation, 3),
  musical_development = COALESCE(musical_development, musicality, 3),
  punctuality_frequency = COALESCE(punctuality_frequency, punctuality, 3),
  preparation_before_rehearsal = COALESCE(preparation_before_rehearsal, music_preparation, 3),
  availability_for_schedule = COALESCE(availability_for_schedule, punctuality, 3),
  teamwork = COALESCE(teamwork, group_behavior, 3),
  listening_sensitivity = COALESCE(listening_sensitivity, group_contribution, 3),
  respectful_communication = COALESCE(respectful_communication, group_behavior, 3),
  adaptability = COALESCE(adaptability, temperament, 3),
  worship_posture_focus = COALESCE(worship_posture_focus, group_contribution, 3),
  genuine_expression = COALESCE(genuine_expression, group_contribution, 3),
  worship_leader_sensitivity = COALESCE(worship_leader_sensitivity, group_contribution, 3)
WHERE
  relationship_with_god IS NULL
  OR character_integrity IS NULL
  OR leadership_submission IS NULL
  OR musical_skill IS NULL
  OR pitch_technical_precision_metronome IS NULL
  OR instrument_voice_knowledge IS NULL
  OR musical_development IS NULL
  OR punctuality_frequency IS NULL
  OR preparation_before_rehearsal IS NULL
  OR availability_for_schedule IS NULL
  OR teamwork IS NULL
  OR listening_sensitivity IS NULL
  OR respectful_communication IS NULL
  OR adaptability IS NULL
  OR worship_posture_focus IS NULL
  OR genuine_expression IS NULL
  OR worship_leader_sensitivity IS NULL;

ALTER TABLE peer_evaluations
  ALTER COLUMN relationship_with_god SET NOT NULL,
  ALTER COLUMN character_integrity SET NOT NULL,
  ALTER COLUMN leadership_submission SET NOT NULL,
  ALTER COLUMN musical_skill SET NOT NULL,
  ALTER COLUMN pitch_technical_precision_metronome SET NOT NULL,
  ALTER COLUMN instrument_voice_knowledge SET NOT NULL,
  ALTER COLUMN musical_development SET NOT NULL,
  ALTER COLUMN punctuality_frequency SET NOT NULL,
  ALTER COLUMN preparation_before_rehearsal SET NOT NULL,
  ALTER COLUMN availability_for_schedule SET NOT NULL,
  ALTER COLUMN teamwork SET NOT NULL,
  ALTER COLUMN listening_sensitivity SET NOT NULL,
  ALTER COLUMN respectful_communication SET NOT NULL,
  ALTER COLUMN adaptability SET NOT NULL,
  ALTER COLUMN worship_posture_focus SET NOT NULL,
  ALTER COLUMN genuine_expression SET NOT NULL,
  ALTER COLUMN worship_leader_sensitivity SET NOT NULL;

ALTER TABLE peer_evaluations
  DROP CONSTRAINT IF EXISTS peer_evaluations_relationship_with_god_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_character_integrity_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_leadership_submission_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_musical_skill_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_pitch_technical_precision_metronome_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_instrument_voice_knowledge_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_musical_development_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_punctuality_frequency_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_preparation_before_rehearsal_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_availability_for_schedule_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_teamwork_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_listening_sensitivity_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_respectful_communication_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_adaptability_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_worship_posture_focus_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_genuine_expression_check,
  DROP CONSTRAINT IF EXISTS peer_evaluations_worship_leader_sensitivity_check;

ALTER TABLE peer_evaluations
  ADD CONSTRAINT peer_evaluations_relationship_with_god_check CHECK (relationship_with_god BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_character_integrity_check CHECK (character_integrity BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_leadership_submission_check CHECK (leadership_submission BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_musical_skill_check CHECK (musical_skill BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_pitch_technical_precision_metronome_check CHECK (pitch_technical_precision_metronome BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_instrument_voice_knowledge_check CHECK (instrument_voice_knowledge BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_musical_development_check CHECK (musical_development BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_punctuality_frequency_check CHECK (punctuality_frequency BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_preparation_before_rehearsal_check CHECK (preparation_before_rehearsal BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_availability_for_schedule_check CHECK (availability_for_schedule BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_teamwork_check CHECK (teamwork BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_listening_sensitivity_check CHECK (listening_sensitivity BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_respectful_communication_check CHECK (respectful_communication BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_adaptability_check CHECK (adaptability BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_worship_posture_focus_check CHECK (worship_posture_focus BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_genuine_expression_check CHECK (genuine_expression BETWEEN 1 AND 5),
  ADD CONSTRAINT peer_evaluations_worship_leader_sensitivity_check CHECK (worship_leader_sensitivity BETWEEN 1 AND 5);

DROP VIEW IF EXISTS peer_evaluation_scores;

CREATE VIEW peer_evaluation_scores AS
SELECT
  evaluated_id AS profile_id,
  COUNT(*) AS total_evaluators,
  ROUND(AVG(relationship_with_god)::numeric, 2) AS avg_relationship_with_god,
  ROUND(AVG(character_integrity)::numeric, 2) AS avg_character_integrity,
  ROUND(AVG(leadership_submission)::numeric, 2) AS avg_leadership_submission,
  ROUND(AVG(musical_skill)::numeric, 2) AS avg_musical_skill,
  ROUND(AVG(pitch_technical_precision_metronome)::numeric, 2) AS avg_pitch_technical_precision_metronome,
  ROUND(AVG(instrument_voice_knowledge)::numeric, 2) AS avg_instrument_voice_knowledge,
  ROUND(AVG(musical_development)::numeric, 2) AS avg_musical_development,
  ROUND(AVG(punctuality_frequency)::numeric, 2) AS avg_punctuality_frequency,
  ROUND(AVG(preparation_before_rehearsal)::numeric, 2) AS avg_preparation_before_rehearsal,
  ROUND(AVG(availability_for_schedule)::numeric, 2) AS avg_availability_for_schedule,
  ROUND(AVG(teamwork)::numeric, 2) AS avg_teamwork,
  ROUND(AVG(listening_sensitivity)::numeric, 2) AS avg_listening_sensitivity,
  ROUND(AVG(respectful_communication)::numeric, 2) AS avg_respectful_communication,
  ROUND(AVG(adaptability)::numeric, 2) AS avg_adaptability,
  ROUND(AVG(worship_posture_focus)::numeric, 2) AS avg_worship_posture_focus,
  ROUND(AVG(genuine_expression)::numeric, 2) AS avg_genuine_expression,
  ROUND(AVG(worship_leader_sensitivity)::numeric, 2) AS avg_worship_leader_sensitivity,
  ROUND(((
    AVG(relationship_with_god) +
    AVG(character_integrity) +
    AVG(leadership_submission) +
    AVG(musical_skill) +
    AVG(pitch_technical_precision_metronome) +
    AVG(instrument_voice_knowledge) +
    AVG(musical_development) +
    AVG(punctuality_frequency) +
    AVG(preparation_before_rehearsal) +
    AVG(availability_for_schedule) +
    AVG(teamwork) +
    AVG(listening_sensitivity) +
    AVG(respectful_communication) +
    AVG(adaptability) +
    AVG(worship_posture_focus) +
    AVG(genuine_expression) +
    AVG(worship_leader_sensitivity)
  )::numeric / 17) * 200, 0) AS overall_score
FROM peer_evaluations
GROUP BY evaluated_id;



-- ============================================================================
-- [MIGRATION] 20260331009000_add_pending_approval_status.sql
-- ============================================================================

-- Adiciona status 'pending_approval' ao enum member_status
-- Membros que se cadastram via /cadastro-musico ficam pendentes até admin ativar

ALTER TYPE member_status ADD VALUE IF NOT EXISTS 'pending_approval';



-- ============================================================================
-- [MIGRATION] 20260331010000_require_user_role_when_profile_active.sql
-- ============================================================================

-- Garante que perfis ativos tenham vínculo em user_roles
-- Evita ativação de membro sem vínculo de igreja/role

CREATE OR REPLACE FUNCTION public.ensure_active_profile_has_user_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' THEN
    IF NEW.user_id IS NULL THEN
      RAISE EXCEPTION 'Perfil ativo sem user_id não é permitido';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = NEW.user_id
        AND ur.role IN ('member', 'admin')
    ) THEN
      RAISE EXCEPTION 'Não é permitido ativar perfil sem vínculo em user_roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_active_profile_has_user_role ON public.profiles;

CREATE TRIGGER trg_ensure_active_profile_has_user_role
BEFORE INSERT OR UPDATE OF status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_active_profile_has_user_role();



-- ============================================================================
-- [MIGRATION] 20260401090000_add_commitment_term_to_profiles.sql
-- ============================================================================

-- Adiciona campos de termo de compromisso ao perfil do membro
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commitment_term_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commitment_term_accepted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS commitment_term_payload JSONB NULL;

COMMENT ON COLUMN public.profiles.commitment_term_accepted IS 'Indica se o membro aceitou o termo de compromisso do Ministerio de Louvor.';
COMMENT ON COLUMN public.profiles.commitment_term_accepted_at IS 'Data/hora em que o membro aceitou o termo no cadastro.';
COMMENT ON COLUMN public.profiles.commitment_term_payload IS 'Snapshot dos dados do termo (igreja, ministerio, funcao, etc.) para emissao de PDF.';



-- ============================================================================
-- [MIGRATION] 20260401093000_allow_anon_signup_ministries.sql
-- ============================================================================

-- Permite leitura publica dos ministerios e dados basicos da igreja para o cadastro de musico
DROP POLICY IF EXISTS "Anon can view ministries for signup" ON public.ministries;
DROP POLICY IF EXISTS "Anon can view churches for signup" ON public.churches;

CREATE POLICY "Anon can view ministries for signup"
  ON public.ministries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can view churches for signup"
  ON public.churches FOR SELECT
  TO anon, authenticated
  USING (true);



-- ============================================================================
-- [MIGRATION] 20260401100000_create_signup_ministries_rpc.sql
-- ============================================================================

-- Expor ministerios cadastrados no banco para a tela publica de cadastro de musicos
CREATE OR REPLACE FUNCTION public.list_signup_ministries()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  church_id UUID,
  church_name TEXT,
  church_address TEXT,
  church_contact TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.name,
    m.description,
    m.logo_url,
    m.church_id,
    c.name AS church_name,
    c.address AS church_address,
    c.contact AS church_contact
  FROM public.ministries m
  LEFT JOIN public.churches c ON c.id = m.church_id
  ORDER BY m.name;
$$;

REVOKE ALL ON FUNCTION public.list_signup_ministries() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_signup_ministries() TO anon, authenticated;



-- ============================================================================
-- [MIGRATION] 20260401103000_fix_messages_read_policy_and_pastor_name.sql
-- ============================================================================

-- Garante coluna pastor_name em ambientes onde migracoes antigas nao foram aplicadas corretamente
ALTER TABLE public.churches
  ADD COLUMN IF NOT EXISTS pastor_name TEXT;

-- Permite marcar como lidas mensagens de destinatario direto, broadcast e equipe
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;
CREATE POLICY "Users can update message read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  )
  WITH CHECK (
    recipient_id = public.get_current_profile_id()
    OR (is_broadcast = true AND public.is_church_member(church_id))
    OR (
      recipient_team_id IS NOT NULL AND EXISTS (
        SELECT 1
        FROM public.team_members tm
        WHERE tm.team_id = recipient_team_id
          AND tm.profile_id = public.get_current_profile_id()
      )
    )
    OR public.is_church_admin(church_id)
  );



-- ============================================================================
-- [MIGRATION] 20260401110000_harden_messages_and_indexes.sql
-- ============================================================================

-- Hardening de mensagens: leitura segura, update controlado e indices para performance

-- 1) Funcao segura para marcar mensagem como lida (evita UPDATE amplo via cliente)
CREATE OR REPLACE FUNCTION public.mark_message_as_read(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile_id UUID;
  updated_count INTEGER := 0;
BEGIN
  current_profile_id := public.get_current_profile_id();

  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil autenticado não encontrado';
  END IF;

  UPDATE public.messages m
  SET read_at = COALESCE(m.read_at, now())
  WHERE m.id = p_message_id
    AND (
      m.recipient_id = current_profile_id
      OR (m.is_broadcast = true AND public.is_church_member(m.church_id))
      OR (
        m.recipient_team_id IS NOT NULL AND EXISTS (
          SELECT 1
          FROM public.team_members tm
          WHERE tm.team_id = m.recipient_team_id
            AND tm.profile_id = current_profile_id
        )
      )
      OR public.is_church_admin(m.church_id)
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_message_as_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_as_read(UUID) TO authenticated;

-- 2) Restringe UPDATE direto em mensagens (forca uso da RPC)
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;

-- 2.1) Garante que apenas admins da igreja possam apagar mensagens
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));

-- 3) Indices para queries de inbox e contador de nao lidas
CREATE INDEX IF NOT EXISTS idx_messages_unread_recipient_created
  ON public.messages (recipient_id, created_at DESC)
  WHERE read_at IS NULL AND recipient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_unread_broadcast_church_created
  ON public.messages (church_id, created_at DESC)
  WHERE read_at IS NULL AND is_broadcast = true;

CREATE INDEX IF NOT EXISTS idx_messages_unread_team_created
  ON public.messages (recipient_team_id, created_at DESC)
  WHERE read_at IS NULL AND recipient_team_id IS NOT NULL;



-- ============================================================================
-- [MIGRATION] 20260402000000_message_reads_and_retention.sql
-- ============================================================================

-- =============================================================================
-- message_reads: rastreamento individual de leitura por perfil
-- Resolve o bug onde marcar uma mensagem broadcast como lida
-- escondia a mensagem para todos os outros membros.
-- =============================================================================

-- 1) Tabela de leituras individuais
CREATE TABLE IF NOT EXISTS public.message_reads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID        NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, profile_id)
);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Membro vê só suas próprias leituras; admin vê todas da sua igreja
CREATE POLICY "Users can view own reads"
  ON public.message_reads FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND public.is_church_admin(m.church_id)
    )
  );

-- Membro só registra leitura para si mesmo
CREATE POLICY "Users can insert own read"
  ON public.message_reads FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = public.get_current_profile_id());

CREATE INDEX IF NOT EXISTS idx_message_reads_message_id
  ON public.message_reads (message_id);

CREATE INDEX IF NOT EXISTS idx_message_reads_profile_id
  ON public.message_reads (profile_id);

-- 2) Migra leituras já existentes (mensagens diretas com read_at preenchido)
INSERT INTO public.message_reads (message_id, profile_id, read_at)
SELECT m.id, m.recipient_id, m.read_at
FROM   public.messages m
WHERE  m.read_at     IS NOT NULL
  AND  m.recipient_id IS NOT NULL
ON CONFLICT (message_id, profile_id) DO NOTHING;

-- 3) Substitui mark_message_as_read para usar message_reads
--    (não toca mais em messages.read_at, evitando ocultar mensagem para todos)
CREATE OR REPLACE FUNCTION public.mark_message_as_read(p_message_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile_id UUID;
  v_visible          BOOLEAN := false;
BEGIN
  current_profile_id := public.get_current_profile_id();

  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil autenticado não encontrado';
  END IF;

  -- Verifica se a mensagem é visível para o usuário atual
  SELECT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE  m.id = p_message_id
      AND (
        m.recipient_id = current_profile_id
        OR (m.is_broadcast = true AND public.is_church_member(m.church_id))
        OR (
          m.recipient_team_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE  tm.team_id   = m.recipient_team_id
              AND  tm.profile_id = current_profile_id
          )
        )
        OR public.is_church_admin(m.church_id)
      )
  ) INTO v_visible;

  IF NOT v_visible THEN
    RETURN false;
  END IF;

  INSERT INTO public.message_reads (message_id, profile_id, read_at)
  VALUES (p_message_id, current_profile_id, now())
  ON CONFLICT (message_id, profile_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL   ON FUNCTION public.mark_message_as_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_as_read(UUID) TO authenticated;

-- 4) Função de limpeza: apaga mensagens com mais de 10 dias (chame manualmente
--    ou via pg_cron: SELECT cron.schedule('0 3 * * *', 'SELECT purge_old_messages()'))
CREATE OR REPLACE FUNCTION public.purge_old_messages()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.messages
  WHERE created_at < (now() - INTERVAL '10 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL   ON FUNCTION public.purge_old_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_messages() TO authenticated;

-- 5) Index adicional para queries de histórico dos últimos 10 dias
CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages (created_at DESC);

