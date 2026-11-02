import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Copy,
  Cpu,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { AiMode, StudyDocument, StudySummary } from '../types';

interface SummariesViewProps {
  document: StudyDocument | null;
  onGenerateSummary: (doc: StudyDocument) => void;
  onNavigateToQuiz: () => void;
  isGenerating: boolean;
  aiMode: AiMode;
}

export const SummariesView: React.FC<SummariesViewProps> = ({
  document,
  onGenerateSummary,
  onNavigateToQuiz,
  isGenerating,
  aiMode,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [copied, setCopied] = useState(false);

  if (!document) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select or upload a document to view AI summaries.</p>
      </div>
    );
  }

  const summary = document.summary;

  const handleCopySummary = () => {
    if (!summary) return;
    let md = `# Study Summary: ${document.title}\n\n`;
    md += `## Executive Overview\n${summary.overview}\n\n`;
    summary.chapters.forEach((ch) => {
      md += `### Chapter ${ch.chapterNumber}: ${ch.title}\n\n${ch.summary}\n\n`;
      md += `**Key Takeaways:**\n`;
      ch.keyTakeaways.forEach((t) => (md += `- ${t}\n`));
      md += `\n**Definitions:**\n`;
      ch.definitions.forEach((d) => (md += `- **${d.term}**: ${d.definition}\n`));
      md += `\n`;
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    if (!summary) return;
    let md = `# Study Summary: ${document.title}\n\n`;
    md += `## Executive Overview\n${summary.overview}\n\n`;
    summary.chapters.forEach((ch) => {
      md += `### Chapter ${ch.chapterNumber}: ${ch.title}\n\n${ch.summary}\n\n`;
      md += `**Key Takeaways:**\n`;
      ch.keyTakeaways.forEach((t) => (md += `- ${t}\n`));
      md += `\n**Definitions:**\n`;
      ch.definitions.forEach((d) => (md += `- **${d.term}**: ${d.definition}\n`));
      md += `\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}_Summary.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!summary) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Generate Deep Chapter Summaries
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            StudyMate will analyze "{document.title}" ({document.pageCount} pages) to synthesize a comprehensive,
            chapter-by-chapter curriculum with highlighted key definitions, core rules, and actionable exam tips.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => onGenerateSummary(document)}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Deep Summaries...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Summaries with {aiMode === 'gemini' ? 'Gemini 3.8 Flash' : 'On-Device AI'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const activeChapter = summary.chapters[activeChapterIndex] || summary.chapters[0];

  const filteredGlossary = summary.glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{document.title}</h1>
            <span
              className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                summary.generatedWith === 'gemini'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {summary.generatedWith === 'gemini' ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini AI</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3" />
                  <span>Local AI</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.chapters.length} Structured Chapters • {summary.glossary.length} Essential Definitions • Generated{' '}
            {new Date(summary.generatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>

          <button
            onClick={onNavigateToQuiz}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Test on Quiz</span>
          </button>

          <button
            onClick={() => onGenerateSummary(document)}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Regenerate summary"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Executive Overview Box */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Executive Curriculum Overview</span>
        </h2>
        <p className="text-sm leading-relaxed text-indigo-950 dark:text-indigo-100/90 font-medium">
          {summary.overview}
        </p>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-2 pb-2 no-scrollbar">
        {summary.chapters.map((ch, idx) => {
          const isActive = activeChapterIndex === idx;
          return (
            <button
              key={ch.chapterNumber}
              onClick={() => setActiveChapterIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {ch.chapterNumber}
              </span>
              <span>{ch.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chapter Details */}
      {activeChapter && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Narrative Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Chapter {activeChapter.chapterNumber}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {activeChapter.title}
                </h3>
              </div>

              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {activeChapter.summary}
              </div>

              {/* Formulas or Rules if present */}
              {activeChapter.formulasOrRules && activeChapter.formulasOrRules.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Core Formulas, Laws & Step Rules
                  </h4>
                  <ul className="space-y-1.5 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    {activeChapter.formulasOrRules.map((f, i) => (
                      <li key={i} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Key Takeaways */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Crucial Takeaways & Insights</span>
              </h4>
              <ul className="space-y-2">
                {activeChapter.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar: Chapter Definitions & Study Tips */}
          <div className="space-y-6">
            {/* Definitions */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Key Definitions</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {activeChapter.definitions.length}
                </span>
              </h4>

              <div className="space-y-3">
                {activeChapter.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{def.term}</span>
                      {def.importance && (
                        <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                          {def.importance}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Tips */}
            {summary.studyTips && summary.studyTips.length > 0 && (
              <div className="bg-amber-50/70 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Exam Preparation Tips</span>
                </h4>
                <ul className="space-y-2">
                  {summary.studyTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start space-x-2">
                      <span className="font-bold shrink-0">{idx + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Master Document Glossary */}
      {summary.glossary && summary.glossary.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ListOrdered className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Complete Subject Glossary</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Master terminology compiled across the entire syllabus
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                placeholder="Search definitions..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-56"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGlossary.map((g, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{g.term}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {g.definition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
