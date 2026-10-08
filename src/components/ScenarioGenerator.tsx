import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Brain, 
  ArrowRight, 
  Mic, 
  MicOff, 
  Volume2, 
  RefreshCw,
  Plus,
  Play
} from 'lucide-react';
import { ScenarioModule } from '../types';
import { speakText } from '../utils/audio';
import { SpeechRecorder } from '../utils/speechRecorder';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ScenarioGeneratorProps {
  onSelectScenario: (scenario: ScenarioModule, startMode: 'PARTNER_MODE' | 'FEYNMAN_MODE') => void;
  activeScenario: ScenarioModule | null;
  soundEnabled: boolean;
  lang: Language;
  theme: 'light' | 'dark';
  onAddCreatedTopic?: (topic: ScenarioModule) => void;
}

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({
  onSelectScenario,
  activeScenario,
  soundEnabled,
  lang,
  theme,
  onAddCreatedTopic,
}) => {
  const t = TRANSLATIONS[lang];
  const [studyText, setStudyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const isDark = theme === 'dark';
  const recorderRef = useRef<SpeechRecorder | null>(null);

  // Initialize SpeechRecorder
  useEffect(() => {
    recorderRef.current = new SpeechRecorder({
      lang,
      onStateChange: (recording) => setIsRecording(recording),
      onTranscribingChange: (transcribing) => setIsTranscribing(transcribing),
      onInterimText: (text) => setStudyText(text),
      onFinalText: (text) => {
        setStudyText(text);
        if (text.trim()) {
          handleGenerate(text);
        }
      },
      onError: (errMsg) => setError(errMsg),
    });

    return () => {
      if (recorderRef.current?.getIsRecording()) {
        recorderRef.current.stop();
      }
    };
  }, [lang]);

  const toggleSpeechInput = async () => {
    if (!recorderRef.current) return;
    setError(null);

    if (isRecording) {
      await recorderRef.current.stop();
    } else {
      const started = await recorderRef.current.start();
      if (!started && !error) {
        // Error will be dispatched via onError callback
      }
    }
  };

  const handleGenerate = async (textToUse?: string) => {
    const text = (textToUse || studyText).trim();
    if (!text) {
      setError(lang === 'vi' ? 'Vui lòng nhập chủ đề bạn muốn luyện.' : 'Please enter a topic to practice.');
      return;
    }

    if (isRecording && recorderRef.current) {
      await recorderRef.current.stop();
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/scenario-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyText: text }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate scenario module');
      }

      const data: ScenarioModule = await response.json();
      if (!data.id) {
        data.id = `custom-${Date.now()}`;
      }
      if (onAddCreatedTopic) {
        onAddCreatedTopic(data);
      }
      setStudyText('');
    } catch (err: any) {
      const rawMsg = err.message || '';
      if (rawMsg.includes('503') || rawMsg.includes('demand') || rawMsg.includes('UNAVAILABLE')) {
        setError(
          lang === 'vi'
            ? 'Cụm máy chủ Gemini đang tạm thời quá tải cao điểm (503). Đang kích hoạt chủ đề dự phòng. Bấm Thử lại ngay.'
            : 'The AI model is experiencing high demand (503). Click Retry.'
        );
      } else {
        setError(rawMsg || (lang === 'vi' ? 'Không thể kết nối đến bộ tạo kịch bản.' : 'Error generating scenario.'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const playLineAudio = (line: string) => {
    if (!soundEnabled) return;
    speakText(line);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 sm:pt-6">
      {/* Minimal Centered Creation Bar: Input + mic + create button */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className={`flex items-center gap-2 p-1.5 pl-4 rounded-xl border transition-all ${
            isDark 
              ? 'bg-[#121214] border-[#27272a] focus-within:border-indigo-500' 
              : 'bg-white border-slate-300 focus-within:border-indigo-600 shadow-sm'
          }`}
        >
          {/* Input field */}
          <input
            type="text"
            value={studyText}
            onChange={(e) => setStudyText(e.target.value)}
            placeholder={
              isRecording 
                ? (lang === 'vi' ? '🎙️ Đang nghe giọng nói... Bấm mic để dừng' : '🎙️ Listening... Click mic to finish') 
                : isTranscribing
                  ? (lang === 'vi' ? '⏳ Đang chuyển giọng nói thành chữ...' : '⏳ Transcribing voice...')
                  : (lang === 'vi' ? 'Nhập chủ đề hoặc ngữ pháp muốn luyện...' : 'Enter a speaking topic or grammar rule...')
            }
            className={`flex-1 bg-transparent border-none text-sm focus:outline-none font-medium ${
              isDark ? 'text-[#f4f4f5] placeholder:text-slate-500' : 'text-slate-950 placeholder:text-slate-500 font-semibold'
            }`}
          />

          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleSpeechInput}
            disabled={isTranscribing}
            title={isRecording 
              ? (lang === 'vi' ? 'Dừng ghi âm (Hoàn tất)' : 'Stop mic') 
              : isTranscribing
                ? (lang === 'vi' ? 'Đang nhận diện giọng nói...' : 'Transcribing...')
                : (lang === 'vi' ? 'Nói qua Micro' : 'Voice input')
            }
            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isRecording 
                ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400' 
                : isTranscribing
                  ? 'bg-amber-600 text-white'
                  : isDark 
                    ? 'hover:bg-[#27272a] text-indigo-400 hover:text-white' 
                    : 'hover:bg-indigo-100 text-indigo-800 bg-indigo-50 border border-indigo-200'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : isTranscribing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Mic className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            )}
          </button>

          {/* Create Button (Nút Tạo) */}
          <button
            type="submit"
            disabled={isGenerating || !studyText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{lang === 'vi' ? 'Đang tạo...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{lang === 'vi' ? 'Tạo chủ đề' : 'Create'}</span>
              </>
            )}
          </button>
        </form>

        {/* Error notification banner with Retry button */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 text-xs flex items-center justify-between flex-wrap gap-2 text-left font-medium">
            <span>⚠️ {error}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setError(null)}
                className="px-2 py-0.5 text-[11px] font-bold text-red-800 dark:text-red-300 hover:underline cursor-pointer"
              >
                {lang === 'vi' ? 'Bỏ qua' : 'Dismiss'}
              </button>
              <button
                onClick={() => handleGenerate()}
                className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-[11px] transition-colors cursor-pointer shrink-0"
              >
                {lang === 'vi' ? 'Thử lại ngay' : 'Retry Now'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Selected/Created Topic Practice Section */}
      {activeScenario && (
        <div className="space-y-5 pt-2">
          {/* Header with Topic Name and Quick Mode Launch Hero */}
          <div className={`p-4 sm:p-5 rounded-xl border ${
            isDark 
              ? 'bg-[#121214] border-[#27272a]' 
              : 'bg-white border-slate-300 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-[#27272a]">
              <div>
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-400 block">
                  {lang === 'vi' ? 'CHỦ ĐỀ ĐANG CHỌN' : 'CURRENT SELECTED TOPIC'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-0.5 text-slate-950 dark:text-white">
                  {activeScenario.topic}
                </h2>
              </div>
              <span className="text-xs text-slate-800 dark:text-slate-400 font-bold self-start sm:self-auto">
                {lang === 'vi' ? 'Chọn 1 trong 2 chế độ dưới đây để luyện ngay 👇' : 'Choose a mode below to start practicing 👇'}
              </span>
            </div>

            {/* TWO BIG PROMINENT MODE BUTTONS (NÚT CHỌN CHẾ ĐỘ LUYỆN TẬP RÕ RÀNG) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {/* Button Mode 1: Luyện Phản Xạ */}
              <button
                onClick={() => onSelectScenario(activeScenario, 'PARTNER_MODE')}
                className="group relative flex flex-col p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all text-left cursor-pointer border border-amber-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-200" />
                    </div>
                    <span className="font-extrabold text-base sm:text-lg tracking-tight">
                      {lang === 'vi' ? '1. Luyện Phản Xạ Nói' : '1. Spoken Reflex Blitz'}
                    </span>
                  </div>
                  <span className="p-1.5 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-50 leading-relaxed font-medium">
                  {lang === 'vi' 
                    ? 'Đếm ngược 15s-20s ép phản xạ bật ra tức thì, AI đối thoại 1-2 câu và tự động sửa lỗi vi mô.' 
                    : '15s-20s timer to break hesitation with conversational AI and instant micro-fixes.'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-amber-950 bg-amber-100 py-2 px-3.5 rounded-lg self-start shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'vi' ? 'Bấm để Luyện Phản Xạ Ngay' : 'Click to practice Reflex Now'}</span>
                </div>
              </button>

              {/* Button Mode 2: Dạy Học Feynman */}
              <button
                onClick={() => onSelectScenario(activeScenario, 'FEYNMAN_MODE')}
                className="group relative flex flex-col p-4 sm:p-5 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-md hover:shadow-lg transition-all text-left cursor-pointer border border-sky-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-black/25 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-sky-200" />
                    </div>
                    <span className="font-extrabold text-base sm:text-lg tracking-tight">
                      {lang === 'vi' ? '2. Dạy Học Feynman' : '2. Feynman Teaching'}
                    </span>
                  </div>
                  <span className="p-1.5 rounded-full bg-white/20 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-sky-50 leading-relaxed font-medium">
                  {lang === 'vi' 
                    ? 'Bạn làm giáo viên giải thích cho học sinh AI tò mò. Ép dùng từ đơn giản, ví dụ thực tế đời sống.' 
                    : 'Act as teacher explaining to a curious student AI. Eliminate jargon with simple analogies.'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-sky-950 bg-sky-100 py-2 px-3.5 rounded-lg self-start shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'vi' ? 'Bấm để Dạy Feynman Ngay' : 'Click to practice Feynman Now'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Twin Module Details Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Spoken Reflex Details */}
            <div className={`rounded-xl p-5 border flex flex-col justify-between transition-colors ${
              isDark 
                ? 'bg-[#121214] border-amber-900/50 hover:border-amber-700' 
                : 'bg-white border-amber-300 hover:border-amber-400 shadow-sm'
            }`}>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{t.scenarioGen.reflexTitle}</h3>
                      <p className="text-[11px] text-amber-900 dark:text-amber-400 font-extrabold">{t.scenarioGen.reflexTag}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#18181b] text-slate-300 border-[#27272a]' : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}>
                    Reflex Timer
                  </span>
                </div>

                <div className={`space-y-2.5 text-xs p-3.5 rounded-lg border ${
                  isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-slate-50 border-slate-300'
                }`}>
                  <div>
                    <span className="text-slate-700 dark:text-slate-400 font-bold block">{t.scenarioGen.reflexContext}</span>
                    <p className="mt-0.5 font-extrabold text-slate-950 dark:text-slate-100">{activeScenario.partner_scenario.context}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300 dark:border-[#27272a]">
                    <div>
                      <span className="text-slate-700 dark:text-slate-400 font-bold block">{t.scenarioGen.aiRole}</span>
                      <p className="text-amber-900 dark:text-amber-400 font-extrabold mt-0.5">{activeScenario.partner_scenario.ai_role}</p>
                    </div>
                    <div>
                      <span className="text-slate-700 dark:text-slate-400 font-bold block">{t.scenarioGen.yourRole}</span>
                      <p className="text-indigo-900 dark:text-indigo-400 font-extrabold mt-0.5">{activeScenario.partner_scenario.user_role}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-300 dark:border-[#27272a]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-400 font-bold">{t.scenarioGen.openingLine}</span>
                      <button
                        onClick={() => playLineAudio(activeScenario.partner_scenario.opening_line)}
                        className="text-amber-900 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 text-[11px] font-extrabold cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> {t.scenarioGen.listen}
                      </button>
                    </div>
                    <blockquote className={`mt-1 italic p-2.5 rounded border-l-4 border-amber-500 font-bold ${
                      isDark ? 'bg-[#121214] text-slate-100' : 'bg-amber-50 text-slate-950'
                    }`}>
                      "{activeScenario.partner_scenario.opening_line}"
                    </blockquote>
                  </div>
                </div>

                <ul className="text-xs text-slate-800 dark:text-slate-300 space-y-1 pl-1 font-semibold">
                  <li>• {t.scenarioGen.reflexBullet1}</li>
                  <li>• {t.scenarioGen.reflexBullet2}</li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onSelectScenario(activeScenario, 'PARTNER_MODE')}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t.scenarioGen.btnLaunchReflex}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Feynman Deep Understanding Details */}
            <div className={`rounded-xl p-5 border flex flex-col justify-between transition-colors ${
              isDark 
                ? 'bg-[#121214] border-sky-900/50 hover:border-sky-700' 
                : 'bg-white border-sky-300 hover:border-sky-400 shadow-sm'
            }`}>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{t.scenarioGen.feynmanTitle}</h3>
                      <p className="text-[11px] text-sky-900 dark:text-sky-400 font-extrabold">{t.scenarioGen.feynmanTag}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                    isDark ? 'bg-[#18181b] text-slate-300 border-[#27272a]' : 'bg-sky-100 text-sky-950 border-sky-300'
                  }`}>
                    Socratic
                  </span>
                </div>

                <div className={`space-y-2.5 text-xs p-3.5 rounded-lg border ${
                  isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-slate-50 border-slate-300'
                }`}>
                  <div>
                    <span className="text-slate-700 dark:text-slate-400 font-bold block">{t.scenarioGen.personaLabel}</span>
                    <p className="text-sky-900 dark:text-sky-400 font-extrabold mt-0.5">{activeScenario.feynman_scenario.student_persona}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-300 dark:border-[#27272a]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-400 font-bold">{t.scenarioGen.questionLabel}</span>
                      <button
                        onClick={() => playLineAudio(activeScenario.feynman_scenario.initial_question)}
                        className="text-sky-900 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1 text-[11px] font-extrabold cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> {t.scenarioGen.listen}
                      </button>
                    </div>
                    <blockquote className={`mt-1 italic p-2.5 rounded border-l-4 border-sky-500 font-bold ${
                      isDark ? 'bg-[#121214] text-slate-100' : 'bg-sky-50 text-slate-950'
                    }`}>
                      "{activeScenario.feynman_scenario.initial_question}"
                    </blockquote>
                  </div>
                </div>

                <ul className="text-xs text-slate-800 dark:text-slate-300 space-y-1 pl-1 font-semibold">
                  <li>• {t.scenarioGen.feynmanBullet1}</li>
                  <li>• {t.scenarioGen.feynmanBullet2}</li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onSelectScenario(activeScenario, 'FEYNMAN_MODE')}
                  className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Brain className="w-4 h-4" />
                  <span>{t.scenarioGen.btnLaunchFeynman}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
