import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";
import Flashcards from "./pages/Flashcards";
import AIChat from "./pages/AIChat";
import GenerateFlashcards from "./pages/GenerateFlashcards";
import ReviewFlashcards from "./pages/ReviewFlashcards";
import NotFound from "./pages/NotFound";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    }).catch(() => {
      setIsAuthenticated(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-foreground">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider defaultTheme="system" storageKey="quizora-theme">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/generate-flashcards" element={
                <ProtectedRoute>
                  <GenerateFlashcards />
                </ProtectedRoute>
              } />
              <Route path="/review-flashcards" element={
                <ProtectedRoute>
                  <ReviewFlashcards />
                </ProtectedRoute>
              } />
              <Route path="/flashcards" element={
                <ProtectedRoute>
                  <Flashcards />
                </ProtectedRoute>
              } />
              <Route path="/ai-chat" element={
                <ProtectedRoute>
                  <AIChat />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;