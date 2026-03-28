-- Add schedule_type column to schedules table
ALTER TABLE schedules
ADD COLUMN schedule_type VARCHAR(20) DEFAULT 'normal' NOT NULL;

-- Add comment
COMMENT ON COLUMN schedules.schedule_type IS 'Type of schedule: normal or especial';
