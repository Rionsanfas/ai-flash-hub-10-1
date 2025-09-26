import { supabase } from '@/integrations/supabase/client';

export interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  exam_date?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  flashcards?: Flashcard[];
}

export interface Flashcard {
  id: string;
  set_id: string;
  question: string;
  answer: string;
  difficulty: number;
  next_review_date: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export const createFlashcardSet = async (
  title: string,
  subject: string,
  examDate?: string,
  flashcards: { question: string; answer: string }[] = []
): Promise<FlashcardSet> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Create the flashcard set
  const { data: setData, error: setError } = await supabase
    .from('flashcard_sets')
    .insert({
      title,
      subject,
      exam_date: examDate || null,
      user_id: user.id,
    })
    .select()
    .single();

  if (setError) throw setError;

  // Add flashcards if provided
  if (flashcards.length > 0) {
    const flashcardInserts = flashcards.map(card => ({
      set_id: setData.id,
      question: card.question,
      answer: card.answer,
      difficulty: 0,
      next_review_date: new Date().toISOString().split('T')[0],
      review_count: 0,
    }));

    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardInserts);

    if (cardsError) throw cardsError;
  }

  return setData;
};

export const generateFlashcards = async (
  topic: string,
  count: number = 20
): Promise<{ question: string; answer: string }[]> => {
  const { data, error } = await supabase.functions.invoke('generate-flashcards', {
    body: { topic, count },
  });

  if (error) throw error;
  return data.flashcards;
};

export const getFlashcardSets = async (): Promise<FlashcardSet[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('flashcard_sets')
    .select(`
      id,
      title,
      subject,
      exam_date,
      user_id,
      created_at,
      updated_at,
      flashcards (
        id,
        set_id,
        question,
        answer,
        difficulty,
        next_review_date,
        review_count,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as FlashcardSet[] || [];
};

export const getFlashcardSet = async (setId: string): Promise<FlashcardSet | null> => {
  const { data, error } = await supabase
    .from('flashcard_sets')
    .select(`
      id,
      title,
      subject,
      exam_date,
      user_id,
      created_at,
      updated_at,
      flashcards (
        id,
        set_id,
        question,
        answer,
        difficulty,
        next_review_date,
        review_count,
        created_at,
        updated_at
      )
    `)
    .eq('id', setId)
    .single();

  if (error) return null;
  return data as FlashcardSet;
};

export const updateFlashcardReview = async (
  flashcardId: string,
  quality: number
): Promise<void> => {
  const now = new Date();
  const nextReviewDate = new Date(now);
  
  // Simple spaced repetition algorithm
  const intervals = [1, 3, 7, 14, 30]; // days
  const intervalIndex = Math.min(quality - 1, intervals.length - 1);
  nextReviewDate.setDate(now.getDate() + intervals[Math.max(0, intervalIndex)]);

  // Get current review count first
  const { data: currentCard } = await supabase
    .from('flashcards')
    .select('review_count')
    .eq('id', flashcardId)
    .single();

  const { error } = await supabase
    .from('flashcards')
    .update({
      difficulty: quality,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      review_count: (currentCard?.review_count || 0) + 1,
    })
    .eq('id', flashcardId);

  if (error) throw error;
};

export const deleteFlashcardSet = async (setId: string): Promise<void> => {
  const { error } = await supabase
    .from('flashcard_sets')
    .delete()
    .eq('id', setId);

  if (error) throw error;
};