export type AiMode = 'gemini' | 'local';

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
  importance?: string;
  context?: string;
}

export interface ChapterSummary {
  chapterNumber: number;
  title: string;
  summary: string;
  keyTakeaways: string[];
  definitions: DefinitionItem[];
  formulasOrRules?: string[];
}

export interface StudySummary {
  overview: string;
  chapters: ChapterSummary[];
  glossary: DefinitionItem[];
  studyTips?: string[];
  generatedWith: AiMode;
  generatedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  userAnswer?: number;
}

export interface ExamAttempt {
  id: string;
  completedAt: string;
  timeSpentSeconds: number;
  scorePercent: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  userAnswers: Record<string, number>;
  topicBreakdown: Record<string, { total: number; correct: number }>;
}

export interface PracticeExam {
  id: string;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  topicsCovered: string[];
  questions: QuizQuestion[];
  attempts: ExamAttempt[];
}

export interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadedAt: string;
  rawText: string;
  pages: DocumentPage[];
  summary: StudySummary | null;
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  exams: PracticeExam[];
  lastStudied: string;
  tags?: string[];
}

export interface UserStudyStats {
  streakDays: number;
  lastStudyDate: string;
  totalCardsReviewed: number;
  totalQuizzesTaken: number;
  totalExamsPassed: number;
  totalStudyMinutes: number;
}
