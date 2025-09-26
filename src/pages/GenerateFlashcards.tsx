import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/header';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { Chat, createChat, getChats, deleteChat } from '@/lib/supabase-chat';
import { User } from '@supabase/supabase-js';

const GenerateFlashcards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'ai-chat'>('generate');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState(''); // Add text input state
  const [inputType, setInputType] = useState<'file' | 'text'>('file'); // Toggle between file and text
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [studyMode, setStudyMode] = useState<'quiz' | 'spaced-repetition'>('quiz');
  const [uploading, setUploading] = useState(false);
  const [remainingFlashcards, setRemainingFlashcards] = useState<number | null>(null);
  const [remainingTokens, setRemainingTokens] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  // Add chat states
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndUsage();
  }, []);

  const fetchUserAndUsage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUser(user);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();

      const userPlan = profile?.plan || 'starter';
      setPlan(userPlan);

      // Flashcard usage
      const { data: flashUsage } = await supabase
        .from('user_flashcard_usage')
        .select('flashcards_used_this_month')
        .eq('user_id', user.id)
        .single();

      const flashLimits = { starter: 500, pro: 1250, premium: 2500 };
      const flashUsed = flashUsage?.flashcards_used_this_month || 0;
      setRemainingFlashcards(flashLimits[userPlan] - flashUsed);

      // Token usage
      const { data: tokenUsage } = await supabase
        .from('user_tokens_usage')
        .select('tokens_used_this_month')
        .eq('user_id', user.id)
        .single();

      const tokenLimits = { starter: 20, pro: 50, premium: Infinity };
      const tokenUsed = tokenUsage?.tokens_used_this_month || 0;
      const tokenLimit = tokenLimits[userPlan as keyof typeof tokenLimits];
      setRemainingTokens(tokenLimit === Infinity ? Infinity : tokenLimit - tokenUsed);
    } catch (error) {
      console.error('Failed to fetch usage');
      toast.error('Failed to fetch usage limits');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!file && !textContent.trim()) || !user) {
      toast.error('Please select a file or enter text and ensure you are logged in');
      return;
    }

    if (remainingFlashcards !== null && remainingFlashcards < 25) {
      toast.error(`Insufficient flashcard quota. You have ${remainingFlashcards} left this month.`);
      return;
    }

    // For text, no upload tokens needed
    if (inputType === 'file' && file) {
      const MB_IN_BYTES = 1024 * 1024;
      const tokensNeeded = Math.ceil(file.size / (10 * MB_IN_BYTES));
      if (remainingTokens !== null && remainingTokens !== Infinity && remainingTokens < tokensNeeded) {
        toast.error(`Insufficient tokens for upload. File requires ${tokensNeeded} tokens, you have ${remainingTokens} remaining.`);
        return;
      }
    }

    setUploading(true);

    try {
      let invokeBody: any = { difficulty, studyMode };
      if (inputType === 'file' && file) {
        // Upload file logic
        const bucket = 'user-uploads';
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        invokeBody.fileName = filePath;
        invokeBody.bucket = bucket;
        invokeBody.fileSize = file.size;
      } else if (inputType === 'text') {
        invokeBody.text = textContent.trim();
      }

      const { data, error: invokeError } = await supabase.functions.invoke('generate-flashcards', {
        body: invokeBody,
        headers: {
          Authorization: `Bearer ${user.access_token}`
        }
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Flashcards generated successfully!');
      setTextContent(''); // Clear text
      setFile(null);
      navigate(`/review-flashcards?setId=${data.setId}`);
      fetchUserAndUsage(); // Refresh usage
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  // Add chat logic from AIChat
  useEffect(() => {
    if (activeTab === 'ai-chat') {
      const loadChatData = async () => {
        const { data: { user: chatUser } } = await supabase.auth.getUser();
        if (!chatUser) {
          navigate('/login');
          return;
        }
        setUser(chatUser);
        try {
          const userChats = await getChats();
          setChats(userChats);
          if (userChats.length > 0 && !currentChat) {
            setCurrentChat(userChats[0]);
          }
        } catch (error) {
          console.error('Error loading chats:', error);
        }
        setChatLoading(false);
      };
      loadChatData();
    } else {
      fetchUserAndUsage();
    }
  }, [activeTab]);

  const handleNewChat = async (subject: string = 'general') => {
    if (!user) return;
    try {
      const newChat = await createChat(subject);
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
        const remainingChats = chats.filter(c => c.id !== chatId);
        setCurrentChat(remainingChats.length > 0 ? remainingChats[0] : null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const refreshChats = async () => {
    if (user) {
      const userChats = await getChats();
      setChats(userChats);
    }
  };

  if (chatLoading && activeTab === 'ai-chat') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isAuthenticated={!!user} user={{ name: userName, email: user?.email || '' }} />
      
      <div className="flex-1 pt-16">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'generate' | 'ai-chat')} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Generate Flashcards
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              AI Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="pt-4 flex-1">
            <div className="container mx-auto py-8">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>Generate Flashcards</CardTitle>
                  <CardDescription>
                    Upload a file or enter text to create 25 AI-generated flashcards.
                    {user ? (
                      <>
                        Plan: {plan} | Flashcards Remaining: {remainingFlashcards} | Tokens Remaining: {remainingTokens === Infinity ? 'Unlimited' : remainingTokens}
                      </>
                    ) : (
                      <p>Please log in to continue.</p>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Input
                            type="radio"
                            checked={inputType === 'file'}
                            onChange={() => setInputType('file')}
                          />
                          Upload File (PDF, Image, Video, Text)
                        </Label>
                        {inputType === 'file' && (
                          <Input
                            type="file"
                            accept=".pdf,image/*,video/*,text/*,.txt,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        )}
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Input
                            type="radio"
                            checked={inputType === 'text'}
                            onChange={() => setInputType('text')}
                          />
                          Enter Text Directly
                        </Label>
                        {inputType === 'text' && (
                          <Textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Paste your study text here..."
                            rows={8}
                            disabled={uploading}
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="studyMode">Study Mode</Label>
                        <Select value={studyMode} onValueChange={(value) => setStudyMode(value as any)}>
                          <SelectTrigger id="studyMode">
                            <SelectValue placeholder="Select study mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="spaced-repetition">Spaced Repetition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={uploading || (remainingFlashcards !== null && remainingFlashcards < 25) || (!file && !textContent.trim())} 
                        className="w-full"
                      >
                        {uploading ? 'Generating...' : 'Generate Flashcards'}
                      </Button>
                    </form>
                  ) : (
                    <Button asChild>
                      <Link to="/login">Log In to Generate Flashcards</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-chat" className="flex-1 flex">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex h-full">
                {/* Sidebar */}
                <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex-shrink-0 hidden lg:block`}>
                  <ChatSidebar
                    chats={chats}
                    currentChatId={currentChat?.id || null}
                    onChatSelect={handleChatSelect}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                    user={{ name: userName, email: user?.email || '' }}
                    isCollapsed={sidebarCollapsed}
                  />
                </div>

                {/* Mobile Sidebar */}
                <div className={`lg:hidden fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ${
                  sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
                }`}>
                  <ChatSidebar
                    chats={chats}
                    currentChatId={currentChat?.id || null}
                    onChatSelect={handleChatSelect}
                    onNewChat={handleNewChat}
                    onDeleteChat={handleDeleteChat}
                    user={{ name: userName, email: user?.email || '' }}
                  />
                </div>

                {/* Mobile Overlay */}
                {!sidebarCollapsed && (
                  <div 
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarCollapsed(true)}
                  />
                )}

                {/* Chat Interface */}
                <ChatInterface
                  chat={currentChat}
                  onBack={() => {}} // No back in tab
                  onToggleSidebar={toggleSidebar}
                  user={user}
                  onMessageSent={refreshChats}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GenerateFlashcards;