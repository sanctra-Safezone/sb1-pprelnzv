import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { C } from '../../lib/constants';

const AMBIENT_URL = '/audio/hidden-garden.mp3';
const STORAGE_KEY = 'sanctra_ambient_enabled';
const FADE_DURATION = 2000;
const TARGET_VOLUME = 0.15;

export const AmbientAudio = () => {
  const audioRef = useRef(null);
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? false : stored === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const fadeIntervalRef = useRef(null);
  const userInteractedRef = useRef(false);
  const wasPlayingBeforeHidden = useRef(false);

  const fadeIn = useCallback(async () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    audio.volume = 0;
    audio.muted = false;

    try {
      await audio.play();
      setIsPlaying(true);
      const startTime = Date.now();

      fadeIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        audio.volume = eased * TARGET_VOLUME;

        if (progress >= 1) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      }, 50);
    } catch (err) {
      setIsPlaying(false);
    }
  }, []);

  const fadeOut = useCallback((fast = false) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const startVolume = audio.volume;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const duration = fast ? 300 : FADE_DURATION / 2;
    const startTime = Date.now();

    fadeIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress >= 1) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        audio.pause();
        setIsPlaying(false);
      }
    }, 50);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setAudioLoaded(true);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          wasPlayingBeforeHidden.current = true;
          fadeOut(true);
        }
      } else {
        if (wasPlayingBeforeHidden.current && enabled && userInteractedRef.current) {
          wasPlayingBeforeHidden.current = false;
          fadeIn();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, enabled, fadeIn, fadeOut]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggleAudio = async (e) => {
    e.stopPropagation();
    userInteractedRef.current = true;

    if (isPlaying) {
      fadeOut();
      setEnabled(false);
    } else {
      setEnabled(true);
      await fadeIn();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={AMBIENT_URL}
        loop
        preload="auto"
      />
      <button
        onClick={toggleAudio}
        aria-label={isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
        style={{
          position: 'fixed',
          bottom: 'calc(100px + env(safe-area-inset-bottom))',
          right: 16,
          width: 44,
          height: 44,
          minWidth: 44,
          minHeight: 44,
          borderRadius: 12,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${C.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPlaying ? C.emeraldLight : C.muted,
          zIndex: 50,
          transition: 'all 0.3s ease',
          opacity: 0.8,
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
      >
        {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </>
  );
};
