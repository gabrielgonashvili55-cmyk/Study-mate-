import React, { useEffect, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCw,
  Shuffle,
  Sparkles,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AiMode, Flashcard, StudyDocument } from '../types';

interface FlashcardsViewProps {
  document: StudyDocument | null;
  onGenerateFlashcards: (doc: StudyDocument, count: number) => void;
  onUpdateFlashcardStatus: (cardId: string, status: 'new' | 'learning' | 'mastered') => void;
  isGenerating: boolean;
  aiMode: AiMode;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  document,
  onGenerateFlashcards,
  onUpdateFlashcardStatus,
  isGenerating,
  aiMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'learning' | 'mastered'>('all');
  const [cardsCount, setCardsCount] = useState<number>(10);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [cardsOrder, setCardsOrder] = useState<string[]>([]);

  if (!document) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Brain className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Document Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Select or upload a document to study flashcards.</p>
      </div>
    );
  }

  const allCards = document.flashcards;

  // Sync cards order when cards change
  useEffect(() => {
    if (cardsOrder.length !== allCards.length) {
      setCardsOrder(allCards.map((c) => c.id));
    }
  }, [allCards]);

  const orderedCards = cardsOrder
    .map((id) => allCards.find((c) => c.id === id))
    .filter(Boolean) as Flashcard[];

  const filteredCards = orderedCards.filter((c) => {
    if (filter === 'learning') return c.status === 'learning';
    if (filter === 'mastered') return c.status === 'mastered';
    return true;
  });

  // Clamp index if out of bounds
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCards.length, currentIndex]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...cardsOrder].sort(() => Math.random() - 0.5);
    setCardsOrder(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
  };

  const handleRate = (status: 'learning' | 'mastered') => {
    if (!currentCard) return;
    onUpdateFlashcardStatus(currentCard.id, status);
    if (status === 'mastered') {
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
    handleNext();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (allCards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Brain className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Generate Spaced Repetition Flashcards
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Extract high-yield active recall flashcards from "{document.title}". Practice definitions, core mechanisms,
            and memory hooks with 3D flip animation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Number of Cards to Generate
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[8, 12, 16].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setCardsCount(cnt)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  cardsCount === cnt
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {cnt} Flashcards
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onGenerateFlashcards(document, cardsCount)}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Cards...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Flashcards with {aiMode === 'gemini' ? 'Gemini AI' : 'Local AI'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const masteredCount = allCards.filter((c) => c.status === 'mastered').length;
  const learningCount = allCards.filter((c) => c.status === 'learning').length;
  const progressPercent = Math.round((masteredCount / allCards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Mastery Progress */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-amber-500" />
              <span>{document.title} Flashcards</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {allCards.length} Cards • {masteredCount} Mastered ({progressPercent}%) • {learningCount} Learning
            </p>
          </div>

          {/* Controls: Filter & Shuffle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShuffle}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1"
              title="Shuffle card order"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>

            <button
              onClick={() => onGenerateFlashcards(document, 8)}
              disabled={isGenerating}
              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold flex items-center space-x-1"
              title="Generate additional flashcards"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">+More</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-2 transition-all duration-300"
              style={{ width: `${(masteredCount / allCards.length) * 100}%` }}
              title={`Mastered: ${masteredCount}`}
            />
            <div
              className="bg-amber-400 h-2 transition-all duration-300"
              style={{ width: `${(learningCount / allCards.length) * 100}%` }}
              title={`Learning: ${learningCount}`}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Filter:
          </span>
          {(['all', 'learning', 'mastered'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {f} ({f === 'all' ? allCards.length : f === 'learning' ? learningCount : masteredCount})
            </button>
          ))}
        </div>
      </div>

      {/* 3D Flip Card Container */}
      {currentCard ? (
        <div className="perspective-1000 w-full min-h-[360px]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[360px] rounded-2xl cursor-pointer transition-transform duration-500 transform-style-3d relative select-none ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 p-8 shadow-md flex flex-col justify-between">
              {/* Card Meta Top */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider text-[10px]">
                  {currentCard.category}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(currentCard.front);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Read front aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-slate-400 text-xs font-semibold">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                </div>
              </div>

              {/* Card Prompt Content */}
              <div className="my-auto py-6 text-center space-y-4">
                <p className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentCard.front}
                </p>

                {showHint && currentCard.hint && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="inline-block p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 animate-fade-in"
                  >
                    <span className="font-bold">Hint:</span> {currentCard.hint}
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                {currentCard.hint ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHint(!showHint);
                    }}
                    className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <span className="flex items-center space-x-1 text-slate-400">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Click or press Space to flip</span>
                </span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 p-8 shadow-lg flex flex-col justify-between">
              {/* Back Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[10px]">
                  Explanation & Definition
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.back);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Read explanation aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Back Content */}
              <div className="my-auto py-6 space-y-4">
                <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {currentCard.back}
                </p>
              </div>

              {/* Rating Controls on Back */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  onClick={() => handleRate('learning')}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 transition-colors"
                >
                  Still Learning (Review Again)
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('mastered')}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No cards found for filter "{filter}".
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-xs font-bold text-indigo-600 underline"
          >
            Show All Cards
          </button>
        </div>
      )}

      {/* Navigation Arrows & Keyboard Hints */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs flex items-center space-x-1 text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Use ← and → arrow keys to navigate
        </span>

        <button
          onClick={handleNext}
          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs flex items-center space-x-1 text-xs font-semibold"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
