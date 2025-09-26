-- Create flashcard sets table
CREATE TABLE public.flashcard_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  exam_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chats table
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flashcard_sets
CREATE POLICY "Users can view their own flashcard sets" 
ON public.flashcard_sets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcard sets" 
ON public.flashcard_sets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcard sets" 
ON public.flashcard_sets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcard sets" 
ON public.flashcard_sets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for flashcards
CREATE POLICY "Users can view flashcards in their sets" 
ON public.flashcards 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.flashcard_sets 
  WHERE flashcard_sets.id = flashcards.set_id 
  AND flashcard_sets.user_id = auth.uid()
));

CREATE POLICY "Users can create flashcards in their sets" 
ON public.flashcards 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.flashcard_sets 
  WHERE flashcard_sets.id = flashcards.set_id 
  AND flashcard_sets.user_id = auth.uid()
));

CREATE POLICY "Users can update flashcards in their sets" 
ON public.flashcards 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.flashcard_sets 
  WHERE flashcard_sets.id = flashcards.set_id 
  AND flashcard_sets.user_id = auth.uid()
));

CREATE POLICY "Users can delete flashcards in their sets" 
ON public.flashcards 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.flashcard_sets 
  WHERE flashcard_sets.id = flashcards.set_id 
  AND flashcard_sets.user_id = auth.uid()
));

-- Create RLS policies for chats
CREATE POLICY "Users can view their own chats" 
ON public.chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats" 
ON public.chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
ON public.chats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
ON public.chats 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view messages in their chats" 
ON public.chat_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = chat_messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their chats" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = chat_messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can update messages in their chats" 
ON public.chat_messages 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = chat_messages.chat_id 
  AND chats.user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in their chats" 
ON public.chat_messages 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.chats 
  WHERE chats.id = chat_messages.chat_id 
  AND chats.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_flashcard_sets_updated_at
BEFORE UPDATE ON public.flashcard_sets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
BEFORE UPDATE ON public.flashcards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();