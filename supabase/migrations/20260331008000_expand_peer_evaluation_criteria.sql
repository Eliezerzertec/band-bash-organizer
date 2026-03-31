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
