import { useRef, useEffect, useCallback } from 'react';
import { fadeInAudio, fadeOutAudio, setAudioVolume } from './fadeAudio';

interface UseSoundUnlockOptions {
  targetVolume?: number;
  fadeDuration?: number;
}

export function useSoundUnlock(options: UseSoundUnlockOptions = {}) {
  const { targetVolume = 0.4, fadeDuration = 2000 } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlocked = useRef(false);
  const currentVolume = useRef(targetVolume);

  useEffect(() => {
    currentVolume.current = targetVolume;
    if (audioRef.current && unlocked.current && !audioRef.current.paused) {
      setAudioVolume(audioRef.current, targetVolume);
    }
  }, [targetVolume]);

  const unlockSound = useCallback(async () => {
    if (!audioRef.current || unlocked.current) return;

    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      await fadeInAudio(audioRef.current, currentVolume.current, fadeDuration);
      unlocked.current = true;
    } catch (err) {
      console.warn('Sound unlock failed:', err);
    }
  }, [fadeDuration]);

  const stopSound = useCallback(async () => {
    if (audioRef.current && unlocked.current) {
      await fadeOutAudio(audioRef.current, 1000);
      unlocked.current = false;
    }
  }, []);

  const toggleSound = useCallback(async () => {
    if (!audioRef.current) return;

    if (unlocked.current && !audioRef.current.paused) {
      await fadeOutAudio(audioRef.current, 500);
    } else {
      await fadeInAudio(audioRef.current, currentVolume.current, 500);
      unlocked.current = true;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    currentVolume.current = volume;
    if (audioRef.current && !audioRef.current.paused) {
      setAudioVolume(audioRef.current, volume);
    }
  }, []);

  const isPlaying = useCallback(() => {
    return audioRef.current ? !audioRef.current.paused : false;
  }, []);

  return {
    audioRef,
    unlockSound,
    stopSound,
    toggleSound,
    setVolume,
    isPlaying,
    isUnlocked: () => unlocked.current,
  };
}
