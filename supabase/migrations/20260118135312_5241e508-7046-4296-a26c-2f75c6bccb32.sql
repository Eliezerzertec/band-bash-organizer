-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.substitution_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE public.member_status AS ENUM ('active', 'inactive');

-- =============================================
-- BASE TABLES
-- =============================================

-- Churches (Igrejas)
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (Perfis de usuário)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- User Roles (Roles por Igreja - Multi-tenant)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, church_id)
);

-- Ministries (Ministérios)
CREATE TABLE public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teams (Equipes)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team Members (Membros das Equipes)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_team TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, profile_id)
);

-- Schedules (Escalas/Cultos)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  ministry_id UUID REFERENCES public.ministries(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule Assignments (Escalas dos Membros)
CREATE TABLE public.schedule_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role_assigned TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, profile_id)
);

-- Substitution Requests (Pedidos de Substituição)
CREATE TABLE public.substitution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_assignment_id UUID REFERENCES public.schedule_assignments(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  substitute_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT,
  status public.substitution_status NOT NULL DEFAULT 'pending',
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages (Mensagens)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- SECURITY DEFINER FUNCTIONS (prevent recursion)
-- =============================================

-- Get profile ID for current user
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Check if user has role in a church
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

-- Check if user is admin of a church
CREATE OR REPLACE FUNCTION public.is_church_admin(p_church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role_in_church(p_church_id, 'admin')
$$;

-- Check if user is member of a church (any role)
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

-- Get church_id for a ministry
CREATE OR REPLACE FUNCTION public.get_church_id_for_ministry(p_ministry_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.ministries WHERE id = p_ministry_id
$$;

-- Get church_id for a team
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

-- Get church_id for a schedule
CREATE OR REPLACE FUNCTION public.get_church_id_for_schedule(p_schedule_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.schedules WHERE id = p_schedule_id
$$;

-- Get church_id for a schedule assignment
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

-- =============================================
-- UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON public.churches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON public.ministries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_substitution_requests_updated_at BEFORE UPDATE ON public.substitution_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ENABLE RLS
-- =============================================
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

-- =============================================
-- RLS POLICIES - CHURCHES
-- =============================================
CREATE POLICY "Members can view their churches"
  ON public.churches FOR SELECT
  TO authenticated
  USING (public.is_church_member(id));

CREATE POLICY "Admins can insert churches"
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

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================
CREATE POLICY "Users can view profiles in their churches"
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

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES - USER_ROLES
-- =============================================
CREATE POLICY "Users can view roles in their churches"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_church_member(church_id)
  );

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

-- =============================================
-- RLS POLICIES - MINISTRIES
-- =============================================
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

-- =============================================
-- RLS POLICIES - TEAMS
-- =============================================
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

-- =============================================
-- RLS POLICIES - TEAM_MEMBERS
-- =============================================
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

-- =============================================
-- RLS POLICIES - SCHEDULES
-- =============================================
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

-- =============================================
-- RLS POLICIES - SCHEDULE_ASSIGNMENTS
-- =============================================
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

-- =============================================
-- RLS POLICIES - SUBSTITUTION_REQUESTS
-- =============================================
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

-- =============================================
-- RLS POLICIES - MESSAGES
-- =============================================
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    sender_id = public.get_current_profile_id() OR
    recipient_id = public.get_current_profile_id() OR
    is_broadcast = true AND public.is_church_member(church_id) OR
    recipient_team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = recipient_team_id
      AND tm.profile_id = public.get_current_profile_id()
    ) OR
    public.is_church_admin(church_id)
  );

CREATE POLICY "Admins can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = public.get_current_profile_id() AND
    public.is_church_admin(church_id)
  );

CREATE POLICY "Users can update message read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (recipient_id = public.get_current_profile_id());

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (public.is_church_admin(church_id));