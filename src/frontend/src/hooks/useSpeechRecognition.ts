import { useCallback, useEffect, useRef, useState } from 'react';

// Web Speech API 类型扩展（轻量，无需 @types 包）
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event & { error: string }) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface UseSpeechRecognitionOptions {
  language: 'zh' | 'en';
  onResult: (text: string) => void;
  onEnd: () => void;
  onError?: (message: string) => void;
}

export function useSpeechRecognition({
  language,
  onResult,
  onEnd,
  onError
}: UseSpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const callbacksRef = useRef({ onResult, onEnd, onError });
  callbacksRef.current = { onResult, onEnd, onError };

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionClass);

    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass() as SpeechRecognitionInstance;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const { results } = e;
      let transcript = '';
      for (let i = e.resultIndex; i < results.length; i++) {
        const result = results[i];
        if (result.isFinal) {
          transcript += result[0].transcript;
        }
      }
      if (transcript) {
        callbacksRef.current.onResult(transcript);
      }
    };

    recognition.onend = () => {
      callbacksRef.current.onEnd();
    };

    recognition.onerror = (e: Event & { error: string }) => {
      if (e.error === 'not-allowed') {
        callbacksRef.current.onError?.('not-allowed');
      } else if (e.error === 'network') {
        callbacksRef.current.onError?.('network');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [language]);

  const start = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      callbacksRef.current.onError?.('start');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
  }, []);

  return { start, stop, isSupported };
}
