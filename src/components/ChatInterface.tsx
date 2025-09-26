import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { ChatMessage, generateAIResponse, addMessage } from '@/lib/supabase-chat';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  chat: any;
  onBack: () => void;
  onToggleSidebar: () => void;
  user: any;
  isLoading?: boolean;
  onMessageSent?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chat,
  onBack,
  onToggleSidebar,
  user,
  isLoading = false,
  onMessageSent
}) => {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.chat_messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating || !chat) return;

    const messageText = input.trim();
    setInput('');
    setIsGenerating(true);

    try {
      // Add user message
      await addMessage(chat.id, 'user', messageText);
      
      // Refresh chat data
      if (onMessageSent) onMessageSent();
      
      // Generate AI response
      const aiResponse = await generateAIResponse(messageText, chat.id, chat.subject);
      
      // Add AI message
      await addMessage(chat.id, 'assistant', aiResponse);
      
      // Refresh chat data again
      if (onMessageSent) onMessageSent();
      
      toast({
        title: "Response generated",
        description: "AI has responded to your message.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
      setInput(messageText); // Restore input on error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard.",
    });
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex <= 0 || !chat) return;
    
    const messages = chat.chat_messages || [];
    const userMessage = messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    setIsGenerating(true);
    try {
      const newResponse = await generateAIResponse(userMessage.content, chat.id, chat.subject);
      await addMessage(chat.id, 'assistant', newResponse);
      
      // Refresh chat data
      if (onMessageSent) onMessageSent();
      
      toast({
        title: "Response regenerated",
        description: "New AI response has been generated.",
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate response.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Welcome to AI Study Assistant</h3>
          <p className="text-muted-foreground">
            Select a chat from the sidebar or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  const messages = chat.chat_messages || [];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar} className="lg:hidden">
            <Menu className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
            <h2 className="font-semibold truncate">{chat.title}</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {chat.subject} • {messages.length} messages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
              <p className="text-muted-foreground mb-6">
                Ask me anything about {chat.subject}. I can help with explanations, 
                create practice questions, and reference your flashcards.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                {[
                  "Explain a concept",
                  "Create practice questions", 
                  "Review my flashcards",
                  "Study strategies"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message: ChatMessage, index: number) => (
              <div key={message.id} className={`flex gap-4 animate-fade-in ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <Card 
                    className={`p-4 ${
                      message.role === 'user' 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-3 pt-2 border-t border-border/50 ${
                      message.role === 'user' ? 'justify-end' : 'justify-between'
                    }`}>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        {message.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateResponse(index)}
                            className="h-6 w-6 p-0"
                            disabled={isGenerating}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))
          )}
          
          {isGenerating && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <Card className="bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your studies..."
              className="min-h-[60px] max-h-[200px] pr-16 resize-none"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{input.length}/2000</span>
          </div>
        </div>
      </div>
    </div>
  );
};