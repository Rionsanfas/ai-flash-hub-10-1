import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  tags: string[];
}

const ReviewFlashcards: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setId = searchParams.get('setId');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showHarderDialog, setShowHarderDialog] = useState(false);
  const [showEasierDialog, setShowEasierDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    if (setId) fetchFlashcards();
  }, [setId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    }
  };

  const fetchFlashcards = async () => {
    if (!setId) {
      toast.error('No flashcard set specified');
      setLoading(false);
      return;
    }

    try {
      const { data: cards, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('set_id', setId)
        .order('id');

      if (error) throw error;

      setFlashcards(cards || []);
    } catch (error) {
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleCorrect = async () => {
    setIsFlipped(false);
    setCorrectStreak(prev => prev + 1);
    setWrongStreak(0);
    nextCard();

    if (correctStreak + 1 >= 15) {
      setShowHarderDialog(true);
    }
  };

  const handleWrong = () => {
    setIsFlipped(false);
    setWrongStreak(prev => prev + 1);
    setCorrectStreak(0);
    nextCard();

    if (wrongStreak + 1 >= 5) {
      setShowEasierDialog(true);
    }
  };

  const nextCard = () => {
    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      toast.success('Quiz completed!');
    }
  };

  const updateDifficulty = async (newDifficulty: 'easy' | 'medium' | 'hard') => {
    try {
      // Update set difficulty
      await supabase
        .from('flashcard_sets')
        .update({ difficulty: newDifficulty })
        .eq('id', setId);

      // Update all flashcards in set
      await supabase
        .from('flashcards')
        .update({ difficulty: newDifficulty })
        .eq('set_id', setId);

      toast.success(`Difficulty updated to ${newDifficulty}`);
      fetchFlashcards(); // Refresh
    } catch (error) {
      toast.error('Failed to update difficulty');
    }
  };

  if (loading) return <div className="container mx-auto py-8">Loading...</div>;

  if (flashcards.length === 0) return <div className="container mx-auto py-8">No flashcards found.</div>;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Review Flashcards</h1>
      <p className="mb-4">Card {currentIndex + 1} of {flashcards.length} | Correct Streak: {correctStreak} | Wrong Streak: {wrongStreak}</p>
      
      <Card className="p-6">
        <CardContent className="flex flex-col items-center space-y-4">
          <h2 className={!isFlipped ? 'text-xl font-semibold' : 'sr-only'}>{currentCard.question}</h2>
          <p className={isFlipped ? 'text-lg' : 'sr-only'}>{currentCard.answer}</p>
          <div className="flex gap-2">
            {currentCard.tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            {!isFlipped ? (
              <Button onClick={() => setIsFlipped(true)}>Show Answer</Button>
            ) : (
              <>
                <Button variant="default" onClick={handleCorrect}>Correct</Button>
                <Button variant="destructive" onClick={handleWrong}>Wrong</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showHarderDialog} onOpenChange={setShowHarderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Increase Difficulty?</AlertDialogTitle>
            <AlertDialogDescription>You've got 15 correct! Want harder cards?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Current</AlertDialogCancel>
            <AlertDialogAction onClick={() => { updateDifficulty('hard'); setShowHarderDialog(false); }}>Yes, Harder</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEasierDialog} onOpenChange={setShowEasierDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reduce Difficulty?</AlertDialogTitle>
            <AlertDialogDescription>You're struggling. Want easier cards?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Current</AlertDialogCancel>
            <AlertDialogAction onClick={() => { updateDifficulty('easy'); setShowEasierDialog(false); }}>Yes, Easier</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewFlashcards;