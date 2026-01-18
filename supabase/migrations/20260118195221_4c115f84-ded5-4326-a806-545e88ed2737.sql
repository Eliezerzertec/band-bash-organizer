-- Add pastor_name column to churches table
ALTER TABLE public.churches ADD COLUMN pastor_name text;

-- Create index for faster lookups
CREATE INDEX idx_churches_pastor_name ON public.churches(pastor_name);