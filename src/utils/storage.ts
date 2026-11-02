import {
  AiMode,
  ExamAttempt,
  Flashcard,
  PracticeExam,
  QuizQuestion,
  StudyDocument,
  StudySummary,
  UserStudyStats,
} from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

const STORAGE_KEYS = {
  DOCUMENTS: 'studymate_documents_v1',
  ACTIVE_DOC_ID: 'studymate_active_doc_id',
  STATS: 'studymate_user_stats',
  AI_MODE: 'studymate_ai_mode',
  THEME: 'studymate_theme',
};

export function loadDocuments(): StudyDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      saveDocuments(SAMPLE_DOCUMENTS);
      return SAMPLE_DOCUMENTS;
    }
    const docs = JSON.parse(raw);
    return Array.isArray(docs) && docs.length > 0 ? docs : SAMPLE_DOCUMENTS;
  } catch (e) {
    console.error('Error loading documents from localStorage:', e);
    return SAMPLE_DOCUMENTS;
  }
}

export function saveDocuments(documents: StudyDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  } catch (e) {
    console.error('Error saving documents to localStorage:', e);
  }
}

export function loadActiveDocumentId(defaultId?: string): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
    return saved || defaultId || '';
  } catch {
    return defaultId || '';
  }
}

export function saveActiveDocumentId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
  } catch (e) {
    console.error(e);
  }
}

export function loadUserStats(): UserStudyStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      const initial: UserStudyStats = {
        streakDays: 3,
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalCardsReviewed: 14,
        totalQuizzesTaken: 4,
        totalExamsPassed: 1,
        totalStudyMinutes: 48,
      };
      saveUserStats(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return {
      streakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      totalCardsReviewed: 0,
      totalQuizzesTaken: 0,
      totalExamsPassed: 0,
      totalStudyMinutes: 0,
    };
  }
}

export function saveUserStats(stats: UserStudyStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error(e);
  }
}

export function incrementStudyActivity(type: 'card' | 'quiz' | 'exam' | 'minutes', count = 1): void {
  const stats = loadUserStats();
  const today = new Date().toISOString().split('T')[0];

  if (stats.lastStudyDate !== today) {
    const lastDate = new Date(stats.lastStudyDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      stats.streakDays += 1;
    } else if (diffDays > 1) {
      stats.streakDays = 1;
    }
    stats.lastStudyDate = today;
  }

  if (type === 'card') stats.totalCardsReviewed += count;
  if (type === 'quiz') stats.totalQuizzesTaken += count;
  if (type === 'exam') stats.totalExamsPassed += count;
  if (type === 'minutes') stats.totalStudyMinutes += count;

  saveUserStats(stats);
}

export function loadAiMode(): AiMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_MODE);
    return (raw === 'local' ? 'local' : 'gemini') as AiMode;
  } catch {
    return 'gemini';
  }
}

export function saveAiMode(mode: AiMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_MODE, mode);
  } catch (e) {
    console.error(e);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'light' || raw === 'dark') return raw;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error(e);
  }
}
