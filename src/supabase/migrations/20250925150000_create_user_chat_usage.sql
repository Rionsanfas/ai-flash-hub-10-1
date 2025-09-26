-- Enable RLS
ALTER TABLE user_chat_usage ENABLE ROW LEVEL SECURITY;

-- Policy for users to view/update their own usage
CREATE POLICY "Users can view own chat usage" ON user_chat_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat usage" ON user_chat_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat usage" ON user_chat_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create the table
CREATE TABLE IF NOT EXISTS user_chat_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter',
  tokens_used_this_month INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_chat_usage_user_id ON user_chat_usage(user_id);