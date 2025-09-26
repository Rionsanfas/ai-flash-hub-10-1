import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { Chat, createChat, getChats, deleteChat } from '@/lib/supabase-chat';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AIChat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      await loadChats();
      setLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/login');
        } else if (session?.user) {
          setUser(session.user);
          await loadChats();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadChats = async () => {
    try {
      const userChats = await getChats();
      setChats(userChats);
      
      // Auto-select the most recent chat if exists
      if (userChats.length > 0 && !currentChat) {
        setCurrentChat(userChats[0]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

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

  const handleBack = () => {
    navigate('/dashboard');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Refresh chats when messages change
  const refreshChats = async () => {
    if (user) {
      await loadChats();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isAuthenticated={true} user={{ name: user.email?.split('@')[0] || 'User', email: user.email || '' }} />
      
      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 flex-shrink-0 hidden lg:block`}>
          <ChatSidebar
            chats={chats}
            currentChatId={currentChat?.id || null}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            user={{ name: user.email?.split('@')[0] || 'User', email: user.email || '' }}
            isCollapsed={sidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <div className={`lg:hidden fixed inset-y-16 left-0 z-40 w-80 transform transition-transform duration-300 ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <ChatSidebar
            chats={chats}
            currentChatId={currentChat?.id || null}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            user={{ name: user.email?.split('@')[0] || 'User', email: user.email || '' }}
          />
        </div>

        {/* Mobile Overlay Background */}
        {!sidebarCollapsed && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            chat={currentChat}
            onBack={handleBack}
            onToggleSidebar={toggleSidebar}
            user={user}
            onMessageSent={refreshChats}
          />
        </div>
      </div>
    </div>
  );
}