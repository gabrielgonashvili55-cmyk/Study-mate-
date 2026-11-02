import {
  AiMode,
  Flashcard,
  PracticeExam,
  QuizQuestion,
  StudySummary,
} from '../types';
import {
  generateLocalExam,
  generateLocalFlashcards,
  generateLocalQuiz,
  generateLocalSummary,
} from './localAiEngine';

export interface AiServiceStatus {
  geminiAvailable: boolean;
  model: string;
  localFallbackSupported: boolean;
}

export async function checkAiStatus(): Promise<AiServiceStatus> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status failed');
    return await res.json();
  } catch (e) {
    return {
      geminiAvailable: false,
      model: 'local-heuristic-nlp',
      localFallbackSupported: true,
    };
  }
}

/**
 * Generates comprehensive summaries with Gemini or Local AI
 */
export async function requestSummary(
  documentTitle: string,
  text: string,
  mode: AiMode = 'gemini'
): Promise<{ summary: StudySummary; usedMode: AiMode; notice?: string }> {
  if (mode === 'gemini') {
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: documentTitle, text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      return {
        summary: {
          overview: data.overview || '',
          chapters: data.chapters || [],
          glossary: data.glossary || [],
          studyTips: data.studyTips || [],
          generatedWith: 'gemini',
          generatedAt: new Date().toISOString(),
        },
        usedMode: 'gemini',
      };
    } catch (err: any) {
      console.warn('Gemini summarization failed, falling back seamlessly to Local Device Engine:', err);
      const localSummary = generateLocalSummary(documentTitle, text);
      return {
        summary: localSummary,
        usedMode: 'local',
        notice: `Cloud AI unavailable (${err.message || 'Network/Quota'}). Generated via On-Device Engine.`,
      };
    }
  }

  // Pure local mode
  const localSummary = generateLocalSummary(documentTitle, text);
  return {
    summary: localSummary,
    usedMode: 'local',
  };
}

/**
 * Generates multiple choice quiz questions
 */
export async function requestQuiz(
  text: string,
  count = 5,
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed',
  mode: AiMode = 'gemini',
  topic?: string
): Promise<{ questions: QuizQuestion[]; usedMode: AiMode; notice?: string }> {
  if (mode === 'gemini') {
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count, difficulty, topic }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const questions: QuizQuestion[] = await response.json();
      return {
        questions,
        usedMode: 'gemini',
      };
    } catch (err: any) {
      console.warn('Gemini quiz generation failed, falling back to Local Engine:', err);
      const localQuestions = generateLocalQuiz(text, count, difficulty);
      return {
        questions: localQuestions,
        usedMode: 'local',
        notice: `Generated via On-Device AI (${err.message || 'Fallback mode'}).`,
      };
    }
  }

  const localQuestions = generateLocalQuiz(text, count, difficulty);
  return {
    questions: localQuestions,
    usedMode: 'local',
  };
}

/**
 * Generates flashcards with active recall and hints
 */
export async function requestFlashcards(
  text: string,
  count = 10,
  mode: AiMode = 'gemini',
  category?: string
): Promise<{ flashcards: Flashcard[]; usedMode: AiMode; notice?: string }> {
  if (mode === 'gemini') {
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count, category }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const rawCards = await response.json();
      const flashcards: Flashcard[] = rawCards.map((c: any, i: number) => ({
        id: c.id || `card-${i + 1}-${Date.now()}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        category: c.category || 'General',
        difficulty: c.difficulty || 'medium',
        status: 'new',
        reviewCount: 0,
      }));

      return {
        flashcards,
        usedMode: 'gemini',
      };
    } catch (err: any) {
      console.warn('Gemini flashcard generation failed, falling back to Local Engine:', err);
      const localCards = generateLocalFlashcards(text, count);
      return {
        flashcards: localCards,
        usedMode: 'local',
        notice: `Generated via On-Device AI.`,
      };
    }
  }

  const localCards = generateLocalFlashcards(text, count);
  return {
    flashcards: localCards,
    usedMode: 'local',
  };
}

/**
 * Generates realistic practice exams
 */
export async function requestExam(
  documentTitle: string,
  text: string,
  questionCount = 10,
  timeLimitMinutes = 20,
  mode: AiMode = 'gemini'
): Promise<{ exam: PracticeExam; usedMode: AiMode; notice?: string }> {
  if (mode === 'gemini') {
    try {
      const response = await fetch('/api/ai/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${documentTitle} Practice Examination`,
          text,
          questionCount,
          timeLimitMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const exam: PracticeExam = {
        id: `exam-${Date.now()}`,
        title: data.title || `${documentTitle} Examination`,
        description: data.description || 'Standardized practice examination to test comprehensive mastery.',
        timeLimitMinutes: data.timeLimitMinutes || timeLimitMinutes,
        passingScorePercent: data.passingScorePercent || 70,
        topicsCovered: data.topicsCovered || ['Core Curriculum'],
        questions: data.questions || [],
        attempts: [],
      };

      return {
        exam,
        usedMode: 'gemini',
      };
    } catch (err: any) {
      console.warn('Gemini exam generation failed, falling back to Local Engine:', err);
      const localExam = generateLocalExam(documentTitle, text, questionCount, timeLimitMinutes);
      return {
        exam: localExam,
        usedMode: 'local',
        notice: `Generated via On-Device AI.`,
      };
    }
  }

  const localExam = generateLocalExam(documentTitle, text, questionCount, timeLimitMinutes);
  return {
    exam: localExam,
    usedMode: 'local',
  };
}
