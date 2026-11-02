import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Timer,
  Trash2,
} from 'lucide-react';
import { AiMode, StudyDocument } from '../types';

interface DocumentViewerProps {
  document: StudyDocument | null;
  documents: StudyDocument[];
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onOpenUpload: () => void;
  onGenerateSummary: (doc: StudyDocument) => void;
  onGenerateQuiz: (doc: StudyDocument) => void;
  onGenerateFlashcards: (doc: StudyDocument) => void;
  onGenerateExam: (doc: StudyDocument) => void;
  isGenerating: boolean;
  generatingAction: string | null;
  aiMode: AiMode;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  documents,
  onSelectDoc,
  onDeleteDoc,
  onOpenUpload,
  onGenerateSummary,
  onGenerateQuiz,
  onGenerateFlashcards,
  onGenerateExam,
  isGenerating,
  generatingAction,
  aiMode,
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'paged' | 'full'>('paged');
  const [copied, setCopied] = useState(false);

  if (!document) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Upload a syllabus or course PDF or select an existing document to view its text.
        </p>
        <button
          onClick={onOpenUpload}
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>
    );
  }

  const currentPageData = document.pages.find((p) => p.pageNumber === activePage) || document.pages[0];
  const wordCount = document.rawText.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const handleCopyText = () => {
    navigator.clipboard.writeText(document.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter or highlight text based on search
  const displayedText = viewMode === 'paged' ? currentPageData?.text || '' : document.rawText;

  return (
    <div className="space-y-6">
      {/* Top Header & Document Metadata */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{document.title}</h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              File: <strong className="text-slate-700 dark:text-slate-300">{document.fileName}</strong> •{' '}
              {document.pageCount} pages • {wordCount.toLocaleString()} words • ~{readTimeMinutes} min read
            </p>
          </div>

          {/* Quick AI Generators Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateSummary(document)}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors disabled:opacity-50"
            >
              {isGenerating && generatingAction === 'summary' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              <span>{document.summary ? 'Regenerate Summary' : 'Generate Summary'}</span>
            </button>

            <button
              onClick={() => onGenerateQuiz(document)}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors disabled:opacity-50"
            >
              {isGenerating && generatingAction === 'quiz' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HelpCircle className="w-3.5 h-3.5" />
              )}
              <span>Create Quiz</span>
            </button>

            <button
              onClick={() => onGenerateFlashcards(document)}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors disabled:opacity-50"
            >
              {isGenerating && generatingAction === 'flashcards' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Brain className="w-3.5 h-3.5" />
              )}
              <span>Generate Flashcards</span>
            </button>

            <button
              onClick={() => onGenerateExam(document)}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors disabled:opacity-50"
            >
              {isGenerating && generatingAction === 'exam' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Timer className="w-3.5 h-3.5" />
              )}
              <span>Build Practice Exam</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Document Text */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Documents Selector */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                All Documents ({documents.length})
              </h3>
              <button
                onClick={onOpenUpload}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
              {documents.map((d) => (
                <div
                  key={d.id}
                  onClick={() => onSelectDoc(d.id)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    d.id === document.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="truncate pr-2">{d.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{d.pageCount}p</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Document Option */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
                  onDeleteDoc(document.id);
                }
              }}
              className="w-full flex items-center justify-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 py-2 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Document</span>
            </button>
          </div>
        </div>

        {/* Text Reader */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('paged')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'paged'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Page by Page
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'full'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Full Document
              </button>
            </div>

            {/* Paged navigation */}
            {viewMode === 'paged' && document.pages.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActivePage((prev) => Math.max(1, prev - 1))}
                  disabled={activePage === 1}
                  className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Page {activePage} of {document.pages.length}
                </span>
                <button
                  onClick={() => setActivePage((prev) => Math.min(document.pages.length, prev + 1))}
                  disabled={activePage === document.pages.length}
                  className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Search and Copy buttons */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find in text..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48"
                />
              </div>

              <button
                onClick={handleCopyText}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy all extracted text"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Display Canvas */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 min-h-[450px] shadow-xs">
            {copied && (
              <div className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Copied document text to clipboard!
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans selection:bg-indigo-500 selection:text-white">
              {displayedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
