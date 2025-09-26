import { getFlashcardSets } from '../lib/flashcards';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Enhanced AI response generation with flashcard context
export const generateAIResponse = async (message: string, chat: Chat, userId: string): Promise<string> => {
  // Simulate API delay for realistic AI experience
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const userFlashcards = getFlashcardSets(userId);
  const relatedFlashcards = userFlashcards.filter(set => 
    set.subject.toLowerCase().includes(chat.subject.toLowerCase()) ||
    chat.subject.toLowerCase().includes(set.subject.toLowerCase())
  );

  // Create enhanced context from user's flashcards
  let flashcardContext = '';
  let flashcardQuestions = [];
  
  if (relatedFlashcards.length > 0) {
    const recentSet = relatedFlashcards[0];
    const sampleCards = recentSet.flashcards.slice(0, 5);
    flashcardContext = `\n\n📚 **Your Study Progress**: I can see you've been studying ${recentSet.subject} with your "${recentSet.title}" flashcard set (${recentSet.flashcards.length} cards). You're making great progress!`;
    flashcardQuestions = sampleCards.map(card => ({ question: card.question, answer: card.answer }));
  }

  // Enhanced prompt structure for better AI simulation
  const prompt = `
Role: AI Study Tutor for ${chat.subject}
User Message: "${message}"
Available Flashcards: ${flashcardQuestions.length} related cards
Context: Help student with ${chat.subject} concepts, quizzing, and study strategies
Response Style: Engaging, educational, supportive
`;

  console.log('AI Chat Prompt:', prompt);

  const lowerMessage = message.toLowerCase();
  const lowerSubject = chat.subject.toLowerCase();

  // Enhanced quiz generation with flashcard integration
  if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('question')) {
    if (flashcardQuestions.length > 0) {
      // Use actual flashcard content for quizzing
      const randomCard = flashcardQuestions[Math.floor(Math.random() * flashcardQuestions.length)];
      return `Perfect! Let's quiz you using your own flashcards! 🎯\n\n**Question:**\n${randomCard.question}\n\n*Take your time to think through this. I'll wait for your answer before revealing the correct response.*\n\n${flashcardContext}\n\n💡 **Tip**: Try to explain your reasoning - it helps with retention!`;
    } else {
      // Generate subject-specific quiz questions
      const quizResponses = {
        biology: [
          `Excellent! Let's test your ${chat.subject} knowledge! 🧬\n\n**Question 1:** During which phase of mitosis do the chromosomes align at the cell's equator?\n\nA) Prophase\nB) Metaphase\nC) Anaphase\nD) Telophase\n\nThink carefully about chromosome movement during division!`,
          
          `Great! Quiz mode activated for ${chat.subject}! 🔬\n\n**Question:** Explain the main difference between prokaryotic and eukaryotic cells. Include at least two specific examples of each type.\n\n*This is an open-ended question - take your time to provide a thorough answer!*`,
          
          `Perfect timing for a ${chat.subject} quiz! 🌱\n\n**Scenario Question:** A plant cell is undergoing photosynthesis. Describe the inputs, outputs, and location of this process. How does this differ from cellular respiration?\n\n*Think about the energy transformations involved!*`
        ],
        mathematics: [
          `Awesome! Let's challenge your ${chat.subject} skills! 📐\n\n**Problem:** Find the derivative of f(x) = 3x² + 2x - 5\n\nShow your work step by step and explain which rules you're applying!\n\n*Remember the power rule and constant rule!*`,
          
          `Great! Math quiz time! 🔢\n\n**Question:** What is the limit of (x² - 4)/(x - 2) as x approaches 2?\n\nA) 0\nB) 2\nC) 4\nD) The limit does not exist\n\nHint: Can you factor the numerator?`,
          
          `Excellent! Let's test your calculus understanding! 📊\n\n**Conceptual Question:** Explain the relationship between a function and its derivative. What does the derivative tell us about the original function?\n\n*Think about slopes, rates of change, and graphical interpretations!*`
        ]
      };
      
      const subjectKey = lowerSubject.includes('math') || lowerSubject.includes('calculus') ? 'mathematics' : 'biology';
      const questions = quizResponses[subjectKey] || quizResponses.biology;
      return questions[Math.floor(Math.random() * questions.length)] + flashcardContext;
    }
  }

  // Enhanced explanation responses with flashcard references
  if (lowerMessage.includes('explain') || lowerMessage.includes('help') || lowerMessage.includes('understand')) {
    const helpResponses = [
      `I'd love to help you understand ${chat.subject} better! 🎓${flashcardContext}\n\n**I can help you with:**\n• 🔍 **Deep explanations** of complex concepts\n• 🧩 **Breaking down** difficult topics into manageable parts\n• 🔗 **Connecting** different concepts together\n• 💡 **Real-world applications** and examples\n• 🎯 **Study strategies** tailored to your needs\n\nWhat specific concept would you like me to explain? The more specific you are, the better I can help!`,
      
      `Absolutely! I'm here to make ${chat.subject} concepts crystal clear! ✨${flashcardContext}\n\n**My teaching approach:**\n1. Start with the big picture\n2. Break it into digestible steps\n3. Use analogies and examples\n4. Check your understanding\n5. Connect to what you already know\n\nWhat topic is giving you trouble? Let's tackle it together!`,
      
      `Of course! Understanding is my specialty! 🌟${flashcardContext}\n\n**Let me know if you need:**\n• Step-by-step breakdowns\n• Visual descriptions of processes\n• Analogies to everyday situations\n• Practice with worked examples\n• Clarification of confusing terms\n\nWhat ${chat.subject} concept should we explore first?`
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }

  // Enhanced study strategy responses
  if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('practice') || lowerMessage.includes('prepare')) {
    const studyResponses = [
      `Fantastic question about studying ${chat.subject}! 📚${flashcardContext}\n\n**Proven Study Techniques:**\n🎯 **Active Recall**: Test yourself regularly (like using your flashcards!)\n⏰ **Spaced Repetition**: Review at increasing intervals\n🗺️ **Concept Mapping**: Visualize connections between ideas\n📝 **Teaching Method**: Explain concepts to yourself or others\n🔄 **Interleaving**: Mix different topics in study sessions\n\n**For ${chat.subject} specifically**, I recommend focusing on understanding processes rather than memorizing facts. Would you like specific study tips for any particular topic?`,
      
      `Excellent approach to learning! 🚀${flashcardContext}\n\n**My recommended study plan for ${chat.subject}:**\n\n**Phase 1**: Build foundation (understand basic concepts)\n**Phase 2**: Make connections (see how concepts relate)\n**Phase 3**: Apply knowledge (solve problems, answer questions)\n**Phase 4**: Teach others (explain concepts aloud)\n\n**Daily routine**: 20 minutes of flashcard review + 30 minutes of new material + 10 minutes of self-testing\n\nWhat's your current study routine like? I can help optimize it!`,
      
      `Smart thinking about study strategies! 🧠${flashcardContext}\n\n**Evidence-based techniques for ${chat.subject}:**\n\n• **Elaborative Interrogation**: Always ask "Why?" and "How?"\n• **Self-Explanation**: Describe your thinking process\n• **Distributed Practice**: Spread learning over time\n• **Retrieval Practice**: Quiz yourself without looking at notes\n• **Dual Coding**: Use both visual and verbal learning\n\n**Quick tip**: Since you have flashcards, try the "explain-check-elaborate" method - explain the answer before flipping, then elaborate on what you missed!\n\nWant to practice any of these techniques right now?`
    ];
    return studyResponses[Math.floor(Math.random() * studyResponses.length)];
  }

  // Subject-specific enhanced responses
  if (lowerSubject.includes('biology') || lowerSubject.includes('cell')) {
    const biologyResponses = [
      `Fascinating ${chat.subject} topic! 🧬${flashcardContext}\n\n**Key Insight**: Cell division isn't just splitting in half - it's an incredibly orchestrated process involving thousands of molecular players working in perfect coordination!\n\n**Think about it**: Every time a cell divides, it must:\n• Duplicate its entire genome perfectly\n• Organize and separate chromosomes\n• Coordinate protein synthesis\n• Divide organelles fairly\n• Maintain proper size and structure\n\nIt's like a microscopic ballet performed trillions of times in your body! What aspect of cellular biology interests you most?`,
      
      `Great question about ${chat.subject}! 🔬${flashcardContext}\n\n**Biological Principle**: Form follows function - every structure in biology has evolved for a specific purpose!\n\nFor example:\n• Mitochondria have folded inner membranes (cristae) to maximize surface area for ATP production\n• Root hairs increase surface area for nutrient absorption\n• Red blood cells lose their nuclei to maximize space for oxygen-carrying hemoglobin\n\n**Study tip**: When learning about any biological structure, always ask "What does this do and how does its shape help it do that job?"\n\nWhat biological structures or processes would you like to explore?`,
      
      `Excellent ${chat.subject} discussion! 🌱${flashcardContext}\n\n**Big Picture Thinking**: Biology is all about information flow - from genes to proteins to cellular functions to organism behavior!\n\n**The Central Dogma**: DNA → RNA → Protein → Function\n\nBut it's more complex than that linear flow:\n• Environmental signals modify gene expression\n• Proteins can regulate their own production\n• Cells communicate and coordinate with each other\n• Organisms adapt to changing conditions\n\nUnderstanding these connections helps you see biology as an integrated system rather than isolated facts. What biological connections would you like to explore?`
    ];
    return biologyResponses[Math.floor(Math.random() * biologyResponses.length)];
  }

  if (lowerSubject.includes('math') || lowerSubject.includes('calculus')) {
    const mathResponses = [
      `Excellent ${chat.subject} question! 📐${flashcardContext}\n\n**Mathematical Insight**: Calculus is the mathematics of change and motion - it helps us understand how quantities relate to each other as they vary!\n\n**Key Concepts:**\n• **Derivatives**: Instantaneous rate of change (like speedometer reading)\n• **Integrals**: Accumulation of change (like odometer reading)\n• **Limits**: What happens as we approach a value (the foundation of it all)\n\n**Real-world applications**: From modeling population growth to optimizing business profits to predicting planetary orbits!\n\n**Study approach**: Don't just memorize formulas - understand what they represent and when to use them. What calculus concept would you like to master?`,
      
      `Great ${chat.subject} thinking! 🔢${flashcardContext}\n\n**Mathematical Problem-Solving Strategy:**\n1. **Understand**: What is the problem really asking?\n2. **Plan**: What tools and techniques apply here?\n3. **Execute**: Carry out your plan step by step\n4. **Check**: Does your answer make sense?\n5. **Reflect**: What did you learn? How could you apply this elsewhere?\n\n**Tip**: Mathematics builds on itself - if you're stuck, check if you understand the prerequisite concepts. Often the issue is a gap in earlier material, not the current topic!\n\nWhat mathematical concept would you like to work through together?`,
      
      `Fantastic ${chat.subject} exploration! 📊${flashcardContext}\n\n**Mathematical Beauty**: Math isn't just calculation - it's pattern recognition, logical reasoning, and creative problem-solving!\n\n**Consider this**: The same mathematical concepts appear everywhere:\n• Exponential functions model population growth AND radioactive decay\n• Sine waves describe sound, light, and pendulum motion\n• Derivatives optimize everything from rocket trajectories to pizza delivery routes\n\n**Learning tip**: Look for patterns and connections. When you see a new problem type, ask "What does this remind me of?" Often, you already have the tools you need!\n\nWhat mathematical patterns or connections interest you most?`
    ];
    return mathResponses[Math.floor(Math.random() * mathResponses.length)];
  }

  // Enhanced default responses
  const defaultResponses = [
    `That's a thoughtful question about ${chat.subject}! 💭${flashcardContext}\n\n**I'm here to be your study companion!** I can help you:\n\n🎯 **Master concepts** through clear explanations\n🧩 **Solve problems** step by step\n📝 **Create practice questions** tailored to your level\n🔄 **Review material** in different ways\n💡 **Develop study strategies** that work for you\n\n**Interactive learning works best!** Feel free to:\n• Ask me to explain anything you're confused about\n• Request practice problems or quizzes\n• Share what you're working on for personalized help\n• Challenge me with tough questions!\n\nWhat would be most helpful for your ${chat.subject} studies right now?`,
    
    `Great to be studying ${chat.subject} together! 🌟${flashcardContext}\n\n**Learning Philosophy**: The best learning happens through active engagement - asking questions, making connections, and applying knowledge!\n\n**I adapt to your learning style:**\n• Need visual explanations? I'll paint word pictures\n• Prefer step-by-step breakdowns? I'll go methodically\n• Like real-world examples? I'll connect concepts to life\n• Want challenging problems? Bring it on!\n\n**Remember**: Making mistakes is part of learning! Don't hesitate to ask if something doesn't make sense.\n\nHow can I best support your understanding of ${chat.subject} today?`,
    
    `Wonderful to discuss ${chat.subject} with you! 🚀${flashcardContext}\n\n**Study Success Formula**: Curiosity + Practice + Reflection = Mastery!\n\n**My role as your AI tutor:**\n• Provide clear, accurate explanations\n• Offer multiple perspectives on concepts\n• Create engaging practice opportunities\n• Help you build confidence in your abilities\n• Celebrate your progress along the way!\n\n**Your role**: Stay curious, ask questions, and don't be afraid to dive deep into topics that interest you!\n\nWhat aspect of ${chat.subject} sparks your curiosity most?`
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Local storage functions
export const saveChat = (chat: Chat): void => {
  const chats = getChats();
  const existingIndex = chats.findIndex(c => c.id === chat.id);
  
  if (existingIndex >= 0) {
    chats[existingIndex] = { ...chat, updatedAt: new Date().toISOString() };
  } else {
    chats.push(chat);
  }
  
  localStorage.setItem('ai_chats', JSON.stringify(chats));
};

export const getChats = (userId?: string): Chat[] => {
  try {
    const chats = JSON.parse(localStorage.getItem('ai_chats') || '[]');
    return userId ? chats.filter((chat: Chat) => chat.userId === userId) : chats;
  } catch {
    return [];
  }
};

export const deleteChat = (chatId: string): void => {
  const chats = getChats().filter(chat => chat.id !== chatId);
  localStorage.setItem('ai_chats', JSON.stringify(chats));
};

export const addMessage = (chatId: string, message: ChatMessage): void => {
  const chats = getChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex >= 0) {
    chats[chatIndex].messages.push(message);
    chats[chatIndex].updatedAt = new Date().toISOString();
    
    // Update title if this is the first user message
    if (chats[chatIndex].messages.filter(m => m.role === 'user').length === 1) {
      chats[chatIndex].title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
    }
    
    localStorage.setItem('ai_chats', JSON.stringify(chats));
  }
};

export const createNewChat = (userId: string, subject: string = 'general'): Chat => {
  const newChat: Chat = {
    id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: 'New Chat',
    subject,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId
  };
  
  return newChat;
};

// Get comprehensive chat history data
export interface ChatHistoryData {
  totalChats: number;
  totalMessages: number;
  chatsBySubject: {
    subject: string;
    count: number;
    lastUsed: string;
  }[];
  recentActivity: {
    chatId: string;
    chatTitle: string;
    subject: string;
    lastMessage: string;
    timestamp: string;
  }[];
  chatStats: {
    averageMessagesPerChat: number;
    mostActiveSubject: string;
    weeklyActivity: {
      date: string;
      chatsCreated: number;
      messagesExchanged: number;
    }[];
  };
}

export const getChatHistory = (userId: string): ChatHistoryData => {
  const chats = getChats(userId);
  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
  
  // Group chats by subject
  const subjectGroups = chats.reduce((acc, chat) => {
    const subject = chat.subject || 'general';
    if (!acc[subject]) {
      acc[subject] = { count: 0, lastUsed: chat.updatedAt };
    }
    acc[subject].count++;
    if (new Date(chat.updatedAt) > new Date(acc[subject].lastUsed)) {
      acc[subject].lastUsed = chat.updatedAt;
    }
    return acc;
  }, {} as Record<string, { count: number; lastUsed: string }>);
  
  const chatsBySubject = Object.entries(subjectGroups)
    .map(([subject, data]) => ({
      subject,
      count: data.count,
      lastUsed: data.lastUsed
    }))
    .sort((a, b) => b.count - a.count);
  
  // Recent activity (last 5 chats with activity)
  const recentActivity = chats
    .filter(chat => chat.messages.length > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(chat => ({
      chatId: chat.id,
      chatTitle: chat.title,
      subject: chat.subject,
      lastMessage: chat.messages[chat.messages.length - 1]?.content.substring(0, 100) || '',
      timestamp: chat.updatedAt
    }));
  
  // Weekly activity (last 7 days)
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const chatsCreated = chats.filter(chat => 
      new Date(chat.createdAt).toDateString() === dateString
    ).length;
    
    const messagesExchanged = chats.reduce((sum, chat) => {
      return sum + chat.messages.filter(msg => 
        new Date(msg.timestamp).toDateString() === dateString
      ).length;
    }, 0);
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      chatsCreated,
      messagesExchanged
    };
  }).reverse();
  
  const mostActiveSubject = chatsBySubject.length > 0 ? chatsBySubject[0].subject : 'general';
  const averageMessagesPerChat = chats.length > 0 ? Math.round(totalMessages / chats.length) : 0;
  
  return {
    totalChats: chats.length,
    totalMessages,
    chatsBySubject,
    recentActivity,
    chatStats: {
      averageMessagesPerChat,
      mostActiveSubject,
      weeklyActivity
    }
  };
};