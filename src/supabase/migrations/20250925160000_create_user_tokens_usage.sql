-- Enable RLS
ALTER TABLE user_tokens_usage ENABLE ROW LEVEL SECURITY;

-- Policy for select
CREATE POLICY user_tokens_usage_select ON user_tokens_usage 
FOR SELECT USING (auth.uid() = user_id);

-- Policy for insert
CREATE POLICY user_tokens_usage_insert ON user_tokens_usage 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for update
CREATE POLICY user_tokens_usage_update ON user_tokens_usage 
FOR UPDATE USING (auth.uid() = user_id);

-- Create the table
CREATE TABLE IF NOT EXISTS public.user_tokens_usage (
  user_id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  tokens_used_this_month integer DEFAULT 0,
  last_reset_date timestamp with time zone DEFAULT now(),
  plan text DEFAULT 'starter'
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_usage_user_id ON public.user_tokens_usage (user_id);