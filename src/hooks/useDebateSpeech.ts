import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseDebateSpeechReturn {
  isAvailable: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  activeMessageId: string | null;
  activeSpeakerName: string | null;
  rate: number;
  volume: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  errorMessage: string | null;
  play: (text: string, messageId: string, speakerName?: string, characterId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
  clearError: () => void;
}

export function useDebateSpeech(): UseDebateSpeechReturn {
  const isAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [activeSpeakerName, setActiveSpeakerName] = useState<string | null>(null);
  const [rate, setRateState] = useState(1.0);
  const [volume, setVolumeState] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available system voices
  useEffect(() => {
    if (!isAvailable) {
      setErrorMessage('Speech synthesis is not supported on this device/browser.');
      return;
    }

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available && available.length > 0) {
          setVoices(available);
        }
      } catch (err) {
        // ignore
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (isAvailable) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAvailable]);

  // Clean stop
  const stop = useCallback(() => {
    if (!isAvailable) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveMessageId(null);
    setActiveSpeakerName(null);
  }, [isAvailable]);

  // Pause
  const pause = useCallback(() => {
    if (!isAvailable || !isPlaying) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch (e) {
      setErrorMessage('Failed to pause audio playback.');
    }
  }, [isAvailable, isPlaying]);

  // Resume
  const resume = useCallback(() => {
    if (!isAvailable) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } catch (e) {
      setErrorMessage('Failed to resume audio playback.');
    }
  }, [isAvailable]);

  // Play audio for a specific character message
  const play = useCallback(
    (text: string, messageId: string, speakerName?: string, characterId?: string) => {
      if (!isAvailable) {
        setErrorMessage('Voice audio playback is not supported in this browser.');
        return;
      }

      if (!text || !text.trim()) {
        setErrorMessage('No speech text provided to read.');
        return;
      }

      setErrorMessage(null);

      // Stop any existing utterance first to prevent multiple overlapping voices
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }

      // If user clicked the same message that is paused, resume it
      if (activeMessageId === messageId && isPaused) {
        resume();
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Custom pitch and speech tempo by character archetype
        let characterPitch = 1.0;
        let characterRateMultiplier = 1.0;

        switch (characterId) {
          case 'strategist':
            characterPitch = 0.95;
            characterRateMultiplier = 0.96;
            break;
          case 'scientist':
            characterPitch = 1.05;
            characterRateMultiplier = 1.02;
            break;
          case 'skeptic':
            characterPitch = 0.88;
            characterRateMultiplier = 0.92;
            break;
          case 'futurist':
            characterPitch = 1.12;
            characterRateMultiplier = 1.06;
            break;
          case 'ethicist':
            characterPitch = 0.98;
            characterRateMultiplier = 0.93;
            break;
          case 'creative':
            characterPitch = 1.18;
            characterRateMultiplier = 1.05;
            break;
          default:
            characterPitch = 1.0;
        }

        utterance.pitch = characterPitch;
        utterance.rate = Math.min(2.0, Math.max(0.5, rate * characterRateMultiplier));
        utterance.volume = Math.min(1.0, Math.max(0.1, volume));

        // Assign voice
        if (selectedVoiceURI) {
          const matchedVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
          if (matchedVoice) utterance.voice = matchedVoice;
        } else if (voices.length > 0) {
          // Pick a natural English voice if available
          const preferred =
            voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) ||
            voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google')) ||
            voices.find((v) => v.lang.startsWith('en')) ||
            voices[0];
          if (preferred) utterance.voice = preferred;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
          setActiveMessageId(messageId);
          setActiveSpeakerName(speakerName || 'AI Opponent');
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setActiveMessageId(null);
          setActiveSpeakerName(null);
        };

        utterance.onerror = (evt) => {
          // If cancelled intentionally via .cancel(), do not treat as an error
          if (evt.error === 'canceled' || evt.error === 'interrupted') {
            setIsPlaying(false);
            setIsPaused(false);
            setActiveMessageId(null);
            return;
          }
          console.error('SpeechSynthesis error:', evt);
          setErrorMessage(`Audio playback error: ${evt.error || 'Playback failed'}`);
          setIsPlaying(false);
          setIsPaused(false);
          setActiveMessageId(null);
        };

        utterance.onpause = () => {
          setIsPaused(true);
        };

        utterance.onresume = () => {
          setIsPaused(false);
          setIsPlaying(true);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err: any) {
        console.error('Failed to initiate speech:', err);
        setErrorMessage(err.message || 'Could not start voice playback.');
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMessageId(null);
      }
    },
    [isAvailable, activeMessageId, isPaused, resume, rate, volume, selectedVoiceURI, voices]
  );

  const setRate = (newRate: number) => {
    setRateState(newRate);
  };

  const setVolume = (newVol: number) => {
    setVolumeState(newVol);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return {
    isAvailable,
    isPlaying,
    isPaused,
    activeMessageId,
    activeSpeakerName,
    rate,
    volume,
    voices,
    selectedVoiceURI,
    errorMessage,
    play,
    pause,
    resume,
    stop,
    setRate,
    setVolume,
    setSelectedVoiceURI,
    clearError,
  };
}
