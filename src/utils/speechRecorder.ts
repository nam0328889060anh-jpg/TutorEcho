// Robust Dual-Engine Speech Recorder for TutorEcho
// Combines Web Speech API (real-time stream) with MediaRecorder + Gemini Flash transcription fallback

export interface SpeechRecorderOptions {
  lang?: 'vi' | 'en';
  onInterimText?: (text: string) => void;
  onFinalText?: (text: string) => void;
  onError?: (errorMessage: string) => void;
  onStateChange?: (isRecording: boolean) => void;
  onTranscribingChange?: (isTranscribing: boolean) => void;
}

export class SpeechRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;
  private recognition: any = null;
  private isRecording: boolean = false;
  private isTranscribing: boolean = false;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private options: SpeechRecorderOptions = {};
  private recognitionStarted: boolean = false;

  constructor(options: SpeechRecorderOptions = {}) {
    this.options = options;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getIsTranscribing(): boolean {
    return this.isTranscribing;
  }

  public async start(): Promise<boolean> {
    if (this.isRecording) {
      await this.stop();
      return false;
    }

    this.interimTranscript = '';
    this.finalTranscript = '';
    this.audioChunks = [];
    let streamAcquired = false;
    let webSpeechAcquired = false;

    // 1. Try to acquire MediaStream for MediaRecorder
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamAcquired = true;
        } catch (streamErr: any) {
          console.warn('[SpeechRecorder] getUserMedia({ audio: true }) failed:', streamErr);
          // If permission denied, keep note
          if (streamErr.name === 'NotAllowedError' || streamErr.name === 'PermissionDeniedError') {
            // We will still check if Web Speech can run
          }
        }
      }
    } catch (e) {
      console.warn('[SpeechRecorder] mediaDevices check error:', e);
    }

    // 2. Set up MediaRecorder if stream was acquired
    if (streamAcquired && this.mediaStream) {
      try {
        const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', ''];
        const supportedType = mimeTypes.find(t => t === '' || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t))) || '';

        this.mediaRecorder = supportedType
          ? new MediaRecorder(this.mediaStream, { mimeType: supportedType })
          : new MediaRecorder(this.mediaStream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(250); // Collect data chunks every 250ms
      } catch (recErr) {
        console.warn('[SpeechRecorder] MediaRecorder init failed:', recErr);
      }
    }

    // 3. Set up Web Speech API for real-time live preview
    const SpeechRecognition = typeof window !== 'undefined'
      ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = this.options.lang === 'vi' ? 'vi-VN' : 'en-US';

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              currentFinal += res[0].transcript + ' ';
            } else {
              currentInterim += res[0].transcript;
            }
          }

          const combined = (currentFinal + currentInterim).trim();
          if (combined) {
            this.finalTranscript = combined;
            this.options.onInterimText?.(combined);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[SpeechRecorder] WebSpeech error:', event?.error);
          if (event?.error === 'not-allowed') {
            if (!streamAcquired) {
              const msg = this.options.lang === 'vi'
                ? 'Trình duyệt chưa cấp quyền Micro. Vui lòng bấm vào biểu tượng ổ khóa/micro trên thanh địa chỉ để Cho phép (Allow).'
                : 'Microphone permission denied. Please click the lock/mic icon in your address bar to Allow.';
              this.options.onError?.(msg);
            }
          }
        };

        recognition.onend = () => {
          this.recognitionStarted = false;
        };

        recognition.start();
        this.recognition = recognition;
        this.recognitionStarted = true;
        webSpeechAcquired = true;
      } catch (speechErr) {
        console.warn('[SpeechRecorder] WebSpeech start error:', speechErr);
      }
    }

    // Check if at least one audio engine succeeded
    if (!streamAcquired && !webSpeechAcquired) {
      const msg = this.options.lang === 'vi'
        ? 'Không thể mở Micro. Vui lòng kiểm tra và cho phép quyền truy cập Micro trên trình duyệt của bạn.'
        : 'Cannot access Microphone. Please check browser permissions and allow microphone access.';
      this.options.onError?.(msg);
      this.options.onStateChange?.(false);
      return false;
    }

    this.isRecording = true;
    this.options.onStateChange?.(true);
    return true;
  }

  public async stop(): Promise<string> {
    if (!this.isRecording) return '';

    this.isRecording = false;
    this.options.onStateChange?.(false);

    // Stop speech recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
      this.recognitionStarted = false;
    }

    // Stop MediaRecorder and collect full Blob
    let audioBlob: Blob | null = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      audioBlob = await new Promise<Blob>((resolve) => {
        if (!this.mediaRecorder) return resolve(new Blob());
        this.mediaRecorder.onstop = () => {
          const mime = this.mediaRecorder?.mimeType || 'audio/webm';
          resolve(new Blob(this.audioChunks, { type: mime }));
        };
        try {
          this.mediaRecorder.stop();
        } catch {
          resolve(new Blob(this.audioChunks));
        }
      });
    }

    // Stop all media tracks to release the microphone hardware immediately
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }

    // 1. If Web Speech already produced a solid transcript, return it directly!
    const liveText = this.finalTranscript.trim();
    if (liveText.length > 0) {
      this.options.onFinalText?.(liveText);
      return liveText;
    }

    // 2. Otherwise, if we have recorded audio chunks, transcribe via Gemini Flash server-side!
    if (audioBlob && audioBlob.size > 800) {
      this.isTranscribing = true;
      this.options.onTranscribingChange?.(true);

      try {
        const base64Audio = await this.blobToBase64(audioBlob);
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
            lang: this.options.lang || 'en',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const transcript = (data.transcript || '').trim();
          if (transcript) {
            this.options.onFinalText?.(transcript);
            return transcript;
          }
        }
      } catch (err: any) {
        console.warn('[SpeechRecorder] Gemini transcribe error:', err);
      } finally {
        this.isTranscribing = false;
        this.options.onTranscribingChange?.(false);
      }
    }

    // 3. If no speech was detected
    this.options.onError?.(
      this.options.lang === 'vi'
        ? 'Không nhận diện được giọng nói. Hãy nói to, rõ ràng và gần mic hơn nhé.'
        : 'No speech recognized. Please speak clearly into the microphone.'
    );

    return '';
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
