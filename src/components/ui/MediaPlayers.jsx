import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { C } from '../../lib/constants';

export const VideoPlayer = ({ src, autoPlay = true, muted = true, loop = false, inFeed = true }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#000',
        cursor: 'pointer'
      }}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        style={{ width: '100%', display: 'block', maxHeight: inFeed ? 400 : 'none' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => !loop && setIsPlaying(false)}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: 'rgba(255,255,255,0.2)'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: C.emeraldLight,
          transition: 'width 0.1s linear'
        }} />
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.4)',
        transition: 'background 0.2s'
      }}>
        {!isPlaying && (
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={28} color="#fff" fill="#fff" />
          </div>
        )}
      </div>
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};

const AUDIO_ENABLED_KEY = 'sanctra_audio_enabled';

const getAudioEnabled = () => {
  try {
    return localStorage.getItem(AUDIO_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
};

const setAudioEnabled = () => {
  try {
    localStorage.setItem(AUDIO_ENABLED_KEY, 'true');
  } catch {}
};

export const AudioPlayer = ({ src, title, isOwnAudio = false }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [needsUnlock, setNeedsUnlock] = useState(!getAudioEnabled());
  const [showUnlockOverlay, setShowUnlockOverlay] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const setAudioDuration = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const bars = 40;
    const barWidth = width / bars - 2;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < bars; i++) {
      const barHeight = Math.random() * (height * 0.8) + height * 0.1;
      const x = i * (barWidth + 2);
      const isFilled = (i / bars) * 100 <= progress;

      ctx.fillStyle = isFilled ? C.emeraldLight : 'rgba(255,255,255,0.2)';
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
    }
  }, [progress]);

  const handleUnlock = async () => {
    setAudioEnabled();
    setNeedsUnlock(false);
    setShowUnlockOverlay(false);

    const audio = audioRef.current;
    if (audio) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio play failed:', err);
      }
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (needsUnlock) {
        setShowUnlockOverlay(true);
        return;
      }
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        setShowUnlockOverlay(true);
        console.warn('Audio play failed:', err);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    if (needsUnlock) {
      setShowUnlockOverlay(true);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = percent * audio.duration;
  };

  const handleDownload = async () => {
    if (!src || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title ? `${title}.mp3` : 'audio.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div style={{
      padding: 20,
      background: C.glassDark,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      position: 'relative'
    }}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {showUnlockOverlay && (
        <div
          onClick={handleUnlock}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <Volume2 size={28} color={C.emeraldLight} />
          <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>Tap to enable sound</span>
          <span style={{ fontSize: 11, color: C.muted }}>Required for audio playback</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={togglePlay}
          style={{
            width: 48,
            height: 48,
            minWidth: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(6,95,70,0.6) 100%)',
            border: '1px solid rgba(16,185,129,0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#fff" />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <p style={{ margin: '0 0 8px', fontSize: 13, color: C.text, fontWeight: 500 }}>{title}</p>
          )}
          <canvas
            ref={canvasRef}
            width={200}
            height={32}
            onClick={handleSeek}
            style={{ width: '100%', height: 32, cursor: 'pointer', display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{formatTime(audioRef.current?.currentTime)}</span>
            <span style={{ fontSize: 11, color: C.muted }}>{formatTime(duration)}</span>
          </div>
        </div>
        {isOwnAudio && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download your audio"
            style={{
              width: 40,
              height: 40,
              minWidth: 40,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              cursor: downloading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              flexShrink: 0,
              opacity: downloading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Download size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export const ProfileSoundPlayer = ({ src, onStop }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsUnlock, setNeedsUnlock] = useState(!getAudioEnabled());

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      onStop?.();
    };
  }, [onStop]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (needsUnlock) {
        setAudioEnabled();
        setNeedsUnlock(false);
      }
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio play failed:', err);
      }
    }
  };

  if (!src) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 14px',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      border: `1px solid ${C.border}`
    }}>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        style={{
          width: 32,
          height: 32,
          minWidth: 32,
          borderRadius: '50%',
          background: isPlaying ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)',
          border: `1px solid ${isPlaying ? 'rgba(16,185,129,0.4)' : C.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isPlaying ? C.emeraldLight : C.muted
        }}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
      </button>
      <span style={{ fontSize: 12, color: C.muted }}>
        {isPlaying ? 'Playing' : (needsUnlock ? 'Tap to play' : 'Ambient')}
      </span>
    </div>
  );
};
