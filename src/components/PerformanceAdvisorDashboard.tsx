import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Brain, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Play, 
  Database, 
  Layers, 
  BarChart3,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { 
  StrategicAdvisorReport, 
  SessionHistoryRecord, 
  ScenarioModule, 
  OperationalMode 
} from '../types';
import { Language } from '../i18n/translations';

interface PerformanceAdvisorDashboardProps {
  lang: Language;
  theme: 'light' | 'dark';
  onStartDrill: (mode: 'PARTNER_MODE' | 'FEYNMAN_MODE', focusArea: string) => void;
  onGoToPractice: () => void;
  activeScenario?: ScenarioModule;
}

const SAMPLE_SESSION_HISTORY: SessionHistoryRecord[] = [
  {
    id: 'sample-session-1',
    timestamp: Date.now() - 86400000 * 2,
    mode: 'PARTNER_MODE',
    topic: 'Product Deadline Renegotiation & Emergency Strategy',
    messagesCount: 8,
    diagnostic: {
      fluency_score: '7.8/10',
      recurring_mistakes: [
        {
          type: 'Grammar',
          user_said: 'If we will launch next week, it will be disaster.',
          recommended_correction: 'If we launch next week, it will be a disaster.',
          explanation: 'In the first conditional, use Present Simple in the if-clause, not "will".'
        },
        {
          type: 'Vocabulary',
          user_said: 'We need to make our team more strong.',
          recommended_correction: 'We need to strengthen our team / make our team stronger.',
          explanation: 'Use comparative "stronger" or verb "strengthen".'
        }
      ],
      srs_flashcards: [
        {
          front: 'If we [launch] next week... (First Conditional)',
          back: 'If we launch next week, it will be a disaster.',
          interval_days: 1
        }
      ],
      feynman_concept_verdict: 'Good direct reflex under time pressure; minor tense slip in conditionals.'
    }
  },
  {
    id: 'sample-session-2',
    timestamp: Date.now() - 86400000 * 1,
    mode: 'FEYNMAN_MODE',
    topic: 'Present Perfect vs Past Simple in Real Life',
    messagesCount: 6,
    diagnostic: {
      fluency_score: '8.4/10',
      recurring_mistakes: [
        {
          type: 'Vocabulary',
          user_said: 'I have seen him yesterday at the office cafeteria.',
          recommended_correction: 'I saw him yesterday at the office cafeteria.',
          explanation: 'Specific past time marker "yesterday" requires Simple Past, not Present Perfect.'
        }
      ],
      srs_flashcards: [
        {
          front: 'I [saw/have seen] him yesterday...',
          back: 'I saw him yesterday at the office cafeteria.',
          interval_days: 2
        }
      ],
      feynman_concept_verdict: 'Explained the timeline concept well, but still mixed up specific time markers with present relevance.'
    }
  },
  {
    id: 'sample-session-3',
    timestamp: Date.now() - 3600000 * 4,
    mode: 'PARTNER_MODE',
    topic: 'Defending Strategic Cost Reduction to the Board',
    messagesCount: 10,
    diagnostic: {
      fluency_score: '8.6/10',
      recurring_mistakes: [
        {
          type: 'Grammar',
          user_said: 'We should consider to outsource non-core operations.',
          recommended_correction: 'We should consider outsourcing non-core operations.',
          explanation: 'The verb "consider" is followed by a gerund (-ing), not an infinitive.'
        }
      ],
      srs_flashcards: [
        {
          front: 'Consider [outsource / outsourcing]...',
          back: 'We should consider outsourcing non-core operations.',
          interval_days: 1
        }
      ],
      feynman_concept_verdict: 'Excellent vocal confidence and rapid replies.'
    }
  }
];

export const PerformanceAdvisorDashboard: React.FC<PerformanceAdvisorDashboardProps> = ({
  lang,
  theme,
  onStartDrill,
  onGoToPractice,
  activeScenario
}) => {
  const isDark = theme === 'dark';
  const [sessions, setSessions] = useState<SessionHistoryRecord[]>([]);
  const [report, setReport] = useState<StrategicAdvisorReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<number | null>(null);

  // Load sessions from localStorage
  const loadSessionsFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('tutorecho_session_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as SessionHistoryRecord[];
        }
      }
    } catch (e) {
      console.error('Failed to parse tutorecho_session_history:', e);
    }
    return [];
  }, []);

  // Fetch synthesis report from server
  const generateStrategicReport = useCallback(async (sessionData: SessionHistoryRecord[]) => {
    if (sessionData.length === 0) {
      setReport(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Data Aggregation
    const extractedMistakes: string[] = [];
    const recentScores: string[] = [];
    const feynmanNotes: string[] = [];

    sessionData.forEach(s => {
      if (s.diagnostic?.fluency_score) {
        recentScores.push(s.diagnostic.fluency_score);
      }
      if (Array.isArray(s.diagnostic?.recurring_mistakes)) {
        s.diagnostic.recurring_mistakes.forEach(m => {
          extractedMistakes.push(
            `[${m.type}] User said: "${m.user_said}" -> Fix: "${m.recommended_correction}" (${m.explanation})`
          );
        });
      }
      if (s.mode === 'FEYNMAN_MODE' && s.diagnostic?.feynman_concept_verdict) {
        feynmanNotes.push(`Topic "${s.topic}": ${s.diagnostic.feynman_concept_verdict}`);
      }
    });

    // 2. Format the exact payload as specified in user brief
    const formattedPrompt = `[STRATEGIC_ADVISOR]
Cumulative Study Data:
- Logged recurring mistakes: [${extractedMistakes.join('; ') || 'None logged'}]
- Average fluency scores: [${recentScores.join(', ') || 'N/A'}]
- Teaching/Feynman notes: [${feynmanNotes.join('; ') || 'None logged'}]

Please synthesize my results, point out my critical bottlenecks, and provide an actionable next-step prescription in pure JSON.`;

    try {
      const response = await fetch('/api/strategic-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: formattedPrompt,
          recurringMistakes: extractedMistakes,
          fluencyScores: recentScores,
          feynmanNotes: feynmanNotes,
          lang
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate strategic advisor synthesis');
      }

      const data: StrategicAdvisorReport = await response.json();
      setReport(data);
      setLastAnalyzedAt(Date.now());
      // Cache report in localStorage
      localStorage.setItem('tutorecho_latest_advisor_report', JSON.stringify({
        report: data,
        timestamp: Date.now()
      }));
    } catch (err: any) {
      console.error('Advisor generation error:', err);
      setError(err?.message || 'Could not connect to Strategic Advisor AI engine.');
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  // Initial load
  useEffect(() => {
    const loaded = loadSessionsFromStorage();
    setSessions(loaded);

    // Check if we have a fresh cached report
    const cached = localStorage.getItem('tutorecho_latest_advisor_report');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.report && loaded.length > 0) {
          setReport(parsed.report);
          setLastAnalyzedAt(parsed.timestamp || Date.now());
          return;
        }
      } catch (e) {
        // ignore cache parse failure
      }
    }

    if (loaded.length > 0) {
      generateStrategicReport(loaded);
    }
  }, [loadSessionsFromStorage, generateStrategicReport]);

  // Handle loading sample data
  const handleLoadSampleData = () => {
    try {
      localStorage.setItem('tutorecho_session_history', JSON.stringify(SAMPLE_SESSION_HISTORY));
      setSessions(SAMPLE_SESSION_HISTORY);
      generateStrategicReport(SAMPLE_SESSION_HISTORY);
    } catch (e) {
      console.error('Failed to store sample session history:', e);
    }
  };

  // Calculate high-level stats
  const averageScoreNumber = sessions.reduce((acc, s) => {
    const match = s.diagnostic?.fluency_score?.match(/([\d.]+)/);
    return acc + (match ? parseFloat(match[1]) : 8.0);
  }, 0) / (sessions.length || 1);

  const totalMistakesLogged = sessions.reduce((acc, s) => {
    return acc + (s.diagnostic?.recurring_mistakes?.length || 0);
  }, 0);

  // Trigger drill from prescription
  const handleTriggerDrill = (item: { trigger_next_mode: string; focus_area: string }) => {
    const modeStr = item.trigger_next_mode || '';
    const targetMode: 'PARTNER_MODE' | 'FEYNMAN_MODE' = 
      modeStr.includes('FEYNMAN') ? 'FEYNMAN_MODE' : 'PARTNER_MODE';
    onStartDrill(targetMode, item.focus_area);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark 
          ? 'bg-[#121214] border-[#27272a] shadow-lg shadow-black/20' 
          : 'bg-white border-slate-300 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-violet-600 text-white font-extrabold shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Performance Advisor
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full font-bold bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/30">
                    STRATEGIC AI
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  {lang === 'vi' 
                    ? 'Tổng hợp dữ liệu phản xạ & sư phạm, định vị điểm nghẽn và kê đơn luyện tập chính xác.'
                    : 'Synthesize cumulative reflex & pedagogical data, identify bottlenecks, and prescribe targeted drills.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sessions.length > 0 && (
              <button
                onClick={() => generateStrategicReport(sessions)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLoading 
                    ? 'opacity-60 cursor-not-allowed bg-slate-200 dark:bg-[#27272a] text-slate-500' 
                    : isDark
                      ? 'bg-[#1e1e24] hover:bg-[#282832] text-violet-300 hover:text-white border border-violet-500/30'
                      : 'bg-violet-50 hover:bg-violet-100 text-violet-950 border border-violet-300'
                }`}
                title={lang === 'vi' ? 'Chạy lại tổng hợp dữ liệu với Gemini' : 'Re-run analysis with Gemini'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? (lang === 'vi' ? 'Đang phân tích...' : 'Analyzing...') : (lang === 'vi' ? 'Cập nhật phân tích' : 'Refresh Analysis')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Aggregate Metrics Bar */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200 dark:border-[#27272a]">
            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Buổi tập đã lưu' : 'Analyzed Sessions'}
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {sessions.length}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Điểm lưu loát trung bình' : 'Avg Fluency'}
              </span>
              <div className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-0.5">
                {averageScoreNumber.toFixed(1)}/10
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Lỗi được ghi nhận' : 'Logged Mistakes'}
              </span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                {totalMistakesLogged}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Chế độ hoạt động' : 'Advisor Engine'}
              </span>
              <div className="text-sm font-extrabold text-violet-700 dark:text-violet-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>[STRATEGIC]</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case 1: Empty State (No session data exists yet) */}
      {sessions.length === 0 && (
        <div className={`p-8 sm:p-12 text-center rounded-2xl border transition-all ${
          isDark 
            ? 'bg-[#121214] border-[#27272a] shadow-lg shadow-black/20' 
            : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center">
            <Database className="w-8 h-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            {lang === 'vi' ? 'Chưa có đủ dữ liệu học tập' : 'Learning History Awaiting Data'}
          </h2>

          {/* Exact required fallback message */}
          <p className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 max-w-lg mx-auto mb-6">
            {lang === 'vi'
              ? 'Not enough data yet. Complete at least one practice or teaching session to unlock your strategic performance report.'
              : 'Not enough data yet. Complete at least one practice or teaching session to unlock your strategic performance report.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToPractice}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Bắt đầu một buổi tập ngay' : 'Start a Practice Session'}</span>
            </button>

            <button
              onClick={handleLoadSampleData}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isDark 
                  ? 'bg-[#18181b] hover:bg-[#27272a] text-slate-300 hover:text-white border-[#3f3f46]' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === 'vi' ? 'Nạp dữ liệu mẫu để trải nghiệm' : 'Load Sample Practice Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Loading State */}
      {isLoading && sessions.length > 0 && !report && (
        <div className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300'
        }`}>
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            {lang === 'vi' ? 'Gemini đang tổng hợp dữ liệu học tập...' : 'Gemini is synthesizing your learning records...'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {lang === 'vi' 
              ? 'Phân tích điểm số, trích xuất lỗ hổng ngữ pháp và thiết lập đơn thuốc cải thiện.' 
              : 'Extracting recurring mistakes, evaluating fluency curve, and preparing strategic prescriptions.'}
          </p>
        </div>
      )}

      {/* Case 3: Error Banner */}
      {error && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          isDark 
            ? 'bg-red-950/30 border-red-800 text-red-300' 
            : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="flex-1 text-xs font-semibold">
            <span>{error}</span>
          </div>
          <button
            onClick={() => generateStrategicReport(sessions)}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 cursor-pointer"
          >
            {lang === 'vi' ? 'Thử lại' : 'Retry'}
          </button>
        </div>
      )}

      {/* Case 4: Report Display */}
      {report && (
        <div className="space-y-6">
          {/* 1. IMMEDIATE CHALLENGE (Highlighted at the top) */}
          {report.immediate_challenge && (
            <div className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-[#121214] border-violet-500/40 shadow-lg shadow-violet-950/20' 
                : 'bg-gradient-to-r from-violet-100 via-indigo-50 to-white border-violet-300 shadow-sm'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-violet-600 text-white shrink-0 mt-0.5 shadow-sm">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                      {lang === 'vi' ? '🔥 Thử thách tức thì (Immediate Challenge)' : '🔥 Immediate Strategic Challenge'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full font-bold bg-violet-500/20 text-violet-800 dark:text-violet-300 border border-violet-500/30">
                      HIGH IMPACT
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white leading-relaxed">
                    "{report.immediate_challenge}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. OVERALL ASSESSMENT & STRENGTHS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Overall Assessment */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Đánh giá tổng quan (Overall Assessment)' : 'Overall Assessment'}
                </h2>
              </div>
              
              <div className={`p-4 rounded-xl border mb-3 ${
                isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {report.performance_summary.overall_mastery}
                </p>
              </div>

              {report.pedagogical_growth && (
                <div className="mt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    {lang === 'vi' ? 'Tăng trưởng tư duy (Pedagogical Growth):' : 'Pedagogical Growth:'}
                  </span>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{report.pedagogical_growth}"
                  </p>
                </div>
              )}
            </div>

            {/* Core Strengths */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-xs'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Điểm mạnh cốt lõi (Core Strengths)' : 'Core Strengths'}
                </h2>
              </div>

              <div className="space-y-2.5">
                {report.performance_summary.core_strengths.map((str, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                      isDark 
                        ? 'bg-[#18181b] border-emerald-900/40 text-slate-200' 
                        : 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {str}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. CRITICAL BOTTLENECK (Lỗ hổng kiến thức/phản xạ) */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                {lang === 'vi' ? 'Lỗ hổng kiến thức / Phản xạ (Critical Bottlenecks)' : 'Critical Bottlenecks'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report.performance_summary.critical_bottlenecks.map((b, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border space-y-2 ${
                    isDark 
                      ? 'bg-[#18181b] border-amber-900/40' 
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      !
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-300">
                      {b.issue}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-slate-200">{lang === 'vi' ? 'Tác động: ' : 'Impact: '}</span>
                    {b.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ACTIONABLE STEPS (With Quick "Start Drill" Button) */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Kế hoạch hành động & Đơn thuốc (Actionable Steps)' : 'Actionable Prescription'}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {lang === 'vi' ? 'Nhấn "Bắt đầu luyện" để kích hoạt ngay' : 'Click "Start Drill" to practice'}
              </span>
            </div>

            <div className="space-y-3">
              {report.actionable_prescription.map((step, idx) => {
                const isPartner = step.trigger_next_mode?.includes('PARTNER');
                const isFeynman = step.trigger_next_mode?.includes('FEYNMAN');

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isDark 
                        ? 'bg-[#18181b] border-[#27272a] hover:border-violet-500/50' 
                        : 'bg-slate-50 border-slate-300 hover:border-violet-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Priority Badge */}
                      <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                        step.priority === 1
                          ? 'bg-rose-600 text-white shadow-xs'
                          : step.priority === 2
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                      }`}>
                        #{step.priority}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-white">
                            {step.focus_area}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold border ${
                            isPartner 
                              ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30'
                              : isFeynman 
                                ? 'bg-sky-500/10 text-sky-800 dark:text-sky-400 border-sky-500/30'
                                : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
                          }`}>
                            {isPartner ? '⚡ REFLEX' : isFeynman ? '🧠 FEYNMAN' : step.trigger_next_mode}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                          {step.recommended_action}
                        </p>
                      </div>
                    </div>

                    {/* Quick "Start Drill" Action Button */}
                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleTriggerDrill(step)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                          isPartner
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : isFeynman
                              ? 'bg-sky-600 hover:bg-sky-500 text-white'
                              : 'bg-violet-600 hover:bg-violet-500 text-white'
                        }`}
                        title={lang === 'vi' ? 'Bắt đầu buổi luyện tập theo chỉ định này' : 'Launch targeted drill immediately'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === 'vi' ? 'Bắt đầu luyện' : 'Start Drill'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
