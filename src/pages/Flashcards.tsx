import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashcardForm } from "@/components/FlashcardForm";
import { StudySession } from "@/components/StudySession";
import { getFlashcardSets, FlashcardSet, deleteFlashcardSet } from '@/lib/supabase-flashcards';
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Calendar, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';

export default function Flashcards() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [studyingSet, setStudyingSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcardSets();
  }, []);

  const loadFlashcardSets = async () => {
    try {
      const sets = await getFlashcardSets();
      setFlashcardSets(sets);
    } catch (error) {
      console.error('Error loading flashcard sets:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load flashcard sets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId: string) => {
    try {
      await deleteFlashcardSet(setId);
      setFlashcardSets(sets => sets.filter(set => set.id !== setId));
      toast({
        title: "Deleted",
        description: "Flashcard set deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed", 
        description: "Failed to delete flashcard set",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (studyingSet) {
    return (
      <StudySession
        dueCards={(studyingSet.flashcards || []).map((c: any) => ({
          card: {
            id: c.id,
            question: c.question,
            answer: c.answer,
            difficulty: c.difficulty ?? 0,
            studyCount: c.review_count ?? 0,
          } as any,
          setId: studyingSet.id,
          setTitle: studyingSet.title,
        }))}
        onComplete={() => {
          setStudyingSet(null);
          loadFlashcardSets();
        }}
        onBack={() => setStudyingSet(null)}
      />
    );
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Create New Flashcard Set</h1>
            <p className="text-muted-foreground">
              AI will generate 20 high-quality flashcards for your chosen topic
            </p>
          </div>
          
          <FlashcardForm
            onSuccess={() => {
              setShowForm(false);
              loadFlashcardSets();
            }}
          />
          
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Back to Flashcards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getDueForReview = (flashcards?: any[]) => {
    if (!flashcards) return 0;
    const today = new Date().toISOString().split('T')[0];
    return flashcards.filter(card => card.next_review_date <= today).length;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Flashcards</h1>
          <p className="text-muted-foreground">
            AI-powered flashcard sets for efficient studying
          </p>
        </div>
        <Button 
          variant="cta"
          onClick={() => setShowForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Set
        </Button>
      </div>

      {flashcardSets.length === 0 ? (
        <Card className="text-center p-8">
          <div className="space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-semibold">No Flashcard Sets Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first AI-generated flashcard set to start studying smarter.
              Our AI will generate 20 high-quality questions and answers for any topic.
            </p>
            <Button 
              variant="cta"
              onClick={() => setShowForm(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Set
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set) => {
            const dueCount = getDueForReview(set.flashcards);
            const totalCards = set.flashcards?.length || 0;
            
            return (
              <Card key={set.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold leading-tight">{set.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {set.subject}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(set.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Cards: <span className="font-medium">{totalCards}</span></span>
                    {dueCount > 0 && (
                      <span className="text-primary font-medium">
                        {dueCount} due for review
                      </span>
                    )}
                  </div>
                  
                  {set.exam_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Exam: {format(new Date(set.exam_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="cta"
                      size="sm"
                      onClick={() => setStudyingSet(set)}
                      className="flex-1 gap-2"
                      disabled={totalCards === 0}
                    >
                      <Play className="h-4 w-4" />
                      Study Now
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(set.created_at), 'MMM dd, yyyy')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}