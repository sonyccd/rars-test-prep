-- Add links column to questions table for storing unfurled URL metadata
-- Structure: [{ url, title, description, image, type, siteName }]
ALTER TABLE public.questions 
ADD COLUMN links jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.questions.links IS 'Array of unfurled link objects: [{ url: string, title: string, description: string, image: string, type: "video"|"article"|"website", siteName: string }]';