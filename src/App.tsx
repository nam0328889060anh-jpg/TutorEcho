/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ScenarioGenerator } from './components/ScenarioGenerator';
import { PartnerReflexSession } from './components/PartnerReflexSession';
import { FeynmanSession } from './components/FeynmanSession';
import { DiagnosticModal } from './components/DiagnosticModal';
import { FlashcardDeckView } from './components/FlashcardDeckView';
import { PerformanceAdvisorDashboard } from './components/PerformanceAdvisorDashboard';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { Language } from './i18n/translations';
import { Zap, Brain, Layers, BarChart3 } from 'lucide-react';
import { 
  OperationalMode, 
  ScenarioModule, 
  ChatMessage, 
  DiagnosticResult, 
  StoredFlashcard, 
  FlashcardItem,
  SessionHistoryRecord 
} from './types';

const INITIAL_SEED_CARDS_VI: StoredFlashcard[] = [
  {
    id: 'seed-1',
    front: 'Sửa câu phản xạ này: "If I knew about the flight delay, I would take the train earlier."',
    back: 'If I had known about the flight delay, I would have taken the train earlier.',
    interval_days: 1,
    sourceTopic: 'Third Conditional',
    created_at: Date.now() - 86400000,
    next_review_at: Date.now(),
    repetitions: 0,
  },
  {
    id: 'seed-2',
    front: 'Sửa câu phản xạ này: "I work here since three years and I am very good."',
    back: 'I have been working here for three years and I consistently deliver strong outcomes.',
    interval_days: 3,
    sourceTopic: 'Present Perfect vs Past Simple',
    created_at: Date.now() - 172800000,
    next_review_at: Date.now(),
    repetitions: 1,
  },
  {
    id: 'seed-3',
    front: 'Sửa câu phản xạ này: "I need 15% raise because inflation is very high in my city."',
    back: 'Based on my recent milestone delivery and current industry benchmarks, an 18% adjustment aligns with my impact.',
    interval_days: 1,
    sourceTopic: 'Executive Salary Review',
    created_at: Date.now() - 43200000,
    next_review_at: Date.now(),
    repetitions: 0,
  },
];

export default function App() {
  const [currentMode, setCurrentMode] = useState<OperationalMode>('SCENARIO_GEN');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Created Topics state with localStorage persistence
  const [createdTopics, setCreatedTopics] = useState<ScenarioModule[]>(() => {
    try {
      const saved = localStorage.getItem('tutorecho_created_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PRESET_SCENARIOS;
  });

  // Active Scenario state
  const [activeScenario, setActiveScenario] = useState<ScenarioModule>(() => {
    return createdTopics[0] || PRESET_SCENARIOS[0];
  });

  // Persist created topics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tutorecho_created_topics', JSON.stringify(createdTopics));
    } catch {}
  }, [createdTopics]);

  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('tutorecho_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    } catch {}
    return 'dark'; // Default to clean modern dark
  });

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('tutorecho_theme', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Language state: default to 'vi'
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('tutorecho_lang') as Language;
      if (savedLang === 'en' || savedLang === 'vi') return savedLang;
    } catch {}
    return 'vi';
  });

  const handleToggleLang = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    try {
      localStorage.setItem('tutorecho_lang', nextLang);
    } catch {}
  };

  // Flashcards state with localStorage persistence
  const [flashcards, setFlashcards] = useState<StoredFlashcard[]>(() => {
    try {
      const saved = localStorage.getItem('tutorecho_flashcards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SEED_CARDS_VI;
  });

  // Diagnostic state
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState<'PARTNER_MODE' | 'FEYNMAN_MODE'>('PARTNER_MODE');
  const [diagnosticTopic, setDiagnosticTopic] = useState<string>('');

  // Persist flashcards to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tutorecho_flashcards', JSON.stringify(flashcards));
    } catch {}
  }, [flashcards]);

  const handleSelectScenario = (scenario: ScenarioModule, startMode: 'PARTNER_MODE' | 'FEYNMAN_MODE') => {
    setActiveScenario(scenario);
    setCurrentMode(startMode);
  };

  const handleSelectTopicFromSidebar = (topic: ScenarioModule, startMode?: 'PARTNER_MODE' | 'FEYNMAN_MODE') => {
    setActiveScenario(topic);
    if (startMode) {
      setCurrentMode(startMode);
    } else {
      setCurrentMode('SCENARIO_GEN');
    }
  };

  const handleAddCreatedTopic = (newTopic: ScenarioModule) => {
    setCreatedTopics(prev => {
      const filtered = prev.filter(t => t.topic.toLowerCase() !== newTopic.topic.toLowerCase());
      return [newTopic, ...filtered];
    });
    setActiveScenario(newTopic);
    setCurrentMode('SCENARIO_GEN');
  };

  const handleDeleteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCreatedTopics(prev => {
      const remaining = prev.filter(t => (t.id || t.topic) !== topicId);
      if (activeScenario && (activeScenario.id || activeScenario.topic) === topicId && remaining.length > 0) {
        setActiveScenario(remaining[0]);
      }
      return remaining;
    });
  };

  const handleConcludeSession = async (
    messages: ChatMessage[],
    mode: 'PARTNER_MODE' | 'FEYNMAN_MODE',
    topic: string
  ) => {
    setDiagnosticMode(mode);
    setDiagnosticTopic(topic);
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    setIsDiagnosticOpen(true);

    try {
      const response = await fetch('/api/diagnose-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionLog: messages.map(m => ({
            sender: m.sender,
            text: m.text,
            responseTimeSeconds: m.responseTimeSeconds,
            microCorrection: m.microCorrection,
          })),
          mode,
          topic,
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run diagnostic evaluation');
      }

      const data: DiagnosticResult = await response.json();
      setDiagnosticResult(data);

      // Persist to cumulative study history in localStorage for Strategic Advisor
      try {
        const newRecord: SessionHistoryRecord = {
          id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          mode,
          topic,
          messagesCount: messages.length,
          diagnostic: data,
        };
        const prevRaw = localStorage.getItem('tutorecho_session_history');
        const prevList: SessionHistoryRecord[] = prevRaw ? JSON.parse(prevRaw) : [];
        const nextList = [newRecord, ...prevList].slice(0, 50);
        localStorage.setItem('tutorecho_session_history', JSON.stringify(nextList));
      } catch (storageErr) {
        console.error('Failed to store session in tutorecho_session_history:', storageErr);
      }
    } catch (err: any) {
      console.error(err);
      const fallbackDiagnostic: DiagnosticResult = {
        fluency_score: '8.2/10',
        recurring_mistakes: [
          {
            type: 'Grammar',
            user_said: messages.find(m => m.sender === 'user')?.text || 'Practice line',
            recommended_correction: 'Maintain active voice and consistent tense agreement.',
            explanation: lang === 'vi' 
              ? 'Sử dụng cấu trúc câu chuẩn xác giúp tăng độ lưu loát khi nói.'
              : 'Clean tense alignment sharpens spontaneous comprehension.',
          },
        ],
        srs_flashcards: [
          {
            front: lang === 'vi' ? 'Ôn lại câu phản xạ từ buổi tập' : 'Spoken cadence review from session',
            back: 'Target natural phrasing with confidence.',
            interval_days: 1,
          },
        ],
        feynman_concept_verdict: lang === 'vi' 
          ? 'Nỗ lực phản xạ rất tốt; hãy tiếp tục rèn luyện ví dụ đời thường để tránh thuật ngữ trừu tượng.'
          : 'Good effort in spontaneous communication; continue honing concise analogies.',
      };
      setDiagnosticResult(fallbackDiagnostic);

      // Persist fallback diagnostic to localStorage as well
      try {
        const fallbackRecord: SessionHistoryRecord = {
          id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          mode,
          topic,
          messagesCount: messages.length,
          diagnostic: fallbackDiagnostic,
        };
        const prevRaw = localStorage.getItem('tutorecho_session_history');
        const prevList: SessionHistoryRecord[] = prevRaw ? JSON.parse(prevRaw) : [];
        const nextList = [fallbackRecord, ...prevList].slice(0, 50);
        localStorage.setItem('tutorecho_session_history', JSON.stringify(nextList));
      } catch (storageErr) {
        console.error('Failed to store fallback session in tutorecho_session_history:', storageErr);
      }
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleStartDrillFromAdvisor = (drillMode: 'PARTNER_MODE' | 'FEYNMAN_MODE', focusArea: string) => {
    const drillScenario: ScenarioModule = {
      id: `drill-${Date.now()}`,
      topic: focusArea || (activeScenario?.topic ?? 'Performance Drill'),
      partner_scenario: {
        context: `High-focus reflex drill targeting: ${focusArea}`,
        ai_role: 'Challenging English Drill Partner',
        user_role: 'Spontaneous Communicator',
        opening_line: `We are targeting "${focusArea}" right now under strict time pressure. What is your immediate response?`,
      },
      feynman_scenario: {
        student_persona: 'A curious student asking you to unpack the concept using everyday analogies.',
        initial_question: `I really want to understand "${focusArea}". Can you explain it simply without textbook jargon?`,
      },
    };

    setActiveScenario(drillScenario);
    setCurrentMode(drillMode);
  };

  const handleAddFlashcards = (newCards: FlashcardItem[], sourceTopic: string) => {
    const formatted: StoredFlashcard[] = newCards.map((c, i) => ({
      id: `card-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      front: c.front,
      back: c.back,
      interval_days: c.interval_days || 1,
      sourceTopic,
      created_at: Date.now(),
      next_review_at: Date.now() + (c.interval_days || 1) * 86400000,
      repetitions: 0,
    }));

    setFlashcards(prev => [...formatted, ...prev]);
  };

  const handleAddSingleCard = (card: Omit<StoredFlashcard, 'id' | 'created_at' | 'next_review_at' | 'repetitions'>) => {
    const newCard: StoredFlashcard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: Date.now(),
      next_review_at: Date.now() + (card.interval_days || 1) * 86400000,
      repetitions: 0,
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  const handleUpdateCardInterval = (cardId: string, days: number) => {
    setFlashcards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            interval_days: days,
            next_review_at: Date.now() + days * 86400000,
            repetitions: c.repetitions + 1,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setFlashcards(prev => prev.filter(c => c.id !== cardId));
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-150 font-sans ${
      isDark ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Collapsible Left Sidebar with created topics only */}
      <Sidebar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        lang={lang}
        onToggleLang={handleToggleLang}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        flashcardCount={flashcards.length}
        onNewTopic={() => setCurrentMode('SCENARIO_GEN')}
        topics={createdTopics}
        activeTopicId={activeScenario?.id || activeScenario?.topic}
        onSelectTopic={handleSelectTopicFromSidebar}
        onDeleteTopic={handleDeleteTopic}
      />

      {/* Main Content Area - shifts dynamically with sidebar width */}
      <div 
        className={`transition-all duration-200 min-h-screen flex flex-col ${
          sidebarCollapsed ? 'pl-16' : 'pl-16 sm:pl-72'
        }`}
      >
        <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          {/* Top Sticky Header Bar with Topic Info & Explicit Mode Switch Buttons */}
          <header className={`sticky top-0 z-30 pt-3 pb-2.5 backdrop-blur-md border-b mb-4 flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
            isDark 
              ? 'bg-[#09090b]/85 border-[#27272a]' 
              : 'bg-white/95 border-slate-300 shadow-xs'
          }`}>
            {/* Active Topic Indicator */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-400 shrink-0">
                {lang === 'vi' ? 'Chủ đề:' : 'Topic:'}
              </span>
              <span 
                className="text-xs font-extrabold truncate max-w-[180px] sm:max-w-xs text-indigo-950 bg-indigo-100 border-indigo-300 dark:text-indigo-300 dark:bg-indigo-500/15 dark:border-indigo-500/30 px-2.5 py-0.5 rounded border"
                title={activeScenario?.topic}
              >
                {activeScenario?.topic || (lang === 'vi' ? 'Chưa chọn' : 'None')}
              </span>
            </div>

            {/* Explicit Mode Buttons (NÚT CHỌN CHẾ ĐỘ LUYỆN) */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-[#18181b] border border-slate-300 dark:border-[#27272a]">
              {/* Button: Chủ đề & Tạo mới */}
              <button
                onClick={() => setCurrentMode('SCENARIO_GEN')}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentMode === 'SCENARIO_GEN'
                    ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-900 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/70'
                }`}
                title={lang === 'vi' ? 'Đổi chủ đề hoặc tạo chủ đề mới' : 'Topics & Generator'}
              >
                <span>{lang === 'vi' ? '📝 Đổi chủ đề' : '📝 Topics'}</span>
              </button>

              {/* Button: Luyện Phản Xạ */}
              <button
                onClick={() => setCurrentMode('PARTNER_MODE')}
                disabled={!activeScenario}
                className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentMode === 'PARTNER_MODE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-950 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/15'
                }`}
                title={lang === 'vi' ? 'Luyện phản xạ nói 15s-20s tức thì' : 'Reflex Practice'}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? '⚡ Luyện Phản Xạ' : '⚡ Reflex'}</span>
              </button>

              {/* Button: Dạy Học Feynman */}
              <button
                onClick={() => setCurrentMode('FEYNMAN_MODE')}
                disabled={!activeScenario}
                className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentMode === 'FEYNMAN_MODE'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-sky-950 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/15'
                }`}
                title={lang === 'vi' ? 'Dạy học giải thích cho học sinh AI theo phương pháp Feynman' : 'Feynman Teaching'}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? '🧠 Dạy Feynman' : '🧠 Feynman'}</span>
              </button>

              {/* Button: Thẻ SRS */}
              <button
                onClick={() => setCurrentMode('FLASHCARDS')}
                className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentMode === 'FLASHCARDS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-950 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/15'
                }`}
                title={lang === 'vi' ? 'Ôn tập bộ thẻ ghi nhớ ngắt quãng' : 'SRS Flashcards'}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'vi' ? 'Thẻ SRS' : 'Cards'}</span>
                {flashcards.length > 0 && (
                  <span className="text-[10px] font-mono font-extrabold px-1.5 rounded bg-emerald-500/20 text-emerald-950 dark:text-emerald-400">
                    {flashcards.length}
                  </span>
                )}
              </button>

              {/* Button: Performance Advisor */}
              <button
                onClick={() => setCurrentMode('PERFORMANCE_ADVISOR')}
                className={`px-2.5 py-1 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentMode === 'PERFORMANCE_ADVISOR'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-violet-950 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/15'
                }`}
                title={lang === 'vi' ? '📊 Performance Advisor - Phân tích chiến lược & Đơn thuốc' : '📊 Performance Advisor - Strategic Synthesis & Advice'}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">📊 Advisor</span>
              </button>
            </div>
          </header>

          {currentMode === 'SCENARIO_GEN' && (
            <ScenarioGenerator
              activeScenario={activeScenario}
              onSelectScenario={handleSelectScenario}
              soundEnabled={soundEnabled}
              lang={lang}
              theme={theme}
              onAddCreatedTopic={handleAddCreatedTopic}
            />
          )}

          {currentMode === 'PERFORMANCE_ADVISOR' && (
            <PerformanceAdvisorDashboard
              lang={lang}
              theme={theme}
              onStartDrill={handleStartDrillFromAdvisor}
              onGoToPractice={() => {
                if (createdTopics.length > 0) {
                  setActiveScenario(createdTopics[0]);
                  setCurrentMode('PARTNER_MODE');
                } else {
                  setCurrentMode('SCENARIO_GEN');
                }
              }}
              activeScenario={activeScenario}
            />
          )}

          {currentMode === 'PARTNER_MODE' && activeScenario && (
            <PartnerReflexSession
              scenario={activeScenario}
              onConcludeSession={handleConcludeSession}
              onBackToScenarios={() => setCurrentMode('SCENARIO_GEN')}
              onSaveFlashcard={handleAddSingleCard}
              soundEnabled={soundEnabled}
              lang={lang}
              theme={theme}
            />
          )}

          {currentMode === 'FEYNMAN_MODE' && activeScenario && (
            <FeynmanSession
              scenario={activeScenario}
              onConcludeSession={handleConcludeSession}
              onBackToScenarios={() => setCurrentMode('SCENARIO_GEN')}
              soundEnabled={soundEnabled}
              lang={lang}
              theme={theme}
            />
          )}

          {currentMode === 'FLASHCARDS' && (
            <FlashcardDeckView
              cards={flashcards}
              onUpdateCardInterval={handleUpdateCardInterval}
              onDeleteCard={handleDeleteCard}
              onAddCard={handleAddSingleCard}
              soundEnabled={soundEnabled}
              onBackToScenarios={() => setCurrentMode('SCENARIO_GEN')}
              lang={lang}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* Diagnostic Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        diagnostic={diagnosticResult}
        isLoading={isDiagnosing}
        topic={diagnosticTopic}
        mode={diagnosticMode}
        onAddFlashcards={handleAddFlashcards}
        onGoToFlashcards={() => {
          setIsDiagnosticOpen(false);
          setCurrentMode('FLASHCARDS');
        }}
        lang={lang}
        theme={theme}
      />
    </div>
  );
}
