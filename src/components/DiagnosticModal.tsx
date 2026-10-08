import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertCircle, 
  Layers, 
  Check, 
  Download, 
  X, 
  ArrowRight,
  Brain,
  RefreshCw,
  BookmarkCheck
} from 'lucide-react';
import { DiagnosticResult, FlashcardItem } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostic: DiagnosticResult | null;
  isLoading: boolean;
  topic: string;
  mode: 'PARTNER_MODE' | 'FEYNMAN_MODE';
  onAddFlashcards: (cards: FlashcardItem[], sourceTopic: string) => void;
  onGoToFlashcards: () => void;
  lang: Language;
  theme?: 'light' | 'dark';
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  diagnostic,
  isLoading,
  topic,
  mode,
  onAddFlashcards,
  onGoToFlashcards,
  lang,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[lang];
  const [allImported, setAllImported] = useState(false);
  const [importedIndices, setImportedIndices] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const handleImportAll = () => {
    if (!diagnostic?.srs_flashcards) return;
    onAddFlashcards(diagnostic.srs_flashcards, topic);
    setAllImported(true);
  };

  const handleImportSingle = (index: number, card: FlashcardItem) => {
    onAddFlashcards([card], topic);
    setImportedIndices((prev) => ({ ...prev, [index]: true }));
  };

  const exportReportJson = () => {
    if (!diagnostic) return;
    const blob = new Blob([JSON.stringify({ topic, mode, ...diagnostic }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TutorEcho_Diagnosis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className={`relative w-full max-w-3xl my-6 border rounded-xl p-5 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-[#161b22] border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
      }`}>
        {/* Header - Flat UI */}
        <div className={`flex items-center justify-between border-b pb-3.5 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                {t.diagnosis.badge}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">{t.diagnosis.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-14 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">{t.diagnosis.analyzingTitle}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t.diagnosis.analyzingDesc}
              </p>
            </div>
          </div>
        )}

        {/* Diagnostic Results - Flat UI */}
        {!isLoading && diagnostic && (
          <div className="space-y-5">
            {/* Top Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fluency Score */}
              <div className={`sm:col-span-1 p-4 rounded-lg border flex flex-col items-center justify-center text-center space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
              }`}>
                <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold">
                  {t.diagnosis.fluencyScoreLabel}
                </span>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {diagnostic.fluency_score}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.diagnosis.scoreSub}</span>
              </div>

              {/* Feynman Concept Verdict */}
              <div className={`sm:col-span-2 p-4 rounded-lg border flex flex-col justify-between space-y-2 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
              }`}>
                <div className="flex items-center gap-1.5 text-xs text-sky-700 dark:text-sky-400 font-extrabold uppercase">
                  <Brain className="w-4 h-4" />
                  <span>{t.diagnosis.verdictTitle}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed italic font-semibold text-slate-950 dark:text-slate-200">
                  "{diagnostic.feynman_concept_verdict}"
                </p>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {t.diagnosis.verdictSub}
                </span>
              </div>
            </div>

            {/* Recurring Mistakes Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  {t.diagnosis.mistakesTitle}
                </h3>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {diagnostic.recurring_mistakes?.length || 0} {t.diagnosis.mistakesCount}
                </span>
              </div>

              {diagnostic.recurring_mistakes?.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 text-xs font-medium">
                  {t.diagnosis.noMistakes}
                </div>
              ) : (
                <div className="space-y-2">
                  {diagnostic.recurring_mistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border space-y-1.5 text-xs ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isDark ? 'bg-slate-800 text-amber-300 border-slate-700' : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {mistake.type}
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 italic font-medium">
                          {t.diagnosis.rationale} {mistake.explanation}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-900">
                        <div className={`p-2 rounded border font-medium ${
                          isDark ? 'text-red-300 bg-red-950/60 border-red-900' : 'text-red-950 bg-red-50 border-red-200'
                        }`}>
                          <span className="text-red-800 dark:text-red-400 text-[10px] block font-bold uppercase">{t.diagnosis.youSaid}</span>
                          "{mistake.user_said}"
                        </div>
                        <div className={`p-2 rounded border font-medium ${
                          isDark ? 'text-emerald-300 bg-emerald-950/60 border-emerald-900' : 'text-emerald-950 bg-emerald-50 border-emerald-200'
                        }`}>
                          <span className="text-emerald-800 dark:text-emerald-400 text-[10px] block font-bold uppercase">{t.diagnosis.correction}</span>
                          "{mistake.recommended_correction}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SRS Flashcards Review Package */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-200">
                    {t.diagnosis.srsTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImportAll}
                    disabled={allImported || (diagnostic.srs_flashcards?.length || 0) === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {allImported ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.diagnosis.allAdded}</span>
                      </>
                    ) : (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>{t.diagnosis.addAllBtn} ({diagnostic.srs_flashcards?.length || 0})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {diagnostic.srs_flashcards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 text-xs ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t.diagnosis.frontLabel}</span>
                        <p className="text-slate-950 dark:text-slate-200 font-semibold">{card.front}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{t.diagnosis.backLabel}</span>
                        <p className="text-emerald-700 dark:text-emerald-300 font-extrabold">{card.back}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-slate-900 text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 font-mono font-medium">{t.diagnosis.intervalLabel} {card.interval_days}d</span>
                      <button
                        onClick={() => handleImportSingle(idx, card)}
                        disabled={importedIndices[idx] || allImported}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                      >
                        {importedIndices[idx] || allImported ? t.diagnosis.savedCheck : t.diagnosis.saveCardBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions - Flat UI */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
              <button
                onClick={exportReportJson}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{t.diagnosis.exportBtn}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                  }`}
                >
                  {t.diagnosis.closeBtn}
                </button>
                <button
                  onClick={() => {
                    handleImportAll();
                    onGoToFlashcards();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors cursor-pointer"
                >
                  <span>{t.diagnosis.practiceDeckBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
