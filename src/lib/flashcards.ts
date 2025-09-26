export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  lastStudied?: string;
  nextReview?: string;
  studyCount: number;
  mastered: boolean;
  easeFactor: number; // For spaced repetition algorithm
  interval: number; // Days until next review
}

export interface FlashcardSet {
  id: string;
  title: string;
  subject: string;
  description?: string;
  examDate?: string;
  createdAt: string;
  updatedAt: string;
  flashcards: Flashcard[];
  userId: string;
}

export interface StudyStats {
  totalFlashcards: number;
  studiedToday: number;
  masteredCount: number;
  streakDays: number;
  averageScore: number;
  dueForReview: number;
  upcomingReviews: number;
}

export const generateFlashcardsAI = async (subject: string, topic: string, text?: string, numCards: number = 20): Promise<Flashcard[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create a more structured prompt for AI generation
  const contextText = text ? ` Additional context: ${text.substring(0, 300)}` : '';
  const prompt = `Generate exactly ${numCards} high-quality flashcards for ${subject} - ${topic}.${contextText}
  
Format: Q&A pairs focusing on key concepts, definitions, processes, and applications.
Difficulty: Mix of easy, medium, and hard questions.
Style: Clear, concise questions with comprehensive answers.`;

  console.log('AI Prompt:', prompt);
  
  // Enhanced flashcard templates for various subjects
  const templates = {
    biology: [
      { q: "What is cell division and why is it important?", a: "Cell division is the process by which a single cell divides to form two or more daughter cells. It's essential for growth, development, tissue repair, and reproduction in living organisms." },
      { q: "What are the main phases of mitosis?", a: "The four main phases are: Prophase (chromosomes condense), Metaphase (chromosomes align at center), Anaphase (chromatids separate), and Telophase (nuclear envelopes reform)." },
      { q: "What is the difference between mitosis and meiosis?", a: "Mitosis produces two identical diploid cells for growth and repair, while meiosis produces four genetically different haploid gametes for sexual reproduction." },
      { q: "What happens during cytokinesis?", a: "Cytokinesis is the physical division of the cytoplasm that follows nuclear division, resulting in two separate daughter cells." },
      { q: "What is a chromosome?", a: "A chromosome is a structure containing DNA and proteins that carries genetic information in the form of genes." },
      { q: "What role do spindle fibers play in cell division?", a: "Spindle fibers attach to chromosomes and help move them to opposite ends of the cell during anaphase." },
      { q: "What is the cell cycle?", a: "The cell cycle is the series of events that cells go through as they grow and divide, consisting of interphase (G1, S, G2) and mitosis (M phase)." },
      { q: "What happens during prophase?", a: "During prophase, chromatin condenses into visible chromosomes, the nuclear envelope breaks down, and the mitotic spindle begins to form." },
      { q: "What is a centromere?", a: "A centromere is the region of a chromosome where sister chromatids are joined and where spindle fibers attach during cell division." },
      { q: "What are sister chromatids?", a: "Sister chromatids are identical copies of a chromosome that are joined at the centromere and separated during cell division." }
    ],
    chemistry: [
      { q: "What is an ionic bond?", a: "A chemical bond formed between oppositely charged ions through electrostatic attraction, typically between metals and non-metals." },
      { q: "How does the periodic table organize elements?", a: "Elements are arranged by increasing atomic number, with similar properties recurring periodically in groups and periods." },
      { q: "What is pH and how is it measured?", a: "pH measures hydrogen ion concentration on a scale of 0-14, where 7 is neutral, <7 is acidic, and >7 is basic." },
      { q: "What is a covalent bond?", a: "A chemical bond formed when atoms share electrons to achieve stable electron configurations." },
      { q: "What is an acid?", a: "An acid is a substance that donates hydrogen ions (H+) in aqueous solution, lowering the pH." }
    ],
    mathematics: [
      { q: "What is the derivative of x² and how do you find it?", a: "The derivative of x² is 2x, found using the power rule: d/dx[xⁿ] = nxⁿ⁻¹" },
      { q: "What is the fundamental theorem of calculus?", a: "It connects differentiation and integration, stating that integration and differentiation are inverse operations." },
      { q: "How do you apply the chain rule?", a: "For composite functions f(g(x)), the derivative is f'(g(x)) · g'(x) - multiply the outer derivative by the inner derivative." },
      { q: "What is a limit in calculus?", a: "A limit describes the value a function approaches as the input approaches a specific value." },
      { q: "What is integration?", a: "Integration is the reverse process of differentiation, used to find the area under curves and solve differential equations." }
    ],
    physics: [
      { q: "State Newton's First Law of Motion", a: "An object at rest stays at rest and an object in motion stays in motion at constant velocity unless acted upon by a net external force." },
      { q: "What is the formula for kinetic energy?", a: "KE = ½mv², where m is mass and v is velocity." },
      { q: "What is the difference between speed and velocity?", a: "Speed is a scalar quantity (magnitude only), while velocity is a vector quantity (magnitude and direction)." }
    ],
    history: [
      { q: "When did World War II officially end?", a: "World War II officially ended on September 2, 1945, with Japan's formal surrender aboard the USS Missouri." },
      { q: "Who was the first President of the United States?", a: "George Washington served as the first President from 1789 to 1797 and set many precedents for the office." }
    ]
  };

  // Get subject-specific templates or default ones
  const subjectKey = subject.toLowerCase() as keyof typeof templates;
  const subjectTemplates = templates[subjectKey] || templates.biology;
  
  // Enhanced generation with more topic-specific content
  const topicSpecificCards = generateTopicSpecificCards(topic.toLowerCase(), subject);
  const allCards = [...subjectTemplates, ...topicSpecificCards];
  
  // Generate exact number of cards requested
  const selectedCards = [];
  
  for (let i = 0; i < numCards; i++) {
    const template = allCards[i % allCards.length];
    const cardNumber = i + 1;
    
    selectedCards.push({
      id: `${Date.now()}-${Math.random()}-${i}`,
      question: template.q + (i >= allCards.length ? ` (Advanced #${cardNumber})` : ''),
      answer: template.a,
      subject,
      difficulty: i < numCards * 0.3 ? 'easy' : i < numCards * 0.7 ? 'medium' : 'hard',
      createdAt: new Date().toISOString(),
      studyCount: 0,
      mastered: false,
      easeFactor: 2.5,
      interval: 1,
      nextReview: new Date().toISOString()
    });
  }

  console.log(`Generated ${selectedCards.length} flashcards for ${subject} - ${topic}`);
  return selectedCards;
};

// Generate intelligent topic-specific flashcards
const generateTopicSpecificCards = (topic: string, subject: string): { q: string; a: string }[] => {
  const topicCards = [];
  
  // Biology - Cell Division specific
  if (topic.includes('cell') || topic.includes('division') || topic.includes('mitosis') || topic.includes('meiosis')) {
    topicCards.push(
      { q: `How does ${topic} contribute to organism growth?`, a: `${topic} allows organisms to grow by producing new cells to replace old ones and add to existing tissues.` },
      { q: `What are the key checkpoints in ${topic}?`, a: `Key checkpoints ensure DNA is properly replicated and chromosomes are correctly attached before division proceeds.` },
      { q: `How is ${topic} regulated in the cell?`, a: `${topic} is regulated by cyclins, cyclin-dependent kinases, and checkpoint proteins that control cell cycle progression.` },
      { q: `What happens if ${topic} goes wrong?`, a: `Errors in ${topic} can lead to cancer, birth defects, or cell death due to uncontrolled division or chromosome abnormalities.` },
      { q: `How does ${topic} differ between plant and animal cells?`, a: `Plant cells form a cell plate during cytokinesis while animal cells form a cleavage furrow due to structural differences.` }
    );
  }
  
  // Mathematics - Calculus specific  
  if (topic.includes('calculus') || topic.includes('derivative') || topic.includes('integral')) {
    topicCards.push(
      { q: `What real-world applications use ${topic}?`, a: `${topic} is used in physics for motion analysis, economics for optimization, and engineering for system design.` },
      { q: `What are the fundamental concepts in ${topic}?`, a: `${topic} focuses on rates of change, areas under curves, and the relationship between differentiation and integration.` },
      { q: `How do you solve problems involving ${topic}?`, a: `Start by identifying the type of problem, choose the appropriate technique, apply the rules systematically, and verify your answer.` }
    );
  }
  
  // General academic cards
  topicCards.push(
    { q: `What are the main learning objectives for ${topic}?`, a: `Students should understand key concepts, apply knowledge to solve problems, and make connections to related topics.` },
    { q: `How can you best study ${topic}?`, a: `Use active recall, spaced repetition, practice problems, and teach the concepts to others to reinforce understanding.` },
    { q: `What common mistakes do students make with ${topic}?`, a: `Common mistakes include rushing through problems, not understanding underlying principles, and failing to check work for errors.` }
  );
  
  return topicCards;
};

// Enhanced generation with more topic-specific content
const generateTopicSpecificFlashcards = (subject: string, topic: string, text?: string): Flashcard[] => {
  const topicCards: Flashcard[] = [];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard'];
  
  // Create varied question types
  const questionTypes = [
    { type: 'definition', template: `What is ${topic}?` },
    { type: 'application', template: `How is ${topic} applied in real-world scenarios?` },
    { type: 'comparison', template: `How does ${topic} compare to related concepts?` },
    { type: 'analysis', template: `What are the key components of ${topic}?` },
    { type: 'synthesis', template: `How does ${topic} connect to broader themes in ${subject}?` },
    { type: 'evaluation', template: `What are the strengths and limitations of ${topic}?` },
    { type: 'example', template: `Provide an example of ${topic} in practice.` }
  ];

  // Generate varied answers based on subject
  const subjectSpecificAnswers: Record<string, Record<string, string>> = {
    mathematics: {
      definition: `${topic} is a mathematical concept involving precise calculations and logical reasoning.`,
      application: `${topic} is used in engineering, physics, computer science, and financial modeling.`,
      analysis: `Key components include fundamental principles, formulas, proofs, and practical applications.`,
      example: `A common example involves step-by-step problem solving with clear mathematical notation.`
    },
    science: {
      definition: `${topic} is a scientific principle based on empirical observation and experimentation.`,
      application: `${topic} has applications in research, medicine, technology, and environmental studies.`,
      analysis: `Key elements include hypothesis formation, experimental design, data collection, and analysis.`,
      example: `Laboratory experiments and field studies demonstrate ${topic} in controlled conditions.`
    },
    history: {
      definition: `${topic} refers to significant historical events, figures, or movements that shaped civilization.`,
      application: `Understanding ${topic} provides context for modern political, social, and cultural developments.`,
      analysis: `Key aspects include causes, key figures, timeline, and lasting consequences.`,
      example: `Historical documents, artifacts, and primary sources provide evidence of ${topic}.`
    }
  };

  const answers = subjectSpecificAnswers[subject.toLowerCase()] || {
    definition: `${topic} is an important concept in ${subject} that requires careful study and understanding.`,
    application: `${topic} has practical applications in various fields and real-world situations.`,
    analysis: `Key aspects of ${topic} include its fundamental principles and broader implications.`,
    example: `Examples of ${topic} can be found in academic literature and practical applications.`
  };

  // Generate 4-7 topic-specific cards
  const numCards = Math.floor(Math.random() * 4) + 4; // 4-7 cards
  for (let i = 0; i < numCards; i++) {
    const questionType = questionTypes[i % questionTypes.length];
    const difficulty = difficulties[i % difficulties.length];
    
    topicCards.push({
      id: `${Date.now()}-topic-${i}`,
      question: questionType.template,
      answer: answers[questionType.type] || answers.definition,
      subject: subject,
      difficulty,
      createdAt: new Date().toISOString(),
      studyCount: 0,
      mastered: false,
      easeFactor: 2.5,
      interval: 1
    });
  }

  return topicCards;
};

// Adapt base questions to be more topic-specific
const adaptQuestionToTopic = (baseQuestion: string, topic: string, subject: string): string => {
  const adaptations: Record<string, (q: string, t: string) => string> = {
    mathematics: (q, t) => q.replace(/general|basic/, t).replace(/concept/, `${t} concept`),
    science: (q, t) => q.replace(/principle/, `${t} principle`).replace(/theory/, `${t} theory`),
    history: (q, t) => q.replace(/event/, `${t} event`).replace(/period/, `${t} period`),
    general: (q, t) => `${t}: ${q}`
  };

  const adapter = adaptations[subject.toLowerCase()] || adaptations.general;
  return adapter(baseQuestion, topic);
};

// Local storage functions
export const saveFlashcardSet = (flashcardSet: FlashcardSet): void => {
  const sets = getFlashcardSets();
  const existingIndex = sets.findIndex(set => set.id === flashcardSet.id);
  
  if (existingIndex >= 0) {
    sets[existingIndex] = { ...flashcardSet, updatedAt: new Date().toISOString() };
  } else {
    sets.push(flashcardSet);
  }
  
  localStorage.setItem('flashcard_sets', JSON.stringify(sets));
};

export const getFlashcardSets = (userId?: string): FlashcardSet[] => {
  try {
    const sets = JSON.parse(localStorage.getItem('flashcard_sets') || '[]');
    return userId ? sets.filter((set: FlashcardSet) => set.userId === userId) : sets;
  } catch {
    return [];
  }
};

export const deleteFlashcardSet = (setId: string): void => {
  const sets = getFlashcardSets().filter(set => set.id !== setId);
  localStorage.setItem('flashcard_sets', JSON.stringify(sets));
};

export const updateFlashcard = (setId: string, flashcardId: string, updates: Partial<Flashcard>): void => {
  const sets = getFlashcardSets();
  const setIndex = sets.findIndex(set => set.id === setId);
  
  if (setIndex >= 0) {
    const cardIndex = sets[setIndex].flashcards.findIndex(card => card.id === flashcardId);
    if (cardIndex >= 0) {
      sets[setIndex].flashcards[cardIndex] = { ...sets[setIndex].flashcards[cardIndex], ...updates };
      sets[setIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('flashcard_sets', JSON.stringify(sets));
    }
  }
};

// Spaced repetition algorithm (simplified SM-2)
export const calculateNextReview = (
  card: Flashcard, 
  quality: number, // 0-5 rating (0=wrong, 5=perfect)
  examDate?: string
): { nextReview: string; interval: number; easeFactor: number } => {
  let { easeFactor, interval } = card;
  
  // Adjust ease factor based on quality
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  // Calculate next interval
  if (quality < 3) {
    interval = 1; // Start over if failed
  } else {
    interval = card.studyCount === 0 ? 1 : card.studyCount === 1 ? 6 : Math.round(interval * easeFactor);
  }
  
  // Adjust for exam date if provided
  if (examDate) {
    const daysUntilExam = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExam > 0 && interval > daysUntilExam / 3) {
      interval = Math.max(1, Math.floor(daysUntilExam / 3));
    }
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  
  return {
    nextReview: nextReview.toISOString(),
    interval,
    easeFactor
  };
};

export const getDueFlashcards = (userId: string): { card: Flashcard; setId: string; setTitle: string }[] => {
  const sets = getFlashcardSets(userId);
  const dueCards: { card: Flashcard; setId: string; setTitle: string }[] = [];
  const now = new Date();
  
  sets.forEach(set => {
    set.flashcards.forEach(card => {
      const nextReview = card.nextReview ? new Date(card.nextReview) : new Date(card.createdAt);
      if (nextReview <= now && !card.mastered) {
        dueCards.push({ card, setId: set.id, setTitle: set.title });
      }
    });
  });
  
  return dueCards.sort((a, b) => {
    const aNext = new Date(a.card.nextReview || a.card.createdAt);
    const bNext = new Date(b.card.nextReview || b.card.createdAt);
    return aNext.getTime() - bNext.getTime();
  });
};

// Spaced repetition - Mark flashcard progress
export const updateFlashcardProgress = (cardId: string, isCorrect: boolean, difficulty: 'easy' | 'medium' | 'hard'): void => {
  // Convert response quality to SM-2 algorithm scale (0-5)
  const quality = isCorrect ? (difficulty === 'easy' ? 5 : difficulty === 'medium' ? 4 : 3) : (difficulty === 'hard' ? 1 : 0);
  
  const sets = getFlashcardSets();
  
  sets.forEach((set, setIndex) => {
    const cardIndex = set.flashcards.findIndex(card => card.id === cardId);
    if (cardIndex >= 0) {
      const card = set.flashcards[cardIndex];
      const { nextReview, interval, easeFactor } = calculateNextReview(card, quality, set.examDate);
      
      sets[setIndex].flashcards[cardIndex] = {
        ...card,
        lastStudied: new Date().toISOString(),
        nextReview,
        interval,
        easeFactor,
        studyCount: card.studyCount + 1,
        mastered: quality >= 4 && card.studyCount >= 2 // Mark as mastered after 3 good reviews
      };
      
      sets[setIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('flashcard_sets', JSON.stringify(sets));
    }
  });
};

export const getStudyStats = (userId: string): StudyStats => {
  const sets = getFlashcardSets(userId);
  const allCards = sets.flatMap(set => set.flashcards);
  const dueCards = getDueFlashcards(userId);
  
  const today = new Date().toDateString();
  const studiedToday = allCards.filter(card => 
    card.lastStudied && new Date(card.lastStudied).toDateString() === today
  ).length;
  
  const masteredCount = allCards.filter(card => card.mastered).length;
  const totalStudyCount = allCards.reduce((sum, card) => sum + card.studyCount, 0);
  const averageScore = allCards.length > 0 ? (masteredCount / allCards.length) * 100 : 0;
  
  // Calculate upcoming reviews (next 3 days)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const upcomingReviews = allCards.filter(card => {
    if (!card.nextReview || card.mastered) return false;
    const nextReview = new Date(card.nextReview);
    const now = new Date();
    return nextReview > now && nextReview <= threeDaysFromNow;
  }).length;
  
  return {
    totalFlashcards: allCards.length,
    studiedToday,
    masteredCount,
    streakDays: 0, // Would need more complex logic to track streaks
    averageScore: Math.round(averageScore),
    dueForReview: dueCards.length,
    upcomingReviews
  };
};

// Get comprehensive history data
export interface HistoryData {
  totalSets: number;
  totalCards: number;
  allSubjects: string[];
  studyHistory: {
    date: string;
    cardsStudied: number;
    setsActive: number;
  }[];
  subjectProgress: {
    subject: string;
    totalCards: number;
    masteredCards: number;
    progressPercent: number;
  }[];
  recentActivity: {
    type: 'created' | 'studied' | 'mastered';
    item: string;
    subject: string;
    date: string;
  }[];
}

export const getComprehensiveHistory = (userId: string): HistoryData => {
  const sets = getFlashcardSets(userId);
  const allCards = sets.flatMap(set => set.flashcards);
  
  // Get all unique subjects
  const allSubjects = Array.from(new Set(sets.map(set => set.subject))).filter(Boolean);
  
  // Calculate subject progress
  const subjectProgress = allSubjects.map(subject => {
    const subjectCards = allCards.filter(card => card.subject === subject);
    const masteredCards = subjectCards.filter(card => card.mastered);
    return {
      subject,
      totalCards: subjectCards.length,
      masteredCards: masteredCards.length,
      progressPercent: subjectCards.length > 0 ? Math.round((masteredCards.length / subjectCards.length) * 100) : 0
    };
  });
  
  // Generate study history for last 7 days (simplified)
  const studyHistory = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    const cardsStudied = allCards.filter(card => 
      card.lastStudied && new Date(card.lastStudied).toDateString() === dateString
    ).length;
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      cardsStudied,
      setsActive: Math.min(sets.length, cardsStudied > 0 ? Math.ceil(cardsStudied / 5) : 0)
    };
  }).reverse();
  
  // Recent activity (last 10 activities)
  const recentActivity: HistoryData['recentActivity'] = [];
  
  // Add set creation activities
  sets.forEach(set => {
    recentActivity.push({
      type: 'created',
      item: set.title,
      subject: set.subject,
      date: set.createdAt
    });
  });
  
  // Add study activities
  allCards.forEach(card => {
    if (card.lastStudied) {
      recentActivity.push({
        type: 'studied',
        item: card.question.substring(0, 50) + (card.question.length > 50 ? '...' : ''),
        subject: card.subject,
        date: card.lastStudied
      });
    }
    if (card.mastered) {
      recentActivity.push({
        type: 'mastered',
        item: card.question.substring(0, 50) + (card.question.length > 50 ? '...' : ''),
        subject: card.subject,
        date: card.lastStudied || card.createdAt
      });
    }
  });
  
  // Sort by date and take last 10
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return {
    totalSets: sets.length,
    totalCards: allCards.length,
    allSubjects,
    studyHistory,
    subjectProgress,
    recentActivity: recentActivity.slice(0, 10)
  };
};

export const studyFlashcard = (setId: string, flashcardId: string, quality: number): void => {
  const sets = getFlashcardSets();
  const setIndex = sets.findIndex(set => set.id === setId);

  if (setIndex >= 0) {
    const cardIndex = sets[setIndex].flashcards.findIndex(card => card.id === flashcardId);
    if (cardIndex >= 0) {
      const card = sets[setIndex].flashcards[cardIndex];
      const examDate = sets[setIndex].examDate;
      const { nextReview, interval, easeFactor } = calculateNextReview(card, quality, examDate);

      sets[setIndex].flashcards[cardIndex] = {
        ...card,
        lastStudied: new Date().toISOString(),
        nextReview,
        interval,
        easeFactor,
        studyCount: card.studyCount + 1,
        mastered: quality >= 4 && card.studyCount >= 2
      };

      sets[setIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('flashcard_sets', JSON.stringify(sets));
    }
  }
};