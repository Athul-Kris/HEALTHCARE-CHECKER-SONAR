-- Create a table for symptom queries
CREATE TABLE public.symptom_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  symptoms TEXT NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.symptom_queries ENABLE ROW LEVEL SECURITY;

-- Public can insert queries (no auth required for this educational tool)
CREATE POLICY "Anyone can insert symptom queries"
ON public.symptom_queries
FOR INSERT
WITH CHECK (true);

-- Users can view their own queries if logged in (optional feature)
CREATE POLICY "Users can view their own queries"
ON public.symptom_queries
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create index for better query performance
CREATE INDEX idx_symptom_queries_user_id ON public.symptom_queries(user_id);
CREATE INDEX idx_symptom_queries_created_at ON public.symptom_queries(created_at DESC);