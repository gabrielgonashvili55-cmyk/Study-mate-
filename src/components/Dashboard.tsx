import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Flame,
  GraduationCap,
  HelpCircle,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { AiMode, StudyDocument, UserStudyStats } from '../types';

interface DashboardProps {
  documents: StudyDocument[];
  activeDoc: StudyDocument | null;
  onSelectDoc: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenUpload: () => void;
  stats: UserStudyStats;
  aiMode: AiMode;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  onNavigateTab,
  onOpenUpload,
  stats,
  aiMode,
}) => {
  // Aggregate statistics
  const totalCards = documents.reduce((acc, d) => acc + d.flashcards.length, 0);
  const masteredCards = documents.reduce(
    (acc, d) => acc + d.flashcards.filter((c) => c.status === 'mastered').length,
    0
  );
  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const totalQuizzes = documents.reduce((acc, d) => acc + d.quizzes.length, 0);
  const totalExams = documents.reduce((acc, d) => acc + d.exams.length, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-10 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-xs">
            {aiMode === 'gemini' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Powered by Gemini 3.8 Flash & Local Engine</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-emerald-300" />
                <span>On-Device Local AI Mode (Zero Cost & Private)</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Master your study materials with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              deep AI comprehension
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Upload PDFs from textbooks, syllabus notes, or lecture slides. Extract comprehensive chapter summaries,
            practice multiple-choice quizzes, flip active recall cards, and simulate realistic exams.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Upload PDF Document</span>
            </button>

            {activeDoc && (
              <button
                onClick={() => onNavigateTab('summaries')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white text-sm font-semibold border border-indigo-400/40 backdrop-blur-xs transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Study "{activeDoc.title.slice(0, 24)}..."</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.streakDays} Days</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Study Streak</div>
          </div>
        </div>

        {/* Mastered Cards */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {masteredCards}/{totalCards}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Cards Mastered ({masteryPercentage}%)
            </div>
          </div>
        </div>

        {/* Quizzes Taken */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalQuizzesTaken}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Quizzes Completed</div>
          </div>
        </div>

        {/* Exams Passed */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalExamsPassed}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Exams Mastered</div>
          </div>
        </div>
      </div>

      {/* Primary Study Tools Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Core Study Suites</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Targeting: <strong className="text-slate-700 dark:text-slate-200">{activeDoc?.title || 'No doc selected'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Summaries */}
          <div
            onClick={() => onNavigateTab('summaries')}
            className="group cursor-pointer p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              AI Summaries
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              In-depth chapter breakdowns, highlighted definitions, and core takeaway principles.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Read summaries</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* AI Quizzes */}
          <div
            onClick={() => onNavigateTab('quizzes')}
            className="group cursor-pointer p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-600 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              AI Quizzes
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Multiple-choice questions with answer keys and in-depth conceptual explanations.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400">
              <span>Take a quiz</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Flashcards */}
          <div
            onClick={() => onNavigateTab('flashcards')}
            className="group cursor-pointer p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Flashcards
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interactive 3D flip cards with Leitner spaced repetition to cement core terminology.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span>Flip flashcards</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Exam Mode */}
          <div
            onClick={() => onNavigateTab('exam')}
            className="group cursor-pointer p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Practice Exam Mode
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full timed diagnostic exams with score reporting, passing thresholds, and review.
            </p>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Simulate exam</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Your Documents Library */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Study Materials</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uploaded PDFs and academic reading guides stored locally in your browser.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const isSelected = activeDoc?.id === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`cursor-pointer p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 shadow-md ring-1 ring-indigo-400/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {doc.fileName} • {doc.pageCount} pages • {Math.round(doc.fileSize / 1024)} KB
                </p>

                {/* Document Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {doc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Study Material counts */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>{doc.summary ? `${doc.summary.chapters.length} Chapters` : 'No Summary'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Brain className="w-3.5 h-3.5 text-amber-500" />
                    <span>{doc.flashcards.length} Cards</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Timer className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{doc.exams.length} Exam</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
