import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Loader2,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AiMode, ExamAttempt, PracticeExam, StudyDocument } from '../types';

interface ExamViewProps {
  document: StudyDocument | null;
  onGenerateExam: (
    doc: StudyDocument,
    questionCount: number,
    timeLimitMinutes: number
  ) => void;
  onExamCompleted: (examId: string, attempt: ExamAttempt) => void;
  isGenerating: boolean;
  aiMode: AiMode;
}

export const ExamView: React.FC<ExamViewProps> = ({
  document,
  onGenerateExam,
  onExamCompleted,
  isGenerating,
  aiMode,
}) => {
  // Configuration launcher
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(15);

  // Active exam session
  const [activeExam, setActiveExam] = useState<PracticeExam | null>(null);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [totalTimeSpentSeconds, setTotalTimeSpentSeconds] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [completedAttempt, setCompletedAttempt] = useState<ExamAttempt | null>(null);

  if (!document) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Timer className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select or upload a document to take practice exams.</p>
      </div>
    );
  }

  // Auto-select latest exam if available
  useEffect(() => {
    if (document.exams && document.exams.length > 0 && !activeExam && !isExamRunning) {
      setActiveExam(document.exams[document.exams.length - 1]);
    }
  }, [document.exams]);

  // Timer countdown
  useEffect(() => {
    if (!isExamRunning) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamRunning, userAnswers, activeExam]);

  const handleStartExam = (examToStart: PracticeExam) => {
    setActiveExam(examToStart);
    setIsExamRunning(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setTimeRemainingSeconds(examToStart.timeLimitMinutes * 60);
    setTotalTimeSpentSeconds(0);
    setCompletedAttempt(null);
  };

  const handleFinishExam = () => {
    if (!activeExam) return;
    setIsExamRunning(false);
    setShowSubmitModal(false);

    let correctCount = 0;
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    activeExam.questions.forEach((q) => {
      const topic = q.topic || 'General';
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[topic].total += 1;

      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
        topicBreakdown[topic].correct += 1;
      }
    });

    const totalQuestions = activeExam.questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= activeExam.passingScorePercent;

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: totalTimeSpentSeconds,
      scorePercent,
      totalQuestions,
      correctCount,
      passed,
      userAnswers,
      topicBreakdown,
    };

    setCompletedAttempt(attempt);
    onExamCompleted(activeExam.id, attempt);

    if (passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Grade calculator
  const getGrade = (percent: number) => {
    if (percent >= 90) return { letter: 'A', label: 'Distinction' };
    if (percent >= 80) return { letter: 'B', label: 'Proficient' };
    if (percent >= 70) return { letter: 'C', label: 'Satisfactory' };
    if (percent >= 60) return { letter: 'D', label: 'Needs Improvement' };
    return { letter: 'F', label: 'Unsatisfactory' };
  };

  // 1. Exam Report Card Screen
  if (completedAttempt && activeExam) {
    const grade = getGrade(completedAttempt.scorePercent);
    const minsSpent = Math.floor(completedAttempt.timeSpentSeconds / 60);
    const secsSpent = completedAttempt.timeSpentSeconds % 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Report Card Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                completedAttempt.passed
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {completedAttempt.passed ? <Trophy className="w-8 h-8" /> : <GraduationCap className="w-8 h-8" />}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Exam Diagnostic Report Card
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeExam.title}</p>
          </div>

          {/* Big Score Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
            <div>
              <div
                className={`text-4xl font-black ${
                  completedAttempt.passed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {completedAttempt.scorePercent}%
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Score</div>
            </div>

            <div>
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                Grade {grade.letter}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{grade.label}</div>
            </div>

            <div>
              <div className="text-4xl font-black text-slate-800 dark:text-slate-200">
                {completedAttempt.correctCount}/{completedAttempt.totalQuestions}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Correct Answers</div>
            </div>

            <div>
              <div className="text-4xl font-black text-slate-800 dark:text-slate-200">
                {minsSpent}m {secsSpent}s
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Time Spent</div>
            </div>
          </div>

          {/* Topic Performance Breakdown */}
          {Object.keys(completedAttempt.topicBreakdown).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Topic Mastery Breakdown
              </h3>
              <div className="space-y-2">
                {Object.entries(completedAttempt.topicBreakdown).map(([topic, data]) => {
                  const percent = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{topic}</span>
                        <span className="text-slate-500">
                          {data.correct}/{data.total} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleStartExam(activeExam)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake This Exam</span>
            </button>

            <button
              onClick={() => {
                setCompletedAttempt(null);
                onGenerateExam(document, questionCount, timeLimitMinutes);
              }}
              disabled={isGenerating}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Practice Exam</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Question-by-Question Grading & Explanations
          </h3>

          <div className="space-y-4">
            {activeExam.questions.map((q, idx) => {
              const userAns = completedAttempt.userAnswers[q.id];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    isCorrect
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {idx + 1}. {q.question}
                    </span>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <div>
                      <strong className="text-slate-700 dark:text-slate-300">Your Answer:</strong>{' '}
                      {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 text-xs leading-relaxed border border-slate-200/60 dark:border-slate-800/60">
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

  // 2. Active Exam Simulation Runner
  if (isExamRunning && activeExam) {
    const currentQ = activeExam.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeExam.questions.length - 1;
    const answeredCount = Object.keys(userAnswers).length;
    const isUrgentTime = timeRemainingSeconds < 120; // < 2 minutes

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Top Floating Exam Control Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
              {activeExam.title}
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Question {currentQuestionIndex + 1} of {activeExam.questions.length} • {answeredCount} Answered
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
                isUrgentTime
                  ? 'bg-rose-50 text-rose-600 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question Header & Bookmark */}
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Question {currentQuestionIndex + 1} ({currentQ.topic || 'General'})
                </span>

                <button
                  onClick={() => toggleFlagQuestion(currentQ.id)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    flaggedQuestions.has(currentQ.id)
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700'
                      : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQ.id) ? 'fill-amber-500' : ''}`} />
                  <span>{flaggedQuestions.has(currentQ.id) ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx] || String.fromCharCode(65 + idx);
                  const isSelected = userAnswers[currentQ.id] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() =>
                        setUserAnswers((prev) => ({
                          ...prev,
                          [currentQ.id]: idx,
                        }))
                      }
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
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

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Review & Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Question Palette Grid */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Question Palette
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {activeExam.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = currentQuestionIndex === idx;

                  let badgeStyle =
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
                  if (isCurrent) {
                    badgeStyle = 'ring-2 ring-indigo-500 border-indigo-500 font-bold';
                  }
                  if (isAnswered) {
                    badgeStyle += ' bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-semibold relative transition-transform hover:scale-105 flex items-center justify-center ${badgeStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-100 dark:bg-emerald-950 border border-emerald-300" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Flagged for Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Submit Practice Exam?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You have answered <strong className="text-slate-900 dark:text-slate-100">{answeredCount}</strong> out of{' '}
                <strong className="text-slate-900 dark:text-slate-100">{activeExam.questions.length}</strong> questions.
                {activeExam.questions.length - answeredCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 block mt-1 font-semibold">
                    Warning: You still have {activeExam.questions.length - answeredCount} unanswered questions!
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Return to Exam
                </button>
                <button
                  onClick={handleFinishExam}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Confirm & Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Launcher / Exam Setup Screen
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Timer className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Practice Exam Simulation</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Evaluate your holistic retention of "{document.title}" under realistic timed testing conditions with scoring
          and diagnostic reporting.
        </p>
      </div>

      {/* If existing exams are available */}
      {document.exams && document.exams.length > 0 && (
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Available Practice Exams
          </h3>
          <div className="space-y-2">
            {document.exams.map((exam) => (
              <div
                key={exam.id}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{exam.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {exam.questions.length} Questions • {exam.timeLimitMinutes} min limit • Pass: {exam.passingScorePercent}%
                  </div>
                </div>
                <button
                  onClick={() => handleStartExam(exam)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Config */}
      <div className="space-y-4 text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Configure New Exam
        </h3>

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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cnt} Questions
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Time Limit
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 25].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTimeLimitMinutes(mins)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  timeLimitMinutes === mins
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {mins} Minutes
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onGenerateExam(document, questionCount, timeLimitMinutes)}
        disabled={isGenerating}
        className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Constructing Practice Exam...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generate Exam with {aiMode === 'gemini' ? 'Gemini AI' : 'Local AI'}</span>
          </>
        )}
      </button>
    </div>
  );
};
