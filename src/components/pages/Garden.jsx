import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Leaf, Volume2, VolumeX, Users, Music, X, Check, CloudRain, Trees, Waves, Sparkles, Wind, Upload } from 'lucide-react';
import { Glass, Btn } from '../ui/primitives';
import { C, GARDEN_MUSIC } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { AudioManager } from '../../lib/AudioManager';
import { useToast } from '../ui/Toast';
import { MusicUploader } from '../ui/MusicUploader';

const SOFT_ALIASES = [
  'wanderer', 'seeker', 'dreamer', 'listener', 'observer',
  'traveler', 'pilgrim', 'guardian', 'keeper', 'sage',
  'spirit', 'ember', 'whisper', 'shadow', 'moonlight',
  'starling', 'reed', 'willow', 'cedar', 'moss'
];

const COOLDOWN_SECONDS = 30;
const MAX_WHISPER_LENGTH = 100;
const MESSAGE_LIFETIME_MS = 90000;

const getRandomAlias = () => SOFT_ALIASES[Math.floor(Math.random() * SOFT_ALIASES.length)];

const ICON_MAP = {
  'cloud-rain': CloudRain,
  'trees': Trees,
  'waves': Waves,
  'sparkles': Sparkles,
  'wind': Wind,
  'music': Music
};

const FloatingWhisper = ({ whisper, onExpire }) => {
  const [opacity, setOpacity] = useState(0);
  const [yOffset, setYOffset] = useState(0);
  const startTimeRef = useRef(Date.now());
  const expiresAt = new Date(whisper.expires_at).getTime();
  const lifetime = expiresAt - startTimeRef.current;
  const horizontalPosition = useRef(15 + Math.random() * 70);

  useEffect(() => {
    requestAnimationFrame(() => setOpacity(1));

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / lifetime, 1);

      setYOffset(progress * 300);

      if (progress > 0.6) {
        setOpacity(1 - ((progress - 0.6) / 0.4));
      }

      if (progress >= 1) {
        onExpire(whisper.id);
        return;
      }

      requestAnimationFrame(animate);
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [lifetime, whisper.id, onExpire]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 180 + yOffset,
        left: `${horizontalPosition.current}%`,
        transform: 'translateX(-50%)',
        maxWidth: '70%',
        opacity,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
        zIndex: 10
      }}
    >
      <div style={{
        padding: '12px 18px',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(52,211,153,0.1)'
      }}>
        <p style={{
          margin: 0,
          fontSize: 14,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 1.5,
          fontWeight: 300,
          textAlign: 'center'
        }}>
          {whisper.content}
        </p>
        <p style={{
          margin: '6px 0 0',
          fontSize: 11,
          color: C.emeraldLight,
          fontStyle: 'italic',
          textAlign: 'center',
          opacity: 0.7
        }}>
          {whisper.alias}
        </p>
      </div>
    </div>
  );
};

const PresenceIndicator = ({ count }) => (
  <div style={{
    position: 'fixed',
    top: 'calc(80px + env(safe-area-inset-top))',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 20,
    border: '1px solid rgba(52,211,153,0.15)',
    zIndex: 100
  }}>
    <div style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: C.emeraldLight,
      boxShadow: `0 0 8px ${C.emeraldLight}`,
      animation: 'pulse 2s ease-in-out infinite'
    }} />
    <Users size={14} color={C.emeraldLight} />
    <span style={{ fontSize: 13, color: C.text, fontWeight: 400 }}>
      {count} {count === 1 ? 'soul' : 'souls'} present
    </span>
  </div>
);

const MusicSelector = ({ isOpen, onClose, currentTrack, onSelectTrack, soundEnabled, customTracks = [], onUploadClick }) => {
  if (!isOpen) return null;

  const allTracks = [...GARDEN_MUSIC, ...customTracks];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          maxHeight: '70vh',
          background: 'rgba(10,15,13,0.98)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid rgba(52,211,153,0.1)',
          borderBottom: 'none',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Music size={20} color={C.emeraldLight} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: C.text }}>
                Garden Sounds
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>
                {soundEnabled ? 'Choose a sound for your space' : 'Tap to enable sound'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 12, overflowY: 'auto', maxHeight: 'calc(70vh - 80px)' }}>
          <button
            onClick={() => {
              onClose();
              onUploadClick?.();
            }}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.08) 100%)',
              border: `1px solid ${C.emeraldLight}40`,
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 12,
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={22} color={C.emeraldLight} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 500,
                color: C.emeraldLight
              }}>
                Upload Custom Track
              </p>
              <p style={{
                margin: '4px 0 0',
                fontSize: 12,
                color: C.muted
              }}>
                One free upload available
              </p>
            </div>
          </button>

          {allTracks.map((track) => {
            const IconComponent = ICON_MAP[track.icon] || Music;
            const isActive = currentTrack?.id === track.id && soundEnabled;

            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'transparent'}`,
                  borderRadius: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 6,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(52,211,153,0.15) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <IconComponent
                    size={22}
                    color={isActive ? C.emeraldLight : C.muted}
                  />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 500,
                    color: isActive ? C.text : C.textSecondary
                  }}>
                    {track.label}
                  </p>
                  {isActive && (
                    <p style={{
                      margin: '4px 0 0',
                      fontSize: 12,
                      color: C.emeraldLight,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: C.emeraldLight,
                        animation: 'pulse 1.5s infinite'
                      }} />
                      Now playing
                    </p>
                  )}
                </div>
                {isActive && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: C.emerald,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={16} color="#fff" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{
          padding: '12px 16px calc(16px + env(safe-area-inset-bottom))',
          borderTop: `1px solid ${C.border}`,
          background: 'rgba(0,0,0,0.3)'
        }}>
          <p style={{
            margin: 0,
            fontSize: 11,
            color: C.muted,
            textAlign: 'center',
            opacity: 0.7
          }}>
            Royalty-free ambient sounds
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const SoundControls = ({ active, onToggle, volume, onVolumeChange, onMusicSelect, currentTrack }) => (
  <div style={{
    position: 'fixed',
    top: 'calc(80px + env(safe-area-inset-top))',
    right: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 100,
    marginBottom: 'env(safe-area-inset-bottom)'
  }}>
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={onMusicSelect}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${C.border}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.muted,
          transition: 'all 0.3s'
        }}
      >
        <Music size={18} />
      </button>
      <button
        onClick={onToggle}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: active ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.4)',
          border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : C.border}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: active ? C.emeraldLight : C.muted,
          transition: 'all 0.3s'
        }}
      >
        {active ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </div>
    {active && (
      <>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          style={{
            width: 80,
            height: 4,
            appearance: 'none',
            background: `linear-gradient(to right, ${C.emeraldLight} 0%, ${C.emeraldLight} ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
            borderRadius: 2,
            cursor: 'pointer',
            outline: 'none'
          }}
        />
        {currentTrack && (
          <div style={{
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 8,
            backdropFilter: 'blur(8px)'
          }}>
            <p style={{
              margin: 0,
              fontSize: 10,
              color: C.emeraldLight,
              whiteSpace: 'nowrap'
            }}>
              {currentTrack.label}
            </p>
          </div>
        )}
      </>
    )}
  </div>
);

const WhisperInput = ({ value, onChange, onSend, cooldown, maxLength, alias, disabled }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: '16px 16px calc(100px + env(safe-area-inset-bottom))',
      background: 'linear-gradient(to top, rgba(5,8,7,0.98) 0%, rgba(5,8,7,0.95) 70%, transparent 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 50
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 6px 6px 20px',
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${cooldown > 0 ? 'rgba(204,163,94,0.2)' : C.border}`,
          borderRadius: 28,
          transition: 'border-color 0.3s'
        }}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={cooldown > 0 ? `Breathe... ${cooldown}s` : 'Whisper something...'}
            disabled={cooldown > 0 || disabled}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: C.text,
              fontSize: 16,
              fontWeight: 300,
              outline: 'none',
              padding: '14px 0',
              opacity: cooldown > 0 ? 0.5 : 1,
              minHeight: 24
            }}
          />
          <button
            onClick={onSend}
            disabled={!value.trim() || cooldown > 0 || disabled}
            style={{
              padding: '14px 24px',
              minHeight: 48,
              background: value.trim() && cooldown === 0
                ? 'linear-gradient(135deg, rgba(16,185,129,0.8) 0%, rgba(6,95,70,0.9) 100%)'
                : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 24,
              color: value.trim() && cooldown === 0 ? '#fff' : C.muted,
              fontSize: 14,
              fontWeight: 600,
              cursor: value.trim() && cooldown === 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
              boxShadow: value.trim() && cooldown === 0 ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            Release
          </button>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 10,
          padding: '0 12px'
        }}>
          <span style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
            as {alias}
          </span>
          <span style={{ fontSize: 12, color: C.muted }}>
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
};

export const Garden = ({ user }) => {
  const toast = useToast();
  const [entered, setEntered] = useState(false);
  const [alias] = useState(() => getRandomAlias());
  const [whispers, setWhispers] = useState([]);
  const [input, setInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [presenceCount, setPresenceCount] = useState(1);
  const [soundActive, setSoundActive] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState(GARDEN_MUSIC[0]);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [customTracks, setCustomTracks] = useState([]);
  const [showMusicUploader, setShowMusicUploader] = useState(false);

  const channelRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const cooldownRef = useRef(null);

  const removeWhisper = useCallback((id) => {
    setWhispers(prev => prev.filter(w => w.id !== id));
  }, []);

  useEffect(() => {
    if (!entered) return;

    const fetchActive = async () => {
      const { data } = await supabase
        .from('garden_whispers')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });
      if (data) setWhispers(data);
    };

    fetchActive();

    channelRef.current = supabase
      .channel('garden_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'garden_whispers' },
        (payload) => {
          if (new Date(payload.new.expires_at) > new Date()) {
            setWhispers(prev => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    const oderId = user?.id || `anon-${Math.random().toString(36).slice(2)}`;
    presenceChannelRef.current = supabase
      .channel('garden_presence', {
        config: { presence: { key: oderId } }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current.presenceState();
        const count = Object.keys(state).length;
        setPresenceCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current.track({ alias, joined_at: Date.now() });
        }
      });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
    };
  }, [entered, user?.id, alias]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, [cooldown]);

  useEffect(() => {
    const unsubscribe = AudioManager.subscribe((state) => {
      setSoundActive(state.isPlaying);
      setVolume(state.volume);
      setAudioUnlocked(state.isUnlocked);
      if (state.currentTrackId) {
        const track = GARDEN_MUSIC.find(t => t.id === state.currentTrackId);
        if (track) setCurrentTrack(track);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const savedTrackId = localStorage.getItem('garden_selected_track');
    if (savedTrackId) {
      const track = GARDEN_MUSIC.find(t => t.id === savedTrackId);
      if (track) setCurrentTrack(track);
    }
  }, []);

  const playTrack = useCallback(async (track) => {
    const success = await AudioManager.play(track.file, track.id);

    if (success) {
      setCurrentTrack(track);
      localStorage.setItem('garden_selected_track', track.id);

      if (!hasShownToast) {
        toast.success('Sound enabled');
        setHasShownToast(true);
      }

      if (user?.id) {
        await supabase
          .from('user_profiles')
          .update({ profile_sound_url: track.id })
          .eq('id', user.id);
      }
    }
  }, [user, toast, hasShownToast]);

  const handleEnter = async () => {
    setEntered(true);
    await playTrack(currentTrack);
  };

  const handleToggleSound = async () => {
    if (!AudioManager.getIsUnlocked()) {
      await playTrack(currentTrack);
      return;
    }

    if (soundActive) {
      AudioManager.pause();
    } else {
      AudioManager.resume();
    }
  };

  const handleVolumeChange = (newVolume) => {
    AudioManager.setVolume(newVolume);
  };

  const handleSelectTrack = async (track) => {
    setShowMusicSelector(false);
    if (track.id === currentTrack?.id && soundActive) return;
    await playTrack(track);
  };

  const handleSend = async () => {
    if (!input.trim() || cooldown > 0 || sending) return;

    setSending(true);
    const content = input.trim().slice(0, MAX_WHISPER_LENGTH);

    const { error } = await supabase
      .from('garden_whispers')
      .insert({
        content,
        alias,
        expires_at: new Date(Date.now() + MESSAGE_LIFETIME_MS).toISOString()
      });

    if (!error) {
      setInput('');
      setCooldown(COOLDOWN_SECONDS);
    }
    setSending(false);
  };

  if (!entered) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: `${C.bg} radial-gradient(ellipse at center bottom, rgba(16,185,129,0.08) 0%, transparent 60%)`
      }}>
        <Glass style={{
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          padding: '40px 28px',
          background: 'rgba(0,0,0,0.4)'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(52,211,153,0.05) 100%)',
            border: '1px solid rgba(52,211,153,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'breathe 4s ease-in-out infinite'
          }}>
            <Leaf size={32} color={C.emeraldLight} />
          </div>

          <h2 style={{
            margin: '0 0 8px',
            fontSize: 26,
            fontWeight: 300,
            color: C.text,
            letterSpacing: '-0.02em'
          }}>
            The Garden
          </h2>

          <p style={{
            margin: '0 0 24px',
            color: C.muted,
            fontSize: 14,
            lineHeight: 1.6,
            fontWeight: 300
          }}>
            A living space for fleeting thoughts.<br />
            Whispers rise, then fade away.
          </p>

          <div style={{
            padding: '14px 18px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: 12,
            marginBottom: 24,
            border: '1px solid rgba(16,185,129,0.1)'
          }}>
            <p style={{
              margin: 0,
              fontSize: 13,
              color: C.muted
            }}>
              You will be known as
            </p>
            <p style={{
              margin: '4px 0 0',
              fontSize: 18,
              color: C.emeraldLight,
              fontStyle: 'italic',
              fontWeight: 400
            }}>
              {alias}
            </p>
          </div>

          <Btn
            gold
            onClick={handleEnter}
            size="lg"
            style={{ width: '100%', fontSize: 15 }}
          >
            Enter Garden
          </Btn>

          <p style={{
            margin: '16px 0 0',
            fontSize: 11,
            color: C.muted,
            opacity: 0.7
          }}>
            Ambient sound will play
          </p>
        </Glass>

        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      background: `${C.bg} radial-gradient(ellipse at center bottom, rgba(16,185,129,0.06) 0%, transparent 50%)`
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <PresenceIndicator count={presenceCount} />

      <SoundControls
        active={soundActive}
        onToggle={handleToggleSound}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onMusicSelect={() => setShowMusicSelector(true)}
        currentTrack={currentTrack}
      />

      <MusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        currentTrack={currentTrack}
        onSelectTrack={handleSelectTrack}
        soundEnabled={soundActive}
        customTracks={customTracks}
        onUploadClick={() => setShowMusicUploader(true)}
      />

      <MusicUploader
        isOpen={showMusicUploader}
        onClose={() => setShowMusicUploader(false)}
        user={user}
        onUploadComplete={(track) => {
          setCustomTracks(prev => [...prev, track]);
          toast.success('Track uploaded successfully!');
        }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        paddingTop: 'calc(130px + env(safe-area-inset-top))',
        paddingBottom: 160,
        overflow: 'hidden'
      }}>
        {whispers.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: C.muted,
            opacity: 0.6
          }}>
            <Leaf size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 300 }}>
              The garden is quiet...
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 13, fontStyle: 'italic' }}>
              Release a whisper into the air
            </p>
          </div>
        )}

        {whispers.map(whisper => (
          <FloatingWhisper
            key={whisper.id}
            whisper={whisper}
            onExpire={removeWhisper}
          />
        ))}
      </div>

      <WhisperInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        cooldown={cooldown}
        maxLength={MAX_WHISPER_LENGTH}
        alias={alias}
        disabled={sending}
      />
    </div>
  );
};
