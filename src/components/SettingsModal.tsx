import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Cpu,
  Moon,
  RotateCcw,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { AiMode } from '../types';
import { checkAiStatus } from '../utils/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiMode: AiMode;
  onSelectAiMode: (mode: AiMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiMode,
  onSelectAiMode,
  isDark,
  onToggleTheme,
  onResetData,
}) => {
  const [serverStatus, setServerStatus] = useState<{
    geminiAvailable: boolean;
    model: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkAiStatus().then((s) => setServerStatus(s));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">StudyMate Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* AI Engine Choice */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AI Processing Engine
            </label>

            <div className="space-y-2.5">
              {/* Gemini 3.8 Flash */}
              <div
                onClick={() => onSelectAiMode('gemini')}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                  aiMode === 'gemini'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Gemini 3.8 Flash (Full-Stack AI)
                    </span>
                    {aiMode === 'gemini' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Fast, high-fidelity reasoning using server-side Gemini 3.8 Flash. Zero cost to creator.
                  </p>
                  <div className="mt-2 flex items-center space-x-2 text-[11px] font-semibold">
                    <span className="text-emerald-600 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{serverStatus?.geminiAvailable ? 'Ready & Connected' : 'Auto-fallback enabled'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* On-Device Local Engine */}
              <div
                onClick={() => onSelectAiMode('local')}
                className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                  aiMode === 'local'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      On-Device Local AI Engine (100% Private & Free)
                    </span>
                    {aiMode === 'local' && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Executes directly in browser memory without sending text over the internet. Zero server dependencies,
                    works completely offline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Interface Theme</div>
              <div className="text-xs text-slate-500">Toggle dark or light mode</div>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1.5 text-xs font-semibold"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Reset / Clear Data */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Reset Study Data</div>
              <div className="text-xs text-slate-500">Restore default sample course guides & reset stats</div>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset all study materials to default sample guides?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
