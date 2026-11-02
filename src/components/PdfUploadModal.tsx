import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { parsePdfFile, ParsePdfProgress } from '../utils/pdfParser';
import { StudyDocument } from '../types';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (doc: StudyDocument) => void;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ParsePdfProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF document.');
        return;
      }
      setFile(selected);
      setError(null);
      if (!customTitle) {
        setCustomTitle(selected.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type !== 'application/pdf' && !dropped.name.endsWith('.pdf')) {
        setError('Please drop a valid PDF file.');
        return;
      }
      setFile(dropped);
      setError(null);
      if (!customTitle) {
        setCustomTitle(dropped.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (activeTab === 'upload') {
      if (!file) {
        setError('Please choose or drop a PDF file.');
        return;
      }

      try {
        setIsProcessing(true);
        const parsed = await parsePdfFile(file, (p) => {
          setProgress(p);
        });

        if (!parsed.rawText || parsed.rawText.trim().length < 50) {
          throw new Error(
            'The PDF appears to be empty or contains only scanned images without selectable text. Please ensure the PDF has readable text.'
          );
        }

        const newDoc: StudyDocument = {
          id: `doc-${Date.now()}`,
          title: customTitle.trim() || parsed.title,
          fileName: file.name,
          fileSize: parsed.fileSize,
          pageCount: parsed.pageCount,
          uploadedAt: new Date().toISOString(),
          lastStudied: new Date().toISOString(),
          rawText: parsed.rawText,
          pages: parsed.pages,
          summary: null,
          flashcards: [],
          quizzes: [],
          exams: [],
          tags: tags.length > 0 ? tags : ['Course Material'],
        };

        onDocumentCreated(newDoc);
        onClose();
      } catch (err: any) {
        console.error('PDF parsing error:', err);
        setError(err.message || 'Failed to extract text from PDF.');
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    } else {
      // Direct text paste
      if (!pasteText || pasteText.trim().length < 50) {
        setError('Please paste at least 50 characters of study notes or text.');
        return;
      }

      const title = customTitle.trim() || 'Pasted Study Notes';
      const paragraphs = pasteText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      const estimatedPages = Math.max(1, Math.ceil(paragraphs.length / 3));

      const newDoc: StudyDocument = {
        id: `doc-${Date.now()}`,
        title,
        fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
        fileSize: new Blob([pasteText]).size,
        pageCount: estimatedPages,
        uploadedAt: new Date().toISOString(),
        lastStudied: new Date().toISOString(),
        rawText: pasteText,
        pages: paragraphs.map((p, idx) => ({
          pageNumber: Math.floor(idx / 3) + 1,
          text: p,
        })),
        summary: null,
        flashcards: [],
        quizzes: [],
        exams: [],
        tags: tags.length > 0 ? tags : ['Notes'],
      };

      onDocumentCreated(newDoc);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Add Study Material</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Upload PDF Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Paste Text or Notes
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <label htmlFor="pdf-upload" className="cursor-pointer block">
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to extract
                    </p>
                    <span className="inline-block mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                      Click to choose a different PDF
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Drop your PDF file here, or{' '}
                      <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports textbooks, lecture slides, research papers, and class syllabi
                    </p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste Course Content, Chapter Notes or Article
              </label>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste chapter text, lecture slides notes, or syllabus content here..."
                rows={6}
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Molecular Biology Chapter 4"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags / Subject (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Biology, Genetics, Exam Prep"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Progress bar during PDF extraction */}
          {isProcessing && progress && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{progress.stage}</span>
                </span>
                <span>{progress.percentage}%</span>
              </div>
              <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !pasteText)}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-sm transition-all flex items-center space-x-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Process Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
