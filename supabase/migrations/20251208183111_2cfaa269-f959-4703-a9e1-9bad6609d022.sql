-- Add edit_history column to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS edit_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add edit_history column to glossary_terms table
ALTER TABLE public.glossary_terms 
ADD COLUMN IF NOT EXISTS edit_history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add comments to explain the structure
COMMENT ON COLUMN public.questions.edit_history IS 'Array of edit records: [{user_id, user_email, action, changes, timestamp}]';
COMMENT ON COLUMN public.glossary_terms.edit_history IS 'Array of edit records: [{user_id, user_email, action, changes, timestamp}]';