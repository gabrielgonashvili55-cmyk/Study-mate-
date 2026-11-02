/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DocumentViewer } from './components/DocumentViewer';
import { SummariesView } from './components/SummariesView';
import { QuizView } from './components/QuizView';
import { FlashcardsView } from './components/FlashcardsView';
import { ExamView } from './components/ExamView';
import { PdfUploadModal } from './components/PdfUploadModal';
import { SettingsModal } from './components/SettingsModal';
import {
  AiMode,
  ExamAttempt,
  Flashcard,
  PracticeExam,
  QuizQuestion,
  StudyDocument,
  UserStudyStats,
} from './types';
import {
  incrementStudyActivity,
  loadActiveDocumentId,
  loadAiMode,
  loadDocuments,
  loadTheme,
  loadUserStats,
  saveActiveDocumentId,
  saveAiMode,
  saveDocuments,
  saveTheme,
  saveUserStats,
} from './utils/storage';
import {
  requestExam,
  requestFlashcards,
  requestQuiz,
  requestSummary,
} from './utils/aiService';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';

export default function App() {
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<UserStudyStats>({
    streakDays: 3,
    lastStudyDate: new Date().toISOString().split('T')[0],
    totalCardsReviewed: 14,
    totalQuizzesTaken: 4,
    totalExamsPassed: 1,
    totalStudyMinutes: 48,
  });
  const [aiMode, setAiMode] = useState<AiMode>('gemini');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingAction, setGeneratingAction] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Initial load
  useEffect(() => {
    const loadedDocs = loadDocuments();
    setDocuments(loadedDocs);

    const savedDocId = loadActiveDocumentId(loadedDocs[0]?.id || '');
    setActiveDocId(savedDocId);

    setStats(loadUserStats());
    const initialAiMode = loadAiMode();
    setAiMode(initialAiMode);

    const initialTheme = loadTheme();
    setIsDark(initialTheme === 'dark');
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0] || null;

  const handleSelectDoc = (id: string) => {
    setActiveDocId(id);
    saveActiveDocumentId(id);
  };

  const handleToggleAiMode = () => {
    const next: AiMode = aiMode === 'gemini' ? 'local' : 'gemini';
    setAiMode(next);
    saveAiMode(next);
    showToast(
      next === 'gemini'
        ? 'Switched to Gemini 3.8 Flash Cloud AI'
        : 'Switched to On-Device Local AI (100% In-Browser & Private)',
      'info'
    );
  };

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    saveTheme(next);
  };

  const handleDocumentCreated = (newDoc: StudyDocument) => {
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveDocuments(updated);
    setActiveDocId(newDoc.id);
    saveActiveDocumentId(newDoc.id);
    setActiveTab('documents');
    showToast(`"${newDoc.title}" added (${newDoc.pageCount} pages extracted)!`);
  };

  const handleDeleteDoc = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveDocuments(updated);
    if (activeDocId === id) {
      const nextId = updated[0]?.id || '';
      setActiveDocId(nextId);
      saveActiveDocumentId(nextId);
    }
    showToast('Document removed', 'info');
  };

  const handleResetData = () => {
    setDocuments(SAMPLE_DOCUMENTS);
    saveDocuments(SAMPLE_DOCUMENTS);
    setActiveDocId(SAMPLE_DOCUMENTS[0].id);
    saveActiveDocumentId(SAMPLE_DOCUMENTS[0].id);
    const initialStats = {
      streakDays: 3,
      lastStudyDate: new Date().toISOString().split('T')[0],
      totalCardsReviewed: 14,
      totalQuizzesTaken: 4,
      totalExamsPassed: 1,
      totalStudyMinutes: 48,
    };
    setStats(initialStats);
    saveUserStats(initialStats);
    showToast('Reset to default course guides and stats.', 'info');
  };

  // AI Generation Handlers
  const handleGenerateSummary = async (doc: StudyDocument) => {
    try {
      setIsGenerating(true);
      setGeneratingAction('summary');
      const { summary, usedMode, notice } = await requestSummary(doc.title, doc.rawText, aiMode);

      const updatedDoc: StudyDocument = {
        ...doc,
        summary,
        lastStudied: new Date().toISOString(),
      };

      const updatedDocs = documents.map((d) => (d.id === doc.id ? updatedDoc : d));
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      setActiveTab('summaries');

      showToast(
        notice ||
          `Summary generated with ${summary.chapters.length} chapters and ${summary.glossary.length} definitions!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to generate summary', 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const handleGenerateQuiz = async (
    doc: StudyDocument,
    count = 5,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ) => {
    try {
      setIsGenerating(true);
      setGeneratingAction('quiz');
      const { questions, usedMode, notice } = await requestQuiz(doc.rawText, count, difficulty, aiMode);

      const updatedDoc: StudyDocument = {
        ...doc,
        quizzes: questions,
        lastStudied: new Date().toISOString(),
      };

      const updatedDocs = documents.map((d) => (d.id === doc.id ? updatedDoc : d));
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      setActiveTab('quizzes');

      showToast(notice || `Generated ${questions.length} quiz questions!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to generate quiz', 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const handleGenerateFlashcards = async (doc: StudyDocument, count = 10) => {
    try {
      setIsGenerating(true);
      setGeneratingAction('flashcards');
      const { flashcards, usedMode, notice } = await requestFlashcards(doc.rawText, count, aiMode);

      const existingIds = new Set(doc.flashcards.map((c) => c.front.toLowerCase()));
      const newOnly = flashcards.filter((c) => !existingIds.has(c.front.toLowerCase()));
      const combined = [...doc.flashcards, ...newOnly];

      const updatedDoc: StudyDocument = {
        ...doc,
        flashcards: combined,
        lastStudied: new Date().toISOString(),
      };

      const updatedDocs = documents.map((d) => (d.id === doc.id ? updatedDoc : d));
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      setActiveTab('flashcards');

      showToast(notice || `Created ${flashcards.length} new flashcards!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to generate flashcards', 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const handleGenerateExam = async (doc: StudyDocument, questionCount = 10, timeLimitMinutes = 15) => {
    try {
      setIsGenerating(true);
      setGeneratingAction('exam');
      const { exam, usedMode, notice } = await requestExam(
        doc.title,
        doc.rawText,
        questionCount,
        timeLimitMinutes,
        aiMode
      );

      const updatedDoc: StudyDocument = {
        ...doc,
        exams: [exam, ...(doc.exams || [])],
        lastStudied: new Date().toISOString(),
      };

      const updatedDocs = documents.map((d) => (d.id === doc.id ? updatedDoc : d));
      setDocuments(updatedDocs);
      saveDocuments(updatedDocs);
      setActiveTab('exam');

      showToast(notice || `Constructed practice exam with ${exam.questions.length} questions!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to generate exam', 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingAction(null);
    }
  };

  const handleQuizCompleted = (correctCount: number, total: number) => {
    incrementStudyActivity('quiz', 1);
    setStats(loadUserStats());
  };

  const handleExamCompleted = (examId: string, attempt: ExamAttempt) => {
    if (!activeDoc) return;
    const updatedExams = (activeDoc.exams || []).map((e) => {
      if (e.id === examId) {
        return {
          ...e,
          attempts: [attempt, ...e.attempts],
        };
      }
      return e;
    });

    const updatedDoc: StudyDocument = {
      ...activeDoc,
      exams: updatedExams,
    };

    const updatedDocs = documents.map((d) => (d.id === activeDoc.id ? updatedDoc : d));
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);

    if (attempt.passed) {
      incrementStudyActivity('exam', 1);
    }
    setStats(loadUserStats());
  };

  const handleUpdateFlashcardStatus = (cardId: string, status: 'new' | 'learning' | 'mastered') => {
    if (!activeDoc) return;
    const updatedCards = activeDoc.flashcards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          status,
          reviewCount: c.reviewCount + 1,
          lastReviewed: new Date().toISOString(),
        };
      }
      return c;
    });

    const updatedDoc: StudyDocument = {
      ...activeDoc,
      flashcards: updatedCards,
    };

    const updatedDocs = documents.map((d) => (d.id === activeDoc.id ? updatedDoc : d));
    setDocuments(updatedDocs);
    saveDocuments(updatedDocs);

    incrementStudyActivity('card', 1);
    setStats(loadUserStats());
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDoc={activeDoc}
        documents={documents}
        onSelectDoc={handleSelectDoc}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        aiMode={aiMode}
        onToggleAiMode={handleToggleAiMode}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        stats={stats}
      />

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            documents={documents}
            activeDoc={activeDoc}
            onSelectDoc={handleSelectDoc}
            onNavigateTab={setActiveTab}
            onOpenUpload={() => setIsUploadOpen(true)}
            stats={stats}
            aiMode={aiMode}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentViewer
            document={activeDoc}
            documents={documents}
            onSelectDoc={handleSelectDoc}
            onDeleteDoc={handleDeleteDoc}
            onOpenUpload={() => setIsUploadOpen(true)}
            onGenerateSummary={handleGenerateSummary}
            onGenerateQuiz={(doc) => handleGenerateQuiz(doc, 5, 'mixed')}
            onGenerateFlashcards={(doc) => handleGenerateFlashcards(doc, 10)}
            onGenerateExam={(doc) => handleGenerateExam(doc, 10, 15)}
            isGenerating={isGenerating}
            generatingAction={generatingAction}
            aiMode={aiMode}
          />
        )}

        {activeTab === 'summaries' && (
          <SummariesView
            document={activeDoc}
            onGenerateSummary={handleGenerateSummary}
            onNavigateToQuiz={() => setActiveTab('quizzes')}
            isGenerating={isGenerating}
            aiMode={aiMode}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizView
            document={activeDoc}
            onGenerateQuiz={handleGenerateQuiz}
            onQuizCompleted={handleQuizCompleted}
            isGenerating={isGenerating}
            aiMode={aiMode}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            document={activeDoc}
            onGenerateFlashcards={handleGenerateFlashcards}
            onUpdateFlashcardStatus={handleUpdateFlashcardStatus}
            isGenerating={isGenerating}
            aiMode={aiMode}
          />
        )}

        {activeTab === 'exam' && (
          <ExamView
            document={activeDoc}
            onGenerateExam={handleGenerateExam}
            onExamCompleted={handleExamCompleted}
            isGenerating={isGenerating}
            aiMode={aiMode}
          />
        )}
      </main>

      {/* Global PDF Upload Modal */}
      <PdfUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentCreated={handleDocumentCreated}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiMode={aiMode}
        onSelectAiMode={(m) => {
          setAiMode(m);
          saveAiMode(m);
        }}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onResetData={handleResetData}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl text-xs font-semibold max-w-md">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 dark:text-indigo-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
