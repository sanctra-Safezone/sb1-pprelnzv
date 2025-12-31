import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Lock, Maximize2 } from 'lucide-react';
import { C } from '../../lib/constants';

const PREVIEW_AUDIO_DURATION = 25;
const PREVIEW_VIDEO_DURATION = 8;
const DEFAULT_VOLUME = 0.3;

const PREVIEW_AUDIO_URLS = {
  'Gentle Wind': 'https://cdn.pixabay.com/audio/2022/03/15/audio_942e51f7a2.mp3',
  'Forest Calm': 'https://cdn.pixabay.com/audio/2021/08/09/audio_dc39bde808.mp3',
  'Ocean Waves': 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'
};

export const AudioPreview = ({ title, isLocked, onPlayStateChange }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playing) {
        stopAudio();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopAudio();
    };
  }, [playing]);

  const stopAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
    setProgress(0);
    onPlayStateChange?.(false);
  };

  const startAudio = async () => {
    try {
      if (!audioRef.current) return;

      audioRef.current.volume = muted ? 0 : DEFAULT_VOLUME;
      audioRef.current.currentTime = 0;

      await audioRef.current.play();
      startTimeRef.current = Date.now();
      setPlaying(true);
      onPlayStateChange?.(true);

      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const prog = Math.min((elapsed / PREVIEW_AUDIO_DURATION) * 100, 100);
        setProgress(prog);
        if (elapsed >= PREVIEW_AUDIO_DURATION) {
          stopAudio();
        }
      }, 100);
    } catch (e) {
      setPlaying(false);
    }
  };

  const audioUrl = PREVIEW_AUDIO_URLS[title] || PREVIEW_AUDIO_URLS['Gentle Wind'];

  const togglePlay = () => {
    if (isLocked) return;
    if (playing) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.volume = muted ? DEFAULT_VOLUME : 0;
    }
    setMuted(!muted);
  };

  return (
    <div style={{
      padding: 16,
      background: playing ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)',
      border: `1px solid ${playing ? 'rgba(16,185,129,0.2)' : C.border}`,
      borderRadius: 16,
      transition: 'all 0.3s'
    }}>
      <audio ref={audioRef} src={audioUrl} preload="auto" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={togglePlay}
          disabled={isLocked}
          style={{
            width: 52,
            height: 52,
            minWidth: 52,
            minHeight: 52,
            borderRadius: 14,
            background: isLocked ? C.glassDark : playing ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : C.gradient,
            border: `1px solid ${playing ? 'transparent' : C.borderLight}`,
            cursor: isLocked ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: playing ? '#fff' : C.emeraldLight,
            opacity: isLocked ? 0.5 : 1,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {isLocked ? <Lock size={20} /> : playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
            {isLocked ? 'Upgrade to listen' : playing ? `${Math.ceil(PREVIEW_AUDIO_DURATION - (progress / 100 * PREVIEW_AUDIO_DURATION))}s remaining` : `${PREVIEW_AUDIO_DURATION}s preview`}
          </p>
        </div>
        {playing && (
          <button
            onClick={toggleMute}
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}
      </div>
      {playing && (
        <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
            transition: 'width 0.1s linear'
          }} />
        </div>
      )}
    </div>
  );
};

export const VideoPreview = ({ src, thumbnail, title, isLocked, onExpand }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && playing) {
        stopVideo();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [playing]);

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setProgress(0);
  };

  const startVideo = () => {
    if (!videoRef.current || isLocked) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setPlaying(true);

    timerRef.current = setInterval(() => {
      if (videoRef.current) {
        const elapsed = videoRef.current.currentTime;
        setProgress((elapsed / PREVIEW_VIDEO_DURATION) * 100);
        if (elapsed >= PREVIEW_VIDEO_DURATION) {
          stopVideo();
        }
      }
    }, 100);
  };

  const togglePlay = () => {
    if (isLocked) return;
    if (playing) {
      stopVideo();
    } else {
      startVideo();
    }
  };

  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${C.border}`,
      position: 'relative',
      background: '#000'
    }}>
      {src && !isLocked ? (
        <video
          ref={videoRef}
          src={src}
          poster={thumbnail}
          muted
          loop
          playsInline
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <img
          src={thumbnail}
          alt={title || 'Video preview'}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', filter: isLocked ? 'blur(4px)' : 'none' }}
        />
      )}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 12,
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        backdropFilter: 'blur(8px)'
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>Preview</span>
      </div>
      {!playing && (
        <div
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLocked ? 'not-allowed' : 'pointer'
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isLocked ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isLocked ? <Lock size={28} color="#fff" /> : <Play size={28} color="#fff" />}
          </div>
        </div>
      )}
      {playing && (
        <>
          <button
            onClick={stopVideo}
            style={{
              position: 'absolute',
              top: 12,
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
            <Pause size={18} />
          </button>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'rgba(255,255,255,0.2)'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              transition: 'width 0.1s linear'
            }} />
          </div>
        </>
      )}
      <div style={{
        position: 'absolute',
        bottom: playing ? 8 : 0,
        left: 0,
        right: 0,
        padding: playing ? '0 12px' : '12px 16px',
        background: playing ? 'transparent' : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
      }}>
        {!playing && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{title || 'Video'}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{PREVIEW_VIDEO_DURATION}s preview</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ImagePreview = ({ src, title, isLocked, onExpand }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => !isLocked && setModalOpen(true)}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
          position: 'relative',
          cursor: isLocked ? 'not-allowed' : 'pointer'
        }}
      >
        <img
          src={src}
          alt={title || 'Image preview'}
          style={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
            display: 'block',
            filter: isLocked ? 'blur(8px) brightness(0.7)' : 'none'
          }}
        />
        {isLocked && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={24} color="#fff" />
            </div>
          </div>
        )}
        {!isLocked && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Maximize2 size={16} color="#fff" />
          </div>
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{title || 'Image'}</span>
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <button
            onClick={() => setModalOpen(false)}
            style={{
              position: 'absolute',
              top: 'calc(20px + env(safe-area-inset-top))',
              right: 20,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
          >
            <X size={24} />
          </button>
          <img
            src={src}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 8
            }}
          />
        </div>
      )}
    </>
  );
};
