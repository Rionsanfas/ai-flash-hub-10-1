import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GlassCard } from './ui/glass-card';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Brain } from 'lucide-react';
import { Flashcard, studyFlashcard } from '../lib/flashcards';
import { useToast } from '../hooks/use-toast';

interface StudySessionProps {
  dueCards: { card: Flashcard; setId: string; setTitle: string }[];
  onComplete: () => void;
  onBack: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ dueCards, onComplete, onBack }) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());

  const currentCard = dueCards[currentIndex];

  useEffect(() => {
    setShowAnswer(false);
  }, [currentIndex]);

  const handleStudy = (quality: number) => {
    if (!currentCard) return;

    studyFlashcard(currentCard.setId, currentCard.card.id, quality);
    setStudiedCards(prev => new Set([...prev, currentCard.card.id]));
    
    const qualityText = quality >= 4 ? 'Perfect!' : quality >= 3 ? 'Good!' : 'Keep practicing!';
    toast({
      title: qualityText,
      description: `Card reviewed. Next review scheduled.`,
    });

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleNext = () => {
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentCard) {
    return (
      <GlassCard className="text-center py-12">
        <CardContent>
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="heading-tertiary mb-2">Study Session Complete!</h3>
          <p className="text-muted-foreground mb-6">
            Great job! You've reviewed all your due flashcards.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={onBack} variant="outline">
              Back to Dashboard
            </Button>
            <Button onClick={onComplete} className="btn-glow">
              Continue Studying
            </Button>
          </div>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {dueCards.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {studiedCards.size} reviewed
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500 ease-smooth"
            style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Study Card */}
      <GlassCard variant="glow" className="mb-6 animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="heading-tertiary">{currentCard.setTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Difficulty: {currentCard.card.difficulty} • Studies: {currentCard.card.studyCount}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleNext} disabled={currentIndex === dueCards.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="min-h-[200px] cursor-pointer group"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <div className="text-center mb-6">
              <Brain className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-4">
                {showAnswer ? 'Answer' : 'Question'}
              </h3>
            </div>
            
            <div className="glass-subtle rounded-lg p-6 min-h-[120px] flex items-center justify-center">
              <p className="text-center text-lg leading-relaxed">
                {showAnswer ? currentCard.card.answer : currentCard.card.question}
              </p>
            </div>
            
            {!showAnswer && (
              <p className="text-center text-sm text-muted-foreground mt-4 group-hover:text-primary transition-colors">
                Click to reveal answer
              </p>
            )}
          </div>

          {showAnswer && (
            <div className="mt-6 animate-fade-in">
              <p className="text-center text-sm text-muted-foreground mb-4">
                How well did you know this?
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleStudy(0)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStudy(2)}
                  className="text-warning hover:text-warning"
                >
                  Hard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStudy(3)}
                  className="text-primary hover:text-primary"
                >
                  Good
                </Button>
                <Button
                  onClick={() => handleStudy(5)}
                  className="btn-glow"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Easy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </GlassCard>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Dashboard
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowAnswer(false)}
            disabled={!showAnswer}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Card
          </Button>
        </div>
      </div>
    </div>
  );
};