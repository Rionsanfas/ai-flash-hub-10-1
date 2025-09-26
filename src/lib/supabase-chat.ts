import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
  chat_messages?: ChatMessage[];
}

export const createChat = async (subject: string): Promise<Chat> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      title: 'New Chat',
      subject,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getChats = async (): Promise<Chat[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      user_id,
      title,
      subject,
      created_at,
      updated_at,
      chat_messages (
        id,
        chat_id,
        role,
        content,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as Chat[] || [];
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      user_id,
      title,
      subject,
      created_at,
      updated_at,
      chat_messages (
        id,
        chat_id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', chatId)
    .single();

  if (error) return null;
  return data as Chat;
};

export const addMessage = async (
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  // Update chat title if this is the first user message
  if (role === 'user') {
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('chat_id', chatId)
      .eq('role', 'user');

    if (messages?.length === 1) {
      await supabase
        .from('chats')
        .update({
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);
    }
  }

  return data as ChatMessage;
};

export const generateAIResponse = async (
  message: string,
  chatId: string,
  subject: string
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      message,
      chatId,
      subject,
      userId: user.id,
    },
  });

  if (error) throw error;
  return data.response;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) throw error;
};