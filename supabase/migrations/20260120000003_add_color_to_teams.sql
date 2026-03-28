-- Add color column to teams table
ALTER TABLE teams ADD COLUMN color TEXT DEFAULT 'blue';

-- Add comment to document the color column
COMMENT ON COLUMN teams.color IS 'Color identifier for team: blue, red, green, purple, orange, pink, indigo, cyan';
