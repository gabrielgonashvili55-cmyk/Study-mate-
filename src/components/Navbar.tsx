import React from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Cpu,
  FileText,
  Flame,
  GraduationCap,
  HelpCircle,
  Layers,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Timer,
} from 'lucide-react';
import { AiMode, StudyDocument, UserStudyStats } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDoc: StudyDocument | null;
  documents: StudyDocument[];
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  aiMode: AiMode;
  onToggleAiMode: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  stats: UserStudyStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeDoc,
  documents,
  onSelectDoc,
  onOpenUpload,
  onOpenSettings,
  aiMode,
  onToggleAiMode,
  isDark,
  onToggleTheme,
  stats,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'summaries', label: 'Summaries', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
    { id: 'exam', label: 'Exam Mode', icon: Timer },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  StudyMate
                </span>
                <span className="hidden sm:inline-block ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </div>
            </button>

            {/* Document Selector Dropdown if available */}
            {documents.length > 0 && (
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <select
                  value={activeDoc?.id || ''}
                  onChange={(e) => onSelectDoc(e.target.value)}
                  className="text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 border border-slate-300/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px] truncate transition-colors"
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      📄 {doc.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Streak Counter */}
            <div
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold"
              title={`${stats.streakDays} day study streak!`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500" />
              <span>{stats.streakDays}d Streak</span>
            </div>

            {/* AI Engine Badge Toggle */}
            <button
              onClick={onToggleAiMode}
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                aiMode === 'gemini'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800 hover:bg-violet-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
              title="Click to toggle between Cloud Gemini AI and On-Device Local AI"
            >
              {aiMode === 'gemini' ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Gemini AI</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Local Device AI</span>
                </>
              )}
            </button>

            {/* Upload PDF CTA */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 space-x-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
