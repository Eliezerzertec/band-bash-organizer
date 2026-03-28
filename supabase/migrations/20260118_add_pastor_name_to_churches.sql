-- Migration: Add pastor_name field to churches table
-- Description: Adds support for pastor name in church records
-- Created: 2026-01-18

-- Add pastor_name column to churches table
ALTER TABLE churches 
ADD COLUMN pastor_name VARCHAR(100) DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX idx_churches_pastor_name ON churches(pastor_name);

-- Add comment to column
COMMENT ON COLUMN churches.pastor_name IS 'Nome do pastor responsável pela igreja';

-- Update existing records (optional - set default or NULL)
-- UPDATE churches SET pastor_name = 'Pastor (A definir)' WHERE pastor_name IS NULL;
