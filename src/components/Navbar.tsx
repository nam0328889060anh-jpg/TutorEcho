import React from 'react';
import { Zap, Sparkles, Brain, Layers, Volume2, VolumeX, Globe } from 'lucide-react';
import { OperationalMode } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentMode: OperationalMode;
  onSelectMode: (mode: OperationalMode) => void;
  flashcardCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  flashcardCount,
  soundEnabled,
  onToggleSound,
  lang,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity - Flat UI */}
        <div 
          onClick={() => onSelectMode('SCENARIO_GEN')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:bg-indigo-500 transition-colors">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-100 tracking-tight">{t.appName}</span>
              <span className="text-[10px] uppercase font-mono font-bold bg-slate-800 text-indigo-400 border border-slate-700 px-1.5 py-0.5 rounded">
                Reflex &amp; Feynman
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Operational Modes Navigation - Flat UI */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onSelectMode('SCENARIO_GEN')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              currentMode === 'SCENARIO_GEN'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.modes.scenarios}</span>
            <span className="md:hidden">Kịch bản</span>
          </button>

          <button
            onClick={() => onSelectMode('PARTNER_MODE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              currentMode === 'PARTNER_MODE'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.modes.reflexBlitz}</span>
            <span className="md:hidden">Phản xạ</span>
          </button>

          <button
            onClick={() => onSelectMode('FEYNMAN_MODE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              currentMode === 'FEYNMAN_MODE'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.modes.feynman}</span>
            <span className="md:hidden">Feynman</span>
          </button>

          <button
            onClick={() => onSelectMode('FLASHCARDS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              currentMode === 'FLASHCARDS'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.modes.srsDeck}</span>
            <span className="sm:hidden">Thẻ</span>
            {flashcardCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-slate-800 text-emerald-400 border border-slate-700">
                {flashcardCount}
              </span>
            )}
          </button>
        </nav>

        {/* Global Controls - Flat UI */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            title={t.tooltips.langSwitch}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'vi' ? '🇻🇳 VN' : '🇬🇧 EN'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? t.tooltips.soundOn : t.tooltips.soundOff}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
