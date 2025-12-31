import React, { useState, useRef } from 'react';
import { X, Check, Play, Sparkles } from 'lucide-react';
import { C, FREE_LIVE_IMAGES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

export const LiveImageSelector = ({ isOpen, onClose, user, currentLiveImageId, onSelect }) => {
  const [selectedId, setSelectedId] = useState(currentLiveImageId);
  const [saving, setSaving] = useState(false);
  const videoRefs = useRef({});

  React.useEffect(() => {
    if (isOpen) {
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.play().catch(() => {});
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = async (liveImage) => {
    setSelectedId(liveImage.id);
    setSaving(true);

    if (user?.id) {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          live_image_id: liveImage.id,
          live_image_video_url: liveImage.videoUrl,
          live_image_fallback_url: liveImage.imageUrl
        })
        .eq('id', user.id);

      if (!error) {
        onSelect?.(liveImage);
      }
    }

    setSaving(false);
    setTimeout(onClose, 500);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom)',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '85vh',
          background: 'rgba(10,15,13,0.98)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: '1px solid rgba(52,211,153,0.15)',
          borderBottom: 'none',
          overflow: 'hidden',
          animation: 'slideUp 0.4s ease-out'
        }}
      >
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(10,15,13,0.98)',
          backdropFilter: 'blur(12px)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(52,211,153,0.2)'
            }}>
              <Sparkles size={24} color={C.emeraldLight} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: C.text }}>
                Live Images
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
                Choose an animated wallpaper
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          padding: '16px 16px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
          overflowY: 'auto',
          maxHeight: 'calc(85vh - 100px)'
        }}>
          {FREE_LIVE_IMAGES.map((liveImage) => {
            const isSelected = selectedId === liveImage.id;

            return (
              <div
                key={liveImage.id}
                onClick={() => handleSelect(liveImage)}
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: saving ? 'wait' : 'pointer',
                  border: `2px solid ${isSelected ? C.emeraldLight : 'rgba(255,255,255,0.1)'}`,
                  background: C.bgCard,
                  transition: 'all 0.3s',
                  boxShadow: isSelected ? `0 0 20px ${C.emeraldLight}40` : 'none',
                  aspectRatio: '16/9'
                }}
              >
                <video
                  ref={(el) => videoRefs.current[liveImage.id] = el}
                  src={liveImage.videoUrl}
                  poster={liveImage.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <img
                  src={liveImage.imageUrl}
                  alt={liveImage.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'none'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isSelected
                    ? 'linear-gradient(to top, rgba(16,185,129,0.4) 0%, transparent 60%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 14,
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h4 style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#fff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                        {liveImage.label}
                      </h4>
                      {isSelected && (
                        <p style={{
                          margin: '4px 0 0',
                          fontSize: 12,
                          color: C.emeraldLight,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 500
                        }}>
                          <Check size={14} />
                          Selected
                        </p>
                      )}
                    </div>
                    {!isSelected && (
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Play size={16} color="#fff" fill="#fff" />
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: C.emerald,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.5)'
                  }}>
                    <Check size={20} color="#fff" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${C.border}`,
          background: 'rgba(0,0,0,0.4)',
          position: 'sticky',
          bottom: 0
        }}>
          <p style={{
            margin: 0,
            fontSize: 12,
            color: C.muted,
            textAlign: 'center',
            opacity: 0.8
          }}>
            Free animated wallpapers for your profile
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
