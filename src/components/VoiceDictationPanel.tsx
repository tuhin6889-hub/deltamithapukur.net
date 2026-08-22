import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Languages, 
  Volume2, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Radio, 
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

// SpeechRecognition type definitions for cross-browser safety
interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
  resultIndex: number;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface VoiceDictationPanelProps {
  onTranscriptChange: (transcript: string, isFinal: boolean, targetField: 'description' | 'title' | 'both') => void;
  onApplyPreset?: (text: string) => void;
  appLang: 'bn' | 'en';
  currentTitle: string;
  currentDescription: string;
}

export const VoiceDictationPanel: React.FC<VoiceDictationPanelProps> = ({
  onTranscriptChange,
  onApplyPreset,
  appLang,
  currentTitle,
  currentDescription,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [targetField, setTargetField] = useState<'description' | 'title' | 'both'>('description');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(12).fill(15));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = 
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Timer for active recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Setup Audio Waveform Analyser
  const startAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample 12 frequency bands
        const sampledLevels = [];
        const step = Math.floor(bufferLength / 12);
        for (let i = 0; i < 12; i++) {
          const val = dataArray[i * step] || 0;
          // Scale from 0-255 to 15-95%
          sampledLevels.push(Math.max(15, Math.min(95, Math.round((val / 255) * 100))));
        }
        setAudioLevel(sampledLevels);
        animFrameRef.current = requestAnimationFrame(updateWave);
      };

      updateWave();
    } catch (err) {
      console.warn('Audio analyser error (speech recognition can still function):', err);
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(new Array(12).fill(15));
  };

  const startRecording = () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setInterimText('');

    const SpeechRecognitionClass = 
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        appLang === 'bn' 
          ? 'আপনার ব্রাউজারটি সরাসরি ভয়েস রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে গুগল ক্রোম বা এজ ব্রাউজার ব্যবহার করুন।' 
          : 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Android Chrome.'
      );
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsRecording(true);
        startAudioAnalyser();
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let accumulatedFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptChunk = result[0].transcript;
          if (result.isFinal) {
            accumulatedFinal += transcriptChunk + ' ';
          } else {
            currentInterim += transcriptChunk;
          }
        }

        const trimmedFinal = accumulatedFinal.trim();
        setLiveTranscript(trimmedFinal);
        setInterimText(currentInterim);

        const activeCombined = (trimmedFinal + (currentInterim ? ' ' + currentInterim : '')).trim();
        if (activeCombined) {
          onTranscriptChange(activeCombined, false, targetField);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage(
            appLang === 'bn'
              ? 'মাইক্রোফোন পারমিশন ব্লক করা আছে। ব্রাউজার সেটিংসে গিয়ে পারমিশন চালু করুন।'
              : 'Microphone permission was denied. Please allow microphone access in browser settings.'
          );
          stopRecording();
        } else if (event.error === 'no-speech') {
          // No speech detected, keep listening or report gently
        } else {
          setErrorMessage(`Notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // When speech recognition ends naturally or stops
        setIsRecording(false);
        stopAudioAnalyser();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage(
        appLang === 'bn' 
          ? 'ভয়েস রেকর্ডিং শুরু করা যায়নি। মাইক্রোফোন সংযোগ চেক করুন।' 
          : 'Unable to start speech recognition. Please check microphone settings.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    stopAudioAnalyser();

    // Finalize transcript
    const finalResult = (liveTranscript + (interimText ? ' ' + interimText : '')).trim();
    if (finalResult) {
      onTranscriptChange(finalResult, true, targetField);
    }
  };

  const handleClearTranscript = () => {
    setLiveTranscript('');
    setInterimText('');
  };

  // Quick preset Bengali / English technical complaints for mobile users
  const quickVoicePresets = [
    {
      labelBn: '🔴 লাল বাতি জ্বলছে (Red LOS)',
      labelEn: '🔴 Red LOS Light',
      textBn: 'রাউটারে এবং ONU-তে লাল এলওএস বাতি জ্বলছে, কোনো ইন্টারনেট সংযোগ পাচ্ছি না।',
      textEn: 'Red LOS light is blinking on the ONU and Internet is completely disconnected.',
      category: 'রেড এলওএস বাতি (Red LOS Light)',
    },
    {
      labelBn: '⚡ ফাইবার তার ক্ষতিগ্রস্ত',
      labelEn: '⚡ Fiber Wire Broken',
      textBn: 'বাইরে ঝড় ও গাছের ডাল পড়ে অপটিক্যাল ফাইবার তার ছিঁড়ে গেছে, দ্রুত মেরামত প্রয়োজন।',
      textEn: 'Optical fiber drop cable has been severed by falling tree branches. Urgent repair needed.',
      category: 'ফাইবার সংযোগ বিচ্ছিন্ন (Fiber Line Down)',
    },
    {
      labelBn: '🐢 অতি ধীরগতি ও হাই পিং',
      labelEn: '🐢 High Ping & Slow',
      textBn: 'ইন্টারনেট স্পিড মারাত্মক স্লো এবং ইউটিউব ও ব্রাউজিং লোড হচ্ছে না, পিং ১০০+ দেখাচ্ছে।',
      textEn: 'Internet speed is drastically slow with high ping latency over 100ms. YouTube buffering.',
      category: 'উচ্চ পিং ও স্লো স্পিড (High Ping / Slow Speed)',
    },
    {
      labelBn: '🔄 রাউটার কনফিগারেশন সমস্যা',
      labelEn: '🔄 Router Config Issue',
      textBn: 'রাউটার রিসেট হয়ে গেছে, পিপিওইর (PPPoE) ইউজারনেম ও পাসওয়ার্ড রি-কনফিগার করে দিন।',
      textEn: 'Router was accidentally reset. Please reconfigure PPPoE username and password.',
      category: 'রাউটার ও কনফিগারেশন (Router / Config)',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-3.5 sm:p-4 text-white border border-slate-800 shadow-lg space-y-3">
      
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl ${isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white">
                {appLang === 'bn' ? 'ভয়েস-টু-টেক্সট ডিকটেশন' : 'Voice-to-Text Dictation'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded border border-emerald-500/30">
                Mobile Mic
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {appLang === 'bn' ? 'কথা বলুন — সাথে সাথে স্বয়ংক্রিয় টাইপ হবে' : 'Speak to dictate issue directly'}
            </p>
          </div>
        </div>

        {/* Voice Language Selector & Target Field */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Bengali vs English Language Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setVoiceLang('bn-BD');
                if (isRecording) {
                  stopRecording();
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                voiceLang === 'bn-BD'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="বাংলা ভাষা নির্বাচন করুন"
            >
              বাংলা (BN)
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceLang('en-US');
                if (isRecording) {
                  stopRecording();
                }
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                voiceLang === 'en-US'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Select English Language"
            >
              English (EN)
            </button>
          </div>

          {/* Target field selector */}
          <select
            value={targetField}
            onChange={(e) => setTargetField(e.target.value as 'description' | 'title' | 'both')}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1 text-[11px] font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            title="Choose target field for dictation"
          >
            <option value="description">
              {appLang === 'bn' ? '📝 বর্ণনায় যুক্ত হবে' : '📝 To: Description'}
            </option>
            <option value="title">
              {appLang === 'bn' ? '📌 শিরোনামে যুক্ত হবে' : '📌 To: Title'}
            </option>
            <option value="both">
              {appLang === 'bn' ? '✨ উভয় ফিল্ডে পূরণ' : '✨ Fill Both (Smart)'}
            </option>
          </select>
        </div>
      </div>

      {/* Main Interactive Mic Button & Audio Waveform Banner */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Big Interactive Mic Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRecording ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-white" />
              <span>{appLang === 'bn' ? 'রেকর্ড শুরু করুন (Start)' : 'Start Voice Recording'}</span>
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold text-xs shadow-lg shadow-rose-950/50 border border-rose-400/40 transition-all animate-pulse cursor-pointer"
            >
              <MicOff className="w-4 h-4 text-white" />
              <span>
                {appLang === 'bn' ? `রেকর্ড বন্ধ করুন (${recordingSeconds}s)` : `Stop Recording (${recordingSeconds}s)`}
              </span>
            </motion.button>
          )}

          {/* Reset button if text exists */}
          {(liveTranscript || interimText) && !isRecording && (
            <button
              type="button"
              onClick={handleClearTranscript}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs transition-colors"
              title="Clear voice transcript"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Audio Waveform Visualizer & Status Indicator */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isRecording ? (
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1" />
              <span className="text-[11px] font-bold text-rose-400 font-mono">
                {appLang === 'bn' ? 'শুনছি...' : 'Listening...'}
              </span>

              {/* 12 Animated Dynamic Sound Wave Bars */}
              <div className="flex items-center gap-0.5 h-6 px-1">
                {audioLevel.map((lvl, idx) => (
                  <motion.span
                    key={idx}
                    animate={{ height: `${lvl}%` }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full min-h-[4px]"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-teal-400" />
              <span>{appLang === 'bn' ? 'মাইক্রোফোন প্রস্তুত (Ready)' : 'Mic Ready for speech'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript Preview Bubble when actively recording or transcribed */}
      <AnimatePresence>
        {(isRecording || liveTranscript || interimText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/90 border border-teal-500/30 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-teal-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-300" />
                  {appLang === 'bn' ? 'লাইভ ভয়েস ট্রান্সক্রিপশন:' : 'Live Voice Transcript:'}
                </span>
                <span className="text-slate-400">
                  {voiceLang === 'bn-BD' ? 'বাংলা (Bengali)' : 'English'}
                </span>
              </div>
              
              <p className="text-slate-200 font-sans leading-relaxed text-xs sm:text-[13px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="text-teal-200 font-medium">
                  {liveTranscript || (isRecording ? '...' : '')}
                </span>
                {interimText && (
                  <span className="text-amber-300 italic opacity-85 ml-1">
                    {interimText}
                  </span>
                )}
                {isRecording && !liveTranscript && !interimText && (
                  <span className="text-slate-400 italic">
                    {appLang === 'bn' ? 'কথা বলুন, আপনার কথা স্বয়ংক্রিয়ভাবে টেক্সটে রূপান্তর হচ্ছে...' : 'Speak now, converting speech to text in real-time...'}
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message if any */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 flex items-start gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Quick Mobile Voice / One-Click Issue Presets */}
      {onApplyPreset && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              {appLang === 'bn' ? 'মোবাইল কুইক ভয়েস প্রম্পট ও অভিযোগ টেমপ্লেট:' : 'Quick Mobile Technical Presets:'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickVoicePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const chosenText = appLang === 'bn' ? preset.textBn : preset.textEn;
                  onApplyPreset(chosenText);
                }}
                className="text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:border-teal-500/40 border border-slate-700/70 text-[11px] text-slate-300 transition-all flex items-start justify-between group active:scale-[0.98]"
              >
                <div>
                  <span className="font-bold text-teal-300 block">
                    {appLang === 'bn' ? preset.labelBn : preset.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {appLang === 'bn' ? preset.textBn : preset.textEn}
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                  + Add
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
