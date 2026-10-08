import React, { useState } from 'react';
import { 
  Layers, 
  RotateCw, 
  Volume2, 
  Trash2, 
  Plus, 
  Download, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import { StoredFlashcard } from '../types';
import { speakText } from '../utils/audio';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FlashcardDeckViewProps {
  cards: StoredFlashcard[];
  onUpdateCardInterval: (cardId: string, days: number) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (card: Omit<StoredFlashcard, 'id' | 'created_at' | 'next_review_at' | 'repetitions'>) => void;
  soundEnabled: boolean;
  onBackToScenarios: () => void;
  lang: Language;
  theme?: 'light' | 'dark';
}

export const FlashcardDeckView: React.FC<FlashcardDeckViewProps> = ({
  cards,
  onUpdateCardInterval,
  onDeleteCard,
  onAddCard,
  soundEnabled,
  onBackToScenarios,
  lang,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const filteredCards = selectedTopic === 'all'
    ? cards
    : cards.filter(c => (c.sourceTopic || 'General') === selectedTopic);

  const topics = Array.from(new Set(cards.map(c => c.sourceTopic || 'General')));

  const currentCard = filteredCards[currentIndex] || null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleRate = (days: number) => {
    if (!currentCard) return;
    onUpdateCardInterval(currentCard.id, days);
    handleNext();
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!soundEnabled) return;
    speakText(text);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    onAddCard({
      front: newFront.trim(),
      back: newBack.trim(),
      interval_days: 1,
      sourceTopic: newTopic.trim() || (lang === 'vi' ? 'Luyện Phản Xạ Chung' : 'General Spoken Practice'),
    });
    setNewFront('');
    setNewBack('');
    setNewTopic('');
    setIsAddingCard(false);
  };

  const exportDeckJson = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TutorEcho_SRS_Deck_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-14">
      {/* Header and Controls */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-[#161b22] border-slate-800' : 'bg-white border-slate-300 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToScenarios}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-bold'
            }`}
            title={t.reflexSession.switchScenario}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {t.flashcards.srsBadge}
              </span>
              <span className="text-xs text-slate-500 font-medium">· {t.flashcards.activeReview}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">{t.flashcards.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddingCard(!isAddingCard)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.flashcards.newCardBtn}</span>
          </button>

          <button
            onClick={exportDeckJson}
            disabled={cards.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.flashcards.exportBtn}</span>
          </button>
        </div>
      </div>

      {/* Topic Filter Pills */}
      {topics.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-600 dark:text-slate-400 shrink-0 font-semibold">{t.flashcards.filterLabel}</span>
          <button
            onClick={() => {
              setSelectedTopic('all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-2.5 py-1 rounded-md shrink-0 font-bold transition-colors cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-emerald-600 text-white'
                : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950'
            }`}
          >
            {t.flashcards.allCards} ({cards.length})
          </button>
          {topics.map((tItem) => {
            const count = cards.filter(c => (c.sourceTopic || 'General') === tItem).length;
            return (
              <button
                key={tItem}
                onClick={() => {
                  setSelectedTopic(tItem);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-md shrink-0 font-bold transition-colors cursor-pointer ${
                  selectedTopic === tItem
                    ? 'bg-emerald-600 text-white'
                    : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border border-slate-300 text-slate-800 hover:text-slate-950'
                }`}
              >
                {tItem} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Manual Add Card Drawer Form - Flat UI */}
      {isAddingCard && (
        <form
          onSubmit={handleCreateCard}
          className={`border rounded-xl p-4 space-y-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
            <h3 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> {t.flashcards.createTitle}
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingCard(false)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white cursor-pointer"
            >
              {t.flashcards.cancelBtn}
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="text-slate-700 dark:text-slate-400 block mb-1 font-semibold">{t.flashcards.frontPromptLabel}</label>
              <input
                type="text"
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder={t.flashcards.frontPromptPlaceholder}
                className={`w-full rounded-lg p-2.5 font-medium border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-400 block mb-1 font-semibold">{t.flashcards.backLabel}</label>
              <input
                type="text"
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder={t.flashcards.backPlaceholder}
                className={`w-full rounded-lg p-2.5 font-medium border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>
            <div>
              <label className="text-slate-700 dark:text-slate-400 block mb-1 font-semibold">{t.flashcards.topicTagLabel}</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder={t.flashcards.topicTagPlaceholder}
                className={`w-full rounded-lg p-2.5 font-medium border ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-950'
                }`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                {t.flashcards.saveBtn}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Flashcard Interactive Area - Flat UI */}
      {filteredCards.length === 0 ? (
        <div className={`border rounded-xl p-10 text-center space-y-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">{t.flashcards.emptyTitle}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {t.flashcards.emptyDesc}
            </p>
          </div>
          <button
            onClick={onBackToScenarios}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            {t.flashcards.goScenariosBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card counter */}
          <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-600 dark:text-slate-400">
            <span>
              {t.flashcards.cardCount} {currentIndex + 1} / {filteredCards.length}
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              {t.flashcards.interval} {currentCard?.interval_days || 1}d
            </span>
          </div>

          {/* 3D Interactive Flip Card - Flat UI */}
          <div 
            onClick={handleFlip}
            className="perspective-1000 min-h-[280px] cursor-pointer group select-none"
          >
            <div
              className={`relative w-full min-h-[280px] rounded-xl transition-transform duration-300 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT OF CARD - Flat UI */}
              <div className={`absolute inset-0 backface-hidden border rounded-xl p-6 sm:p-7 flex flex-col justify-between ${
                isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      isDark ? 'bg-slate-800 text-indigo-300 border-slate-700' : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    }`}>
                      {t.flashcards.frontTag}
                    </span>
                    {currentCard?.sourceTopic && (
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                        {currentCard.sourceTopic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleSpeak(e, currentCard!.front)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950'
                    }`}
                    title={t.scenarioGen.listen}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 text-center space-y-2">
                  <p className={`text-lg sm:text-xl font-bold leading-relaxed ${
                    isDark ? 'text-slate-100' : 'text-slate-950'
                  }`}>
                    "{currentCard?.front}"
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {t.flashcards.clickToFlip}
                  </p>
                </div>

                <div className={`flex items-center justify-between text-xs text-slate-500 border-t pt-3 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                    <RotateCw className="w-3.5 h-3.5" /> {t.flashcards.clickToFlip}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentCard) onDeleteCard(currentCard.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                    title={t.flashcards.deleteCard}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* BACK OF CARD - Flat UI */}
              <div className={`absolute inset-0 backface-hidden rotate-y-180 border rounded-xl p-6 sm:p-7 flex flex-col justify-between ${
                isDark ? 'bg-slate-900 border-emerald-700' : 'bg-emerald-50 border-emerald-300 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-200 text-emerald-950 border-emerald-400'
                    }`}>
                      {t.flashcards.backTag}
                    </span>
                    {currentCard?.sourceTopic && (
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold">
                        {currentCard.sourceTopic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleSpeak(e, currentCard!.back)}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    title={t.scenarioGen.listen}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4 text-center space-y-2">
                  <p className={`text-lg sm:text-xl font-extrabold leading-relaxed ${
                    isDark ? 'text-emerald-300' : 'text-emerald-950'
                  }`}>
                    "{currentCard?.back}"
                  </p>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>
                    {t.flashcards.backInstruction}
                  </p>
                </div>

                <div className={`flex items-center justify-between text-xs text-slate-500 border-t pt-3 ${
                  isDark ? 'border-slate-800' : 'border-emerald-200'
                }`}>
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                    <RotateCw className="w-3.5 h-3.5" /> {t.flashcards.clickToFlip}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentCard) onDeleteCard(currentCard.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                    title={t.flashcards.deleteCard}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Spaced Repetition Grading Actions - Flat UI */}
          <div className={`border rounded-xl p-3.5 space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
          }`}>
            <div className="text-center text-xs font-bold text-slate-700 dark:text-slate-400">
              {t.flashcards.ratePrompt}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => handleRate(1)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-red-950 hover:bg-red-900 border-red-800 text-red-200' 
                    : 'bg-red-100 hover:bg-red-200 border-red-300 text-red-950'
                }`}
              >
                <span>{t.flashcards.againBtn}</span>
                <span className="text-[10px] font-mono text-red-700 dark:text-red-400 font-extrabold">{t.flashcards.againSub}</span>
              </button>

              <button
                onClick={() => handleRate(3)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-amber-950 hover:bg-amber-900 border-amber-800 text-amber-200' 
                    : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950'
                }`}
              >
                <span>{t.flashcards.goodBtn}</span>
                <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-extrabold">{t.flashcards.goodSub}</span>
              </button>

              <button
                onClick={() => handleRate(7)}
                className={`py-2.5 px-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isDark 
                    ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-200' 
                    : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950'
                }`}
              >
                <span>{t.flashcards.easyBtn}</span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{t.flashcards.easySub}</span>
              </button>
            </div>

            <div className={`flex items-center justify-between pt-1.5 border-t text-xs font-semibold ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-700'
            }`}>
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.flashcards.prevBtn}
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                {t.flashcards.nextBtn} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
