-- Create flashcard sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  study_mode TEXT CHECK (study_mode IN ('quiz', 'spaced_repetition')) DEFAULT 'quiz',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user flashcard usage tracking table
CREATE TABLE IF NOT EXISTS user_flashcard_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('starter', 'pro', 'premium')) DEFAULT 'starter',
  flashcards_used_this_month INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Create user tokens usage tracking table
CREATE TABLE IF NOT EXISTS user_tokens_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT CHECK (plan IN ('starter', 'pro', 'premium')) DEFAULT 'starter',
  tokens_used_this_month INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Enable Row Level Security on all tables
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcard_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens_usage ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
CREATE POLICY "Users can view own sets" ON flashcard_sets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR ALL USING (auth.uid() = (SELECT user_id FROM flashcard_sets WHERE id = set_id));

CREATE POLICY "Users can view own usage" ON user_flashcard_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tokens usage" ON user_tokens_usage
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create usage entries on new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_flashcard_usage (user_id, plan)
  VALUES (new.id, 'starter')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_tokens_usage (user_id, plan)
  VALUES (new.id, 'starter')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();