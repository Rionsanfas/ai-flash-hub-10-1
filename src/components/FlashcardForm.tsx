import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFlashcardSet, generateFlashcards } from '@/lib/supabase-flashcards';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';

interface FlashcardFormProps {
  onSuccess: () => void;
}

export const FlashcardForm = ({ onSuccess }: FlashcardFormProps) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and subject.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate flashcards using OpenAI
      const flashcards = await generateFlashcards(subject, 20);
      
      // Create flashcard set with generated cards
      await createFlashcardSet(title, subject, examDate, flashcards);
      
      toast({
        title: "Success! 🎉",
        description: `Generated ${flashcards.length} flashcards for ${subject}`,
      });
      
      setTitle('');
      setSubject('');
      setExamDate('');
      onSuccess();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Flashcards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Set Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biology - Cell Division"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject/Topic</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Cell Division, Mitosis, Meiosis"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date (Optional)</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="cta"
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating 20 Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate 20 Flashcards
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};