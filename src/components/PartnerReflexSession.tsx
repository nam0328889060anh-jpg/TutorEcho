import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  FileCheck2, 
  Clock, 
  Flame, 
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { ScenarioModule, ChatMessage, StoredFlashcard } from '../types';
import { speakText, stopSpeaking, soundEffects } from '../utils/audio';
import { SpeechRecorder } from '../utils/speechRecorder';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface PartnerReflexSessionProps {
  scenario: ScenarioModule;
  onConcludeSession: (messages: ChatMessage[], mode: 'PARTNER_MODE', topic: string) => void;
  onBackToScenarios: () => void;
  onSaveFlashcard: (card: Omit<StoredFlashcard, 'id' | 'created_at' | 'next_review_at' | 'repetitions'>) => void;
  soundEnabled: boolean;
  lang: Language;
  theme?: 'light' | 'dark';
}

export const PartnerReflexSession: React.FC<PartnerReflexSessionProps> = ({
  scenario,
  onConcludeSession,
  onBackToScenarios,
  onSaveFlashcard,
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
  const [timeLimit, setTimeLimit] = useState<number>(20);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timerActive, setTimerActive] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [savedFixes, setSavedFixes] = useState<Record<string, boolean>>({});

  const timerStartRef = useRef<number>(Date.now());
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
      id: 'partner-0',
      sender: 'ai',
      text: scenario.partner_scenario.opening_line,
      timestamp: Date.now(),
    };
    setMessages([openingMsg]);

    if (soundEnabled) {
      speakText(scenario.partner_scenario.opening_line);
    }

    timerStartRef.current = Date.now();
    setTimeLeft(timeLimit);
    setTimerActive(true);

    return () => {
      stopSpeaking();
    };
  }, [scenario]);

  // Reflex Timer countdown
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0 && !isLoading) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (soundEnabled) soundEffects.playTick(180, 0.2);
            return 0;
          }
          if (prev <= 4 && soundEnabled) {
            soundEffects.playTick(300 + (5 - prev) * 50, 0.05);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isLoading, soundEnabled]);

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
        // Error is set in onError callback
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (isRecording && recorderRef.current) {
      await recorderRef.current.stop();
    }

    const elapsedSeconds = ((Date.now() - timerStartRef.current) / 1000);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      responseTimeSeconds: parseFloat(elapsedSeconds.toFixed(1)),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setTimerActive(false);

    if (elapsedSeconds <= timeLimit) {
      setCurrentStreak((prev) => prev + 1);
      if (soundEnabled) soundEffects.playSuccess();
    } else {
      setCurrentStreak(0);
    }

    try {
      const historyToSend = [...messages, userMsg].map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch('/api/reflex-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: scenario.topic,
          history: historyToSend,
          userMessage: text,
          context: scenario.partner_scenario.context,
          aiRole: scenario.partner_scenario.ai_role,
          userRole: scenario.partner_scenario.user_role,
        }),
      });

      if (!response.ok) {
        throw new Error('Reflex chat error');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.cleanReply,
        microCorrection: data.microCorrection || undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (soundEnabled) {
        speakText(data.cleanReply);
      }

      // Reset reflex countdown for the next round
      timerStartRef.current = Date.now();
      setTimeLeft(timeLimit);
      setTimerActive(true);
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I hear you! Let's keep moving. What's your immediate next step?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
      timerStartRef.current = Date.now();
      setTimeLeft(timeLimit);
      setTimerActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFixAsCard = (messageId: string, userText: string, correction: string) => {
    onSaveFlashcard({
      front: `Fix this reflex phrasing: "${userText}"`,
      back: correction,
      interval_days: 1,
      sourceTopic: scenario.topic,
    });
    setSavedFixes((prev) => ({ ...prev, [messageId]: true }));
    if (soundEnabled) soundEffects.playSuccess();
  };

  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));

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
            <span>{t.reflexSession.switchScenario}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className={`flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded border ${
              isDark ? 'bg-amber-950/40 text-amber-300 border-amber-900/60' : 'bg-amber-100 text-amber-950 border-amber-300'
            }`}>
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{currentStreak} {t.reflexSession.turnsBlitz}</span>
            </div>

            {/* Time Blitz limit selector */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${
              isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-slate-100 border-slate-300 text-slate-900 font-medium'
            }`}>
              <span className="text-slate-700 dark:text-slate-400 font-bold">{t.reflexSession.timerLabel}</span>
              {[15, 20, 30].map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => {
                    setTimeLimit(tVal);
                    setTimeLeft(tVal);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    timeLimit === tVal 
                      ? 'bg-amber-600 text-white font-bold' 
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950 font-bold'
                  }`}
                >
                  {tVal}s
                </button>
              ))}
            </div>

            {/* Conclude Session Button */}
            <button
              onClick={() => onConcludeSession(messages, 'PARTNER_MODE', scenario.topic)}
              disabled={messages.filter((m) => m.sender === 'user').length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{t.reflexSession.diagnoseBtn}</span>
            </button>
          </div>
        </div>

        {/* Roles details */}
        <div className={`mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs ${
          isDark ? 'border-[#27272a]' : 'border-slate-200'
        }`}>
          <div>
            <span className="text-slate-700 dark:text-slate-400 block font-bold">{t.reflexSession.scenarioLabel}</span>
            <span className="font-extrabold text-slate-950 dark:text-slate-100">{scenario.partner_scenario.context}</span>
          </div>
          <div>
            <span className="text-slate-700 dark:text-slate-400 block font-bold">{t.reflexSession.aiPartner}</span>
            <span className="text-amber-900 dark:text-amber-400 font-extrabold">{scenario.partner_scenario.ai_role}</span>
          </div>
          <div>
            <span className="text-slate-700 dark:text-slate-400 block font-bold">{t.reflexSession.yourRole}</span>
            <span className="text-indigo-900 dark:text-indigo-400 font-extrabold">{scenario.partner_scenario.user_role}</span>
          </div>
        </div>
      </div>

      {/* Strict Spoken Reflex Timer Bar - Flat UI */}
      <div className={`border rounded-lg p-3 ${
        isDark ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-slate-300 shadow-xs'
      }`}>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-500' : 'text-amber-500'}`} />
            <span className={`font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
              {t.reflexSession.pressureTimer} <span className={`font-mono font-extrabold ${timeLeft <= 5 ? 'text-red-600' : 'text-amber-600'}`}>{timeLeft}s</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-700 dark:text-slate-400 font-semibold">
            {timeLeft === 0 ? t.reflexSession.timeUpMsg : t.reflexSession.pressureSub}
          </span>
        </div>
        <div className={`w-full rounded h-2 overflow-hidden border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
        }`}>
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      </div>

      {/* Chat Dialogue Arena - Flat UI */}
      <div className={`border rounded-xl p-4 sm:p-5 min-h-[380px] max-h-[500px] overflow-y-auto space-y-3.5 ${
        isDark ? 'bg-[#0d1117] border-slate-800' : 'bg-slate-100/90 border-slate-300'
      }`}>
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const prevUserMsg = !isUser && index > 0 ? messages[index - 1] : null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-400 px-1 font-bold">
                <span>{isUser ? scenario.partner_scenario.user_role : scenario.partner_scenario.ai_role}</span>
                {msg.responseTimeSeconds && (
                  <span className="text-amber-900 dark:text-amber-400 font-mono font-extrabold">
                    · {t.reflexSession.reflexSpeed} {msg.responseTimeSeconds}s
                  </span>
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none font-medium shadow-xs'
                    : isDark 
                      ? 'bg-[#161b22] border border-slate-800 text-slate-100 rounded-bl-none font-medium'
                      : 'bg-white border border-slate-300 text-slate-950 rounded-bl-none shadow-sm font-semibold'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p>{msg.text}</p>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text)}
                      title={t.scenarioGen.listen}
                      className="text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 shrink-0 mt-0.5 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Real-time Micro-Correction */}
                {msg.microCorrection && (
                  <div className={`mt-2.5 pt-2 border-t text-xs -mx-2 -mb-1 px-3 py-2 rounded-lg border ${
                    isDark 
                      ? 'bg-amber-950/70 border-amber-900 text-amber-200' 
                      : 'bg-amber-100 border-amber-300 text-amber-950'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-amber-950 dark:text-amber-400">
                        {t.reflexSession.microFix} {msg.microCorrection}
                      </span>

                      {prevUserMsg && (
                        <button
                          onClick={() => handleSaveFixAsCard(msg.id, prevUserMsg.text, msg.microCorrection!)}
                          disabled={savedFixes[msg.id]}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-300 shrink-0 cursor-pointer transition-colors"
                        >
                          {savedFixes[msg.id] ? t.reflexSession.saved : t.reflexSession.saveToDeck}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg w-fit border ${
            isDark ? 'text-slate-400 bg-slate-900 border-slate-800' : 'text-slate-900 bg-white border-slate-300 shadow-sm font-bold'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{t.reflexSession.responding}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Spoken Reflex Input Controller - Flat UI */}
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
                  ? 'bg-amber-600 text-white'
                  : isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
            }`}
            title={
              isRecording
                ? t.reflexSession.stopMic
                : isTranscribing
                  ? (lang === 'vi' ? 'Đang nhận diện giọng nói...' : 'Transcribing...')
                  : t.reflexSession.listenMic
            }
          >
            {isRecording ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : isTranscribing ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Mic className="w-5 h-5 text-amber-800 dark:text-amber-400" />
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
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecording 
                  ? (lang === 'vi' ? '🎙️ Đang nghe giọng nói... Bấm mic để hoàn tất' : '🎙️ Listening... Click mic to finish') 
                  : isTranscribing
                    ? (lang === 'vi' ? '⏳ Đang chuyển giọng nói thành chữ...' : '⏳ Transcribing speech...')
                    : t.reflexSession.inputPlaceholder
              }
              className={`w-full border rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none font-medium ${
                isDark 
                  ? 'bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500' 
                  : 'bg-white border-slate-300 text-slate-950 placeholder:text-slate-500 focus:border-amber-600 font-semibold'
              }`}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 px-1 font-semibold">
          <span>{t.reflexSession.rulesFooter}</span>
          <span className="font-mono">{t.reflexSession.pressEnter}</span>
        </div>
      </div>
    </div>
  );
};
