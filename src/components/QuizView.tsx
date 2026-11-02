import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AiMode, QuizQuestion, StudyDocument } from '../types';

interface QuizViewProps {
  document: StudyDocument | null;
  onGenerateQuiz: (
    doc: StudyDocument,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  ) => void;
  onQuizCompleted: (correctCount: number, total: number) => void;
  isGenerating: boolean;
  aiMode: AiMode;
}

export const QuizView: React.FC<QuizViewProps> = ({
  document,
  onGenerateQuiz,
  onQuizCompleted,
  isGenerating,
  aiMode,
}) => {
  // Config state for launching new quiz
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');

  // Player state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [customQuestions, setCustomQuestions] = useState<QuizQuestion[] | null>(null);

  if (!document) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select or upload a document to take interactive quizzes.</p>
      </div>
    );
  }

  const activeQuestions = customQuestions || document.quizzes;

  const handleSelectOption = (optionIndex: number) => {
    if (showExplanation) return; // Locked once answered
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(selectedAnswers[currentIndex + 1] !== undefined);
    } else {
      // Finish quiz
      setIsFinished(true);
      const correctCount = activeQuestions.filter(
        (q, idx) => selectedAnswers[idx] === q.correctIndex
      ).length;
      onQuizCompleted(correctCount, activeQuestions.length);

      const percent = Math.round((correctCount / activeQuestions.length) * 100);
      if (percent >= 75) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  const handleRetryMissed = () => {
    const missed = activeQuestions.filter((q, idx) => selectedAnswers[idx] !== q.correctIndex);
    if (missed.length > 0) {
      setCustomQuestions(missed);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setShowExplanation(false);
      setIsFinished(false);
    }
  };

  // If no questions exist yet
  if (!activeQuestions || activeQuestions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Generate Multiple-Choice Quiz
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Create an active recall assessment from "{document.title}". Each question includes plausible options,
            correct keys, and deep conceptual explanations.
          </p>
        </div>

        {/* Difficulty & Count options */}
        <div className="space-y-4 text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['easy', 'medium', 'hard', 'mixed'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                    difficulty === d
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Question Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    questionCount === cnt
                      ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onGenerateQuiz(document, questionCount, difficulty)}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Quiz Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Quiz with {aiMode === 'gemini' ? 'Gemini AI' : 'Local AI'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Quiz Finished Result Screen
  if (isFinished) {
    const correctCount = activeQuestions.filter(
      (q, idx) => selectedAnswers[idx] === q.correctIndex
    ).length;
    const total = activeQuestions.length;
    const scorePercent = Math.round((correctCount / total) * 100);
    const missedQuestions = activeQuestions.filter(
      (q, idx) => selectedAnswers[idx] !== q.correctIndex
    );

    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Quiz Completed!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performance summary for "{document.title}"
          </p>

          <div className="py-4">
            <div className="text-5xl font-black text-violet-600 dark:text-violet-400">
              {scorePercent}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              {correctCount} out of {total} questions correct
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestartQuiz}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake All Questions</span>
          </button>

          {missedQuestions.length > 0 && (
            <button
              onClick={handleRetryMissed}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Missed ({missedQuestions.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              setCustomQuestions(null);
              onGenerateQuiz(document, questionCount, difficulty);
            }}
            disabled={isGenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate New Quiz</span>
          </button>
        </div>

        {/* Answer Breakdown */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Review Questions</h3>
          <div className="space-y-3">
            {activeQuestions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {idx + 1}. {q.question}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Your Answer:</strong>{' '}
                      {userAns !== undefined ? q.options[userAns] : 'Not answered'}
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-700 dark:text-emerald-400">
                        <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Question Player
  const currentQuestion = activeQuestions[currentIndex];
  const chosenIndex = selectedAnswers[currentIndex];
  const isAnswered = chosenIndex !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {activeQuestions.length}
            </span>
            {currentQuestion.topic && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px]">
                {currentQuestion.topic}
              </span>
            )}
          </div>
          <span className="capitalize font-semibold text-slate-500 text-[11px]">
            {currentQuestion.difficulty}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || String.fromCharCode(65 + idx);
            const isSelected = chosenIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let buttonStyle =
              'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-violet-300 dark:hover:border-violet-700 text-slate-800 dark:text-slate-200';

            if (showExplanation) {
              if (isCorrect) {
                buttonStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-medium ring-1 ring-emerald-500';
              } else if (isSelected && !isCorrect) {
                buttonStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 font-medium ring-1 ring-rose-500';
              } else {
                buttonStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              buttonStyle = 'border-violet-600 bg-violet-50 dark:bg-violet-950/50 text-violet-900 dark:text-violet-200';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start space-x-3 ${buttonStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    showExplanation && isCorrect
                      ? 'bg-emerald-600 text-white'
                      : showExplanation && isSelected && !isCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {letter}
                </span>
                <span className="leading-relaxed pt-0.5">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Pedagogical Explanation Reveal */}
        {showExplanation && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 animate-fade-in ${
              chosenIndex === currentQuestion.correctIndex
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {chosenIndex === currentQuestion.correctIndex ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Incorrect. The right choice is {['A', 'B', 'C', 'D'][currentQuestion.correctIndex]}.</span>
                </>
              )}
            </div>
            <p className="leading-relaxed opacity-90">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Next Question / Finish Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            {isAnswered ? 'Answer registered' : 'Select an option to check'}
          </span>
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <span>{currentIndex === activeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
