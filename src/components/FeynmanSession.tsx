import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  FileCheck2, 
  ArrowLeft,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';
import { ScenarioModule, ChatMessage } from '../types';
import { speakText, stopSpeaking, soundEffects } from '../utils/audio';
import { SpeechRecorder } from '../utils/speechRecorder';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FeynmanSessionProps {
  scenario: ScenarioModule;
  onConcludeSession: (messages: ChatMessage[], mode: 'FEYNMAN_MODE', topic: string) => void;
  onBackToScenarios: () => void;
  soundEnabled: boolean;
  lang: Language;
  theme?: 'light' | 'dark';
}

export const FeynmanSession: React.FC<FeynmanSessionProps> = ({
  scenario,
  onConcludeSession,
  onBackToScenarios,
  soundEnabled,
  lang,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [studentMasteryStatus, setStudentMasteryStatus] = useState<'probing' | 'confused' | 'enlightened'>('probing');

  const recorderRef = useRef<SpeechRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Set up SpeechRecorder
  useEffect(() => {
    recorderRef.current = new SpeechRecorder({
      lang: 'en',
      onStateChange: (recording) => setIsRecording(recording),
      onTranscribingChange: (transcribing) => setIsTranscribing(transcribing),
      onInterimText: (text) => setInputText(text),
      onFinalText: (text) => {
        setInputText(text);
      },
      onError: (msg) => {
        setMicError(msg);
      },
    });

    return () => {
      if (recorderRef.current?.getIsRecording()) {
        recorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const openingMsg: ChatMessage = {
      id: 'feynman-0',
      sender: 'ai',
      text: scenario.feynman_scenario.initial_question,
      timestamp: Date.now(),
    };
    setMessages([openingMsg]);

    if (soundEnabled) {
      speakText(scenario.feynman_scenario.initial_question, 'Zephyr');
    }

    return () => {
      stopSpeaking();
    };
  }, [scenario]);

  const toggleSpeechRecognition = async () => {
    if (!recorderRef.current) return;
    setMicError(null);

    if (isRecording) {
      const finalTxt = await recorderRef.current.stop();
      if (finalTxt.trim()) {
        setInputText(finalTxt);
      }
    } else {
      const started = await recorderRef.current.start();
      if (!started && !micError) {
        // Error set via callback
      }
    }
  };

  const handleSendExplanation = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (isRecording && recorderRef.current) {
      await recorderRef.current.stop();
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyToSend = [...messages, userMsg].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch('/api/feynman-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: scenario.topic,
          history: historyToSend,
          teacherExplanation: text,
          studentPersona: scenario.feynman_scenario.student_persona,
        }),
      });

      if (!response.ok) {
        throw new Error('Feynman chat error');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setStudentMasteryStatus(data.studentState || 'probing');

      if (data.studentState === 'enlightened' && soundEnabled) {
        soundEffects.playSuccess();
      }

      if (soundEnabled) {
        speakText(data.reply, 'Zephyr');
      }
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Could you rephrase that using a real-world example? I want to make sure I truly understand the core idea.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-14 pt-2">
      {/* Top Header Card - Flat UI */}
      <div className={`p-4 rounded-xl border ${
        isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-sm'
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onBackToScenarios}
            className={`flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950 font-bold'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.feynmanSession.switchScenario}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Student State Indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-100 border-slate-300 text-slate-950'
            }`}>
              {studentMasteryStatus === 'enlightened' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{t.feynmanSession.statusEnlightened}</span>
                </>
              ) : studentMasteryStatus === 'confused' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 dark:text-amber-400 font-extrabold">{t.feynmanSession.statusConfused}</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-sky-800 dark:text-sky-400 font-extrabold">{t.feynmanSession.statusProbing}</span>
                </>
              )}
            </div>

            {/* Conclude Session Button */}
            <button
              onClick={() => onConcludeSession(messages, 'FEYNMAN_MODE', scenario.topic)}
              disabled={messages.filter((m) => m.sender === 'user').length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t.reflexSession.diagnoseBtn}</span>
            </button>
          </div>
        </div>

        {/* Roles Details */}
        <div className={`mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs ${
          isDark ? 'border-[#27272a]' : 'border-slate-200'
        }`}>
          <div>
            <span className="text-slate-700 dark:text-slate-400 block font-bold">{t.feynmanSession.topicLabel}</span>
            <span className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">{scenario.topic}</span>
          </div>
          <div>
            <span className="text-slate-700 dark:text-slate-400 block font-bold">{t.feynmanSession.studentPersona}</span>
            <span className="text-sky-900 dark:text-sky-400 font-extrabold">{scenario.feynman_scenario.student_persona}</span>
          </div>
        </div>
      </div>

      {/* Feynman Golden Rule Hint Banner - Flat UI */}
      <div className={`border rounded-lg p-3 flex items-start gap-2.5 text-xs ${
        isDark ? 'bg-[#121214] border-sky-800/60 text-slate-200' : 'bg-amber-50 border-amber-300 text-slate-950 shadow-xs'
      }`}>
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-extrabold text-amber-950 dark:text-amber-400">{t.feynmanSession.goldenRuleTitle} </span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">{t.feynmanSession.goldenRuleDesc}</span>
        </div>
      </div>

      {/* Dialogue Arena - Flat UI */}
      <div className={`border rounded-xl p-4 sm:p-5 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3.5 ${
        isDark ? 'bg-[#0d1117] border-slate-800' : 'bg-slate-100/90 border-slate-300'
      }`}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-400 px-1 font-bold">
                <span>{isUser ? t.feynmanSession.teacherBadge : t.feynmanSession.studentBadge}</span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-none font-medium shadow-xs'
                    : isDark 
                      ? 'bg-[#161b22] border border-slate-800 text-slate-100 rounded-bl-none font-medium'
                      : 'bg-white border border-slate-300 text-slate-950 rounded-bl-none shadow-sm font-semibold'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p>{msg.text}</p>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, 'Zephyr')}
                      title={t.scenarioGen.listen}
                      className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 shrink-0 mt-0.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg w-fit border ${
            isDark ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-slate-900 bg-white border-slate-300 shadow-sm font-bold'
          }`}>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>{t.feynmanSession.studentThinking}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Teacher Explanation Input Controller - Flat UI */}
      <div className={`border rounded-xl p-3 ${
        isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-sm'
      }`}>
        {/* Inline Mic Error Alert */}
        {micError && (
          <div className="mb-2 p-2.5 rounded-lg bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-950 dark:text-red-200 text-xs flex items-center justify-between gap-2 font-medium">
            <span>⚠️ {micError}</span>
            <button
              onClick={() => setMicError(null)}
              className="px-2 py-0.5 font-bold hover:underline cursor-pointer text-[11px] text-red-900 dark:text-red-200"
            >
              {lang === 'vi' ? 'Đóng' : 'Dismiss'}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Button */}
          <button
            onClick={toggleSpeechRecognition}
            disabled={isTranscribing}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-400'
                : isTranscribing
                  ? 'bg-sky-600 text-white'
                  : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700'
                    : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300'
            }`}
            title={
              isRecording 
                ? t.reflexSession.stopMic 
                : isTranscribing
                  ? (lang === 'vi' ? 'Đang nhận diện lời giảng...' : 'Transcribing...')
                  : t.reflexSession.listenMic
            }
          >
            {isRecording ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : isTranscribing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Mic className="w-5 h-5 text-sky-800 dark:text-sky-400" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendExplanation();
                }
              }}
              placeholder={
                isRecording 
                  ? (lang === 'vi' ? '🎙️ Đang lắng nghe lời giảng... Bấm mic để hoàn tất' : '🎙️ Listening... Click mic to finish') 
                  : isTranscribing
                    ? (lang === 'vi' ? '⏳ Đang chuyển giọng nói thành chữ...' : '⏳ Transcribing explanation...')
                    : t.feynmanSession.inputPlaceholder
              }
              className={`w-full border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none font-medium ${
                isDark 
                  ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-sky-500' 
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:border-sky-600 font-semibold'
              }`}
            />
          </div>

          {/* Send Explanation Button */}
          <button
            onClick={() => handleSendExplanation()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 px-1 font-semibold">
          <span>{t.feynmanSession.footerRule}</span>
          <span className="font-mono">{t.reflexSession.pressEnter}</span>
        </div>
      </div>
    </div>
  );
};
