import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Edit3,
  BookOpen,
  Brain,
  Calculator,
  FlaskConical,
  Clock
} from 'lucide-react';
import { Chat } from '@/lib/supabase-chat';
import { useToast } from '../hooks/use-toast';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: (subject?: string) => void;
  onDeleteChat: (chatId: string) => void;
  user: any;
  isCollapsed?: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  user,
  isCollapsed = false
}) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const subjects = [
    { name: 'General', icon: Brain, color: 'text-primary' },
    { name: 'Mathematics', icon: Calculator, color: 'text-blue-500' },
    { name: 'Science', icon: FlaskConical, color: 'text-green-500' },
    { name: 'History', icon: BookOpen, color: 'text-amber-500' }
  ];

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(chatId);
      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history.",
      });
    }
  };

  const handleEditTitle = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveTitle = (chatId: string) => {
    // TODO: Implement title update in storage
    setEditingChatId(null);
    toast({
      title: "Title updated",
      description: "Chat title has been updated.",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getSubjectIcon = (subject: string) => {
    const subjectData = subjects.find(s => s.name.toLowerCase() === subject.toLowerCase());
    return subjectData || subjects[0];
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-muted/50 border-r border-border flex flex-col items-center py-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNewChat()}
          className="w-10 h-10 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
        {filteredChats.slice(0, 8).map((chat) => {
          const SubjectIcon = getSubjectIcon(chat.subject).icon;
          return (
            <Button
              key={chat.id}
              variant={currentChatId === chat.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onChatSelect(chat)}
              className="w-10 h-10 p-0"
            >
              <SubjectIcon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-80 bg-muted/50 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">AI Study Assistant</h2>
        </div>
        
        <Button 
          onClick={() => onNewChat()} 
          className="w-full justify-start gap-2 mb-4"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        {/* Quick Subject Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {subjects.map((subject) => (
            <Button
              key={subject.name}
              variant="ghost"
              size="sm"
              onClick={() => onNewChat(subject.name.toLowerCase())}
              className="justify-start gap-2 text-xs h-8"
            >
              <subject.icon className={`w-3 h-3 ${subject.color}`} />
              {subject.name}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs">Start a conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => {
                const SubjectIcon = getSubjectIcon(chat.subject).icon;
                const isActive = currentChatId === chat.id;
                
                return (
                  <div
                    key={chat.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                      isActive ? 'bg-accent/70 shadow-sm' : ''
                    }`}
                    onClick={() => onChatSelect(chat)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        isActive ? 'from-primary/20 to-accent/20' : 'from-muted to-muted'
                      } flex items-center justify-center flex-shrink-0`}>
                        <SubjectIcon className={`w-4 h-4 ${getSubjectIcon(chat.subject).color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveTitle(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(chat.id);
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <p className="font-medium text-sm truncate leading-tight">
                              {chat.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground capitalize">
                                {chat.subject}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                               <span className="text-xs text-muted-foreground flex items-center gap-1">
                                 <Clock className="w-3 h-3" />
                                 {formatTime(chat.updated_at)}
                               </span>
                             </div>
                             {chat.chat_messages && chat.chat_messages.length > 0 && (
                               <p className="text-xs text-muted-foreground truncate mt-1">
                                 {chat.chat_messages[chat.chat_messages.length - 1].content}
                               </p>
                             )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditTitle(chat, e)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};