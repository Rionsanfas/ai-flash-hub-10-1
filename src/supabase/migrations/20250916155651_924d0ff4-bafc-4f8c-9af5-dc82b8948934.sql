-- Add new columns to existing flashcard_sets table for the enhanced settings
ALTER TABLE public.flashcard_sets 
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS learning_mode text DEFAULT 'memorization' CHECK (learning_mode IN ('memorization', 'understanding', 'mixed')),
ADD COLUMN IF NOT EXISTS card_count integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS subject_focus text;

-- Add adaptive learning columns to flashcards table
ALTER TABLE public.flashcards 
ADD COLUMN IF NOT EXISTS last_rating text CHECK (last_rating IN ('easy', 'hard')),
ADD COLUMN IF NOT EXISTS times_rated_hard integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_studied_at timestamp with time zone;

-- Create study sessions table for tracking study progress
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flashcard_set_id uuid NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'review' CHECK (session_type IN ('review', 'new', 'mixed')),
  cards_studied integer DEFAULT 0,
  cards_correct integer DEFAULT 0,
  session_duration integer DEFAULT 0, -- in seconds
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_sessions
CREATE POLICY "Users can view their own study sessions" 
ON public.study_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study sessions" 
ON public.study_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" 
ON public.study_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" 
ON public.study_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create timer sessions table for cross-tab sync
CREATE TABLE IF NOT EXISTS public.timer_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  timer_type text NOT NULL DEFAULT 'study' CHECK (timer_type IN ('study', 'break')),
  duration integer NOT NULL, -- in seconds
  remaining_time integer NOT NULL, -- in seconds
  is_running boolean DEFAULT false,
  started_at timestamp with time zone,
  paused_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on timer_sessions
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for timer_sessions
CREATE POLICY "Users can view their own timer sessions" 
ON public.timer_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timer sessions" 
ON public.timer_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timer sessions" 
ON public.timer_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer sessions" 
ON public.timer_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create file uploads table for document processing
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  filename text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  processed boolean DEFAULT false,
  extraction_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on uploaded_files
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for uploaded_files
CREATE POLICY "Users can view their own uploaded files" 
ON public.uploaded_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploaded files" 
ON public.uploaded_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded files" 
ON public.uploaded_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded files" 
ON public.uploaded_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updating updated_at timestamps
CREATE TRIGGER update_study_sessions_updated_at
BEFORE UPDATE ON public.study_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timer_sessions_updated_at
BEFORE UPDATE ON public.timer_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcard_sets_updated_at
BEFORE UPDATE ON public.flashcard_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON public.flashcards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();