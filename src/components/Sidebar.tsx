import React from 'react';
import { 
  Menu, 
  Plus, 
  Trash2, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Globe, 
  Layers,
  MessageSquare,
  Zap,
  Brain
} from 'lucide-react';
import { ScenarioModule, OperationalMode } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  currentMode: OperationalMode;
  onSelectMode: (mode: OperationalMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang: Language;
  onToggleLang: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  flashcardCount: number;
  onNewTopic: () => void;
  topics: ScenarioModule[];
  activeTopicId?: string;
  onSelectTopic: (topic: ScenarioModule, startMode?: 'PARTNER_MODE' | 'FEYNMAN_MODE') => void;
  onDeleteTopic: (topicId: string, e: React.MouseEvent) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
  lang,
  onToggleLang,
  soundEnabled,
  onToggleSound,
  flashcardCount,
  onNewTopic,
  topics,
  activeTopicId,
  onSelectTopic,
  onDeleteTopic,
}) => {
  const t = TRANSLATIONS[lang];
  const isDark = theme === 'dark';

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-200 ease-in-out border-r flex flex-col justify-between select-none ${
        isDark 
          ? 'bg-[#121214] border-[#27272a] text-[#f4f4f5]' 
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      } ${isCollapsed ? 'w-16' : 'w-72'}`}
    >
      {/* Top section: Toggle, App Brand, New Topic button, and Practice Mode Switcher */}
      <div className="p-3 space-y-2.5 shrink-0 border-b border-slate-200 dark:border-[#27272a]">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? t.sidebar.expand : t.sidebar.collapse}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'hover:bg-[#27272a] text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-800 hover:text-slate-950 font-bold'
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2 pr-1">
              <span className="font-extrabold text-sm tracking-tight text-slate-950 dark:text-white">TutorEcho</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
          )}
        </div>

        {/* '+ Tạo chủ đề mới' Button */}
        <button
          onClick={onNewTopic}
          title={lang === 'vi' ? 'Tạo chủ đề mới' : 'New topic'}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
            currentMode === 'SCENARIO_GEN'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
              : isDark
                ? 'bg-[#27272a] hover:bg-[#323238] text-white border border-[#3f3f46]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-950 border border-slate-300'
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && (
            <span className="truncate">{lang === 'vi' ? '+ Tạo chủ đề mới' : '+ New topic'}</span>
          )}
        </button>

        {/* '📊 Performance Advisor' Button */}
        <button
          onClick={() => onSelectMode('PERFORMANCE_ADVISOR')}
          title={lang === 'vi' ? '📊 Performance Advisor (Tổng hợp chiến lược & Lời khuyên)' : '📊 Performance Advisor (Strategic Synthesis & Advice)'}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-extrabold text-xs transition-colors cursor-pointer ${
            currentMode === 'PERFORMANCE_ADVISOR'
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-xs ring-1 ring-violet-400'
              : isDark
                ? 'bg-[#18181b] hover:bg-[#232328] text-violet-300 hover:text-white border border-violet-500/30'
                : 'bg-violet-100 hover:bg-violet-200 text-violet-950 border border-violet-300'
          }`}
        >
          <span className="text-sm leading-none shrink-0">📊</span>
          {!isCollapsed && (
            <span className="truncate">Performance Advisor</span>
          )}
        </button>

        {/* Practice Mode Quick Selector in Sidebar */}
        {!isCollapsed && (
          <div className="pt-1 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 px-1">
              {lang === 'vi' ? 'Chọn chế độ luyện:' : 'Practice Modes:'}
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={() => onSelectMode('PARTNER_MODE')}
                title={lang === 'vi' ? 'Chế độ luyện phản xạ' : 'Reflex Mode'}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  currentMode === 'PARTNER_MODE'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : isDark
                      ? 'bg-[#18181b] hover:bg-amber-950/40 text-amber-400 border border-amber-900/40'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-extrabold'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Phản Xạ' : 'Reflex'}</span>
              </button>

              <button
                onClick={() => onSelectMode('FEYNMAN_MODE')}
                title={lang === 'vi' ? 'Chế độ dạy học Feynman' : 'Feynman Mode'}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  currentMode === 'FEYNMAN_MODE'
                    ? 'bg-sky-600 text-white shadow-xs font-bold'
                    : isDark
                      ? 'bg-[#18181b] hover:bg-sky-950/40 text-sky-400 border border-sky-900/40'
                      : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 font-extrabold'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Feynman</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Middle section: Created Topics List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            <span>{lang === 'vi' ? 'Chủ đề của bạn' : 'Your Topics'}</span>
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-[#27272a] text-slate-900 dark:text-slate-200 px-1.5 py-0.2 rounded font-extrabold">
              {topics.length}
            </span>
          </div>
        )}

        {topics.map((item) => {
          const isSelected = activeTopicId === (item.id || item.topic);
          return (
            <div
              key={item.id || item.topic}
              className={`rounded-lg transition-colors p-2 text-xs font-medium ${
                isSelected
                  ? isDark
                    ? 'bg-[#27272a] border border-[#3f3f46]'
                    : 'bg-slate-200 border border-slate-300 text-slate-950 shadow-xs'
                  : isDark
                    ? 'hover:bg-[#1a1a1e] border border-transparent text-slate-300'
                    : 'hover:bg-slate-100 border border-transparent text-slate-900'
              }`}
            >
              {/* Topic Title Row */}
              <div 
                onClick={() => onSelectTopic(item)}
                title={item.topic}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-400'}`} />
                  {!isCollapsed && (
                    <span className={`truncate ${
                      isSelected 
                        ? 'font-bold text-slate-950 dark:text-white' 
                        : 'text-slate-900 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white font-semibold'
                    }`}>
                      {item.topic}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <button
                    onClick={(e) => onDeleteTopic(item.id || item.topic, e)}
                    title={lang === 'vi' ? 'Xóa chủ đề' : 'Delete topic'}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded transition-opacity cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Launch Buttons directly on each topic (When expanded) */}
              {!isCollapsed && (
                <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-200 dark:border-[#38383f]">
                  <button
                    onClick={() => onSelectTopic(item, 'PARTNER_MODE')}
                    title={lang === 'vi' ? 'Luyện phản xạ với chủ đề này' : 'Practice reflex on this topic'}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[11px] font-extrabold transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    }`}
                  >
                    <Zap className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-800'}`} />
                    <span>{lang === 'vi' ? 'Phản xạ' : 'Reflex'}</span>
                  </button>
                  <button
                    onClick={() => onSelectTopic(item, 'FEYNMAN_MODE')}
                    title={lang === 'vi' ? 'Luyện Feynman với chủ đề này' : 'Practice Feynman on this topic'}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded text-[11px] font-extrabold transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30'
                        : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300'
                    }`}
                  >
                    <Brain className={`w-3 h-3 ${isDark ? 'text-sky-400' : 'text-sky-800'}`} />
                    <span>Feynman</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {topics.length === 0 && !isCollapsed && (
          <div className="px-3 py-6 text-center text-xs text-slate-600 dark:text-slate-400 font-medium italic">
            {lang === 'vi' ? 'Chưa có chủ đề nào. Nhập chủ đề ở giữa để tạo!' : 'No topics yet. Create one above!'}
          </div>
        )}
      </div>

      {/* Bottom section: Settings, Theme toggle, Language & SRS deck */}
      <div className={`p-2.5 space-y-1 border-t shrink-0 ${isDark ? 'border-[#27272a]' : 'border-slate-200'}`}>
        {/* SRS Flashcards quick link */}
        <button
          onClick={() => onSelectMode('FLASHCARDS')}
          title={t.modes.srsDeck}
          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            currentMode === 'FLASHCARDS'
              ? isDark ? 'bg-[#27272a] text-emerald-400 font-bold' : 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold'
              : isDark ? 'text-slate-300 hover:text-white hover:bg-[#1a1a1e]' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {!isCollapsed && <span>{t.modes.srsDeck}</span>}
          </div>
          {!isCollapsed && flashcardCount > 0 && (
            <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
              {flashcardCount}
            </span>
          )}
        </button>

        {/* Dark / Night Mode toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-[#1a1a1e]' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-indigo-600 shrink-0" />}
          {!isCollapsed && <span>{isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>}
        </button>

        {/* Language switcher */}
        <button
          onClick={onToggleLang}
          title={t.tooltips.langSwitch}
          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-[#1a1a1e]' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          {!isCollapsed && <span>{lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}</span>}
        </button>

        {/* Audio toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? t.tooltips.soundOn : t.tooltips.soundOff}
          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-[#1a1a1e]' : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />}
          {!isCollapsed && <span>{soundEnabled ? 'Âm thanh: Bật' : 'Âm thanh: Tắt'}</span>}
        </button>
      </div>
    </aside>
  );
};
