-- =============================================
-- MEMBER SCORES AND EVALUATIONS
-- Created: 2026-01-20
-- Purpose: Track member performance scores based on frequency, commitment, substitutions, etc.
-- Score Range: 10 (minimum) to 1000 (maximum), initial: 500
-- =============================================

-- ENUM for evaluation criteria
CREATE TYPE public.evaluation_criteria AS ENUM (
  'frequency',
  'commitment',
  'substitution_requests',
  'agenda_blocks',
  'other'
);

-- Member Scores Table
CREATE TABLE IF NOT EXISTS public.member_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score INTEGER DEFAULT 500 NOT NULL CHECK (score >= 10 AND score <= 1000),
  frequency_score INTEGER DEFAULT 500,
  commitment_score INTEGER DEFAULT 500,
  substitution_score INTEGER DEFAULT 500,
  agenda_block_score INTEGER DEFAULT 500,
  total_substitutions_requested INTEGER DEFAULT 0,
  total_agenda_blocks INTEGER DEFAULT 0,
  last_evaluation_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Evaluation History (for tracking changes)
CREATE TABLE IF NOT EXISTS public.member_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_score_id UUID REFERENCES public.member_scores(id) ON DELETE CASCADE NOT NULL,
  criterion public.evaluation_criteria NOT NULL,
  previous_score INTEGER,
  new_score INTEGER NOT NULL,
  reason TEXT,
  evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.member_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_scores
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

-- RLS Policies for member_evaluations
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

-- Create index for performance
CREATE INDEX idx_member_scores_user_id ON public.member_scores(user_id);
CREATE INDEX idx_member_scores_profile_id ON public.member_scores(profile_id);
CREATE INDEX idx_member_evaluations_member_score_id ON public.member_evaluations(member_score_id);

-- =============================================
-- NOTES:
-- =============================================
-- 1. Score Calculation:
--    - Frequency: Based on attendance rate
--    - Commitment: Based on punctuality and reliability
--    - Substitution: Decreases if many substitutions requested
--    - Agenda Blocks: Decreases if blocks schedule frequently
--
-- 2. Initial Score: 500 for all new members
--
-- 3. Score Range: 10 (minimum) to 1000 (maximum)
--
-- 4. Evaluation History: Track all score changes for audit
--
-- 5. Criteria to be defined in project documentation
-- =============================================
