import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ImageIcon, Video, Music, X, AlertCircle, Loader, Sparkles, Wand2, Info, Download, CheckCircle } from 'lucide-react';
import { Glass, Btn } from '../ui/primitives';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING, NAV_HEIGHT, NAV_Z_INDEX } from '../layout/Nav';
import { C, PLAN_LIMITS, MEDIA_LIMITS } from '../../lib/constants';
import { supabase } from '../../lib/supabase';

const AI_COSTS = {
  image: 5,
  sound: 8,
  living: 12
};

const UploadProgress = ({ progress }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    zIndex: 10
  }}>
    <Loader size={32} color={C.emeraldLight} style={{ animation: 'spin 1s linear infinite' }} />
    <div style={{ width: '60%', height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        background: C.emeraldLight,
        borderRadius: 2,
        transition: 'width 0.2s'
      }} />
    </div>
    <span style={{ fontSize: 12, color: C.muted }}>{Math.round(progress)}%</span>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: C.emeraldLight },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    info: { bg: 'rgba(204,163,94,0.15)', border: 'rgba(204,163,94,0.3)', text: C.accentLight }
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed',
      top: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '14px 24px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backdropFilter: 'blur(12px)',
      animation: 'slideDown 0.3s ease'
    }}>
      {type === 'success' && <CheckCircle size={18} color={c.text} />}
      {type === 'error' && <AlertCircle size={18} color={c.text} />}
      {type === 'info' && <Sparkles size={18} color={c.text} />}
      <span style={{ fontSize: 14, color: c.text, fontWeight: 500 }}>{message}</span>
    </div>
  );
};

const AIGenerationModal = ({ type, onClose, onGenerate, generating, ctyBalance, cost }) => {
  const [prompt, setPrompt] = useState('');
  const insufficientCty = ctyBalance < cost;

  const titles = {
    image: 'AI Image',
    sound: 'AI Sound',
    living: 'Living Image'
  };

  const placeholders = {
    image: 'A serene forest at dawn with morning mist...',
    sound: 'Gentle rain on a window with distant thunder...',
    living: 'Ocean waves gently rolling onto shore...'
  };

  const descriptions = {
    image: 'Generate a unique image from your description',
    sound: 'Create ambient sounds or music (30s max)',
    living: 'Create a short animated loop image'
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(204,163,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color={C.accentLight} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: C.text }}>{titles[type]}</h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>{descriptions[type]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={generating}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              opacity: generating ? 0.5 : 1
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={placeholders[type]}
            disabled={generating}
            style={{
              width: '100%',
              minHeight: 100,
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 14,
              color: C.text,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none'
            }}
          />

          <div style={{
            margin: '16px 0',
            padding: 12,
            background: 'rgba(204,163,94,0.08)',
            borderRadius: 10,
            border: '1px solid rgba(204,163,94,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.muted }}>Cost</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.accentLight }}>{cost} CTY</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Your balance</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: insufficientCty ? '#fca5a5' : C.emeraldLight }}>
                {ctyBalance} CTY
              </span>
            </div>
          </div>

          {insufficientCty && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <AlertCircle size={14} color="#fca5a5" />
              <span style={{ fontSize: 12, color: '#fca5a5' }}>Insufficient CTY balance</span>
            </div>
          )}

          <div style={{
            padding: '10px 14px',
            background: 'rgba(107,122,122,0.1)',
            borderRadius: 10,
            marginBottom: 16
          }}>
            <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
              Content policy: No copyrighted material, real artists, celebrity likenesses, or explicit content.
            </p>
          </div>

          <Btn
            onClick={() => onGenerate(prompt)}
            disabled={!prompt.trim() || generating || insufficientCty}
            size="lg"
            style={{ width: '100%' }}
          >
            {generating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </span>
            ) : (
              `Generate (${cost} CTY)`
            )}
          </Btn>
        </div>
      </div>
    </div>
  );
};

const AIResultModal = ({ type, result, onClose, onUse, onDownload }) => {
  const titles = {
    image: 'AI Image Generated',
    sound: 'AI Sound Generated',
    living: 'Living Image Generated'
  };

  const qualityBadge = result.quality && result.quality !== 'high' ? (
    result.quality === 'standard' ? 'Standard Mode' : 'Basic Mode'
  ) : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={20} color={C.emeraldLight} />
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500, color: C.text }}>{titles[type]}</h3>
              {qualityBadge && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 500,
                  color: C.muted,
                  background: 'rgba(107,122,122,0.2)',
                  borderRadius: 6
                }}>
                  {qualityBadge}
                </span>
              )}
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

        <div style={{ padding: 20 }}>
          {(type === 'image' || type === 'living') && result.url && (
            <div style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 16,
              border: `1px solid ${C.border}`
            }}>
              <img
                src={result.url}
                alt="Generated"
                style={{ width: '100%', display: 'block' }}
              />
              {qualityBadge && (
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 500,
                  color: '#fff',
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: 6,
                  backdropFilter: 'blur(4px)'
                }}>
                  {qualityBadge}
                </div>
              )}
            </div>
          )}

          {type === 'sound' && result.url && (
            <div style={{
              padding: 20,
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              marginBottom: 16,
              border: `1px solid ${C.border}`
            }}>
              <audio src={result.url} controls style={{ width: '100%' }} />
              {qualityBadge && (
                <p style={{ margin: '8px 0 0', fontSize: 11, color: C.muted, textAlign: 'center' }}>
                  {qualityBadge}
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn
              onClick={onDownload}
              variant="ghost"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={16} />
              Download
            </Btn>
            <Btn
              onClick={onUse}
              style={{ flex: 1 }}
            >
              Use in Post
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaPreview = ({ file, type, onRemove, uploading, uploadProgress, generatedUrl }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (generatedUrl) {
      setPreviewUrl(generatedUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file, generatedUrl]);

  if (!previewUrl) return null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${C.border}`,
      marginTop: 16
    }}>
      {uploading && <UploadProgress progress={uploadProgress} />}
      {type === 'image' && (
        <img
          src={previewUrl}
          alt="Preview"
          style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
        />
      )}
      {type === 'video' && (
        <video
          src={previewUrl}
          controls
          playsInline
          style={{ width: '100%', maxHeight: 300, display: 'block' }}
        />
      )}
      {type === 'audio' && (
        <div style={{ padding: 20, background: C.glassDark }}>
          <audio src={previewUrl} controls style={{ width: '100%' }} />
        </div>
      )}
      {!uploading && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

const MediaUploadButton = ({ icon: Icon, label, sublabel, accept, onChange, disabled, isLimitReached, maxDuration }) => {
  const inputRef = useRef(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <button
        onClick={() => !disabled && inputRef.current?.click()}
        disabled={disabled}
        style={{
          flex: 1,
          padding: 14,
          minHeight: 80,
          background: disabled ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          color: disabled ? C.mutedDark : C.muted,
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <Icon size={22} />
        <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
        {sublabel && <span style={{ fontSize: 9, opacity: 0.7 }}>{sublabel}</span>}
        {maxDuration && !disabled && <span style={{ fontSize: 9, opacity: 0.6 }}>{maxDuration}s max</span>}
      </button>
    </>
  );
};

const AIGenerateButton = ({ icon: Icon, label, cost, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      flex: 1,
      padding: 14,
      minHeight: 72,
      background: disabled ? 'rgba(0,0,0,0.2)' : 'rgba(204,163,94,0.08)',
      border: `1px solid ${disabled ? 'rgba(107,122,122,0.2)' : 'rgba(204,163,94,0.2)'}`,
      borderRadius: 14,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: disabled ? 'rgba(107,122,122,0.5)' : C.accentLight,
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.2s',
      WebkitTapHighlightColor: 'transparent'
    }}
  >
    <Icon size={20} />
    <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 9, opacity: 0.7 }}>{cost} CTY</span>
  </button>
);

export const Create = ({ onBack, onPost, loading, userPlan = 'free', currentUserId }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  const [aiModal, setAiModal] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [ctyBalance, setCtyBalance] = useState(0);

  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  const [remainingPosts, setRemainingPosts] = useState({
    images: limits.images,
    videos: limits.videos,
    audio: limits.audio
  });

  const canUploadImages = remainingPosts.images > 0;
  const canUploadVideos = remainingPosts.videos > 0;
  const canUploadAudio = remainingPosts.audio > 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUserId) return;

      const [remainingRes, profileRes] = await Promise.all([
        supabase.rpc('get_remaining_posts', { p_user_id: currentUserId }),
        supabase.from('user_profiles').select('cty_balance').eq('id', currentUserId).maybeSingle()
      ]);

      if (remainingRes.data) {
        setRemainingPosts({
          images: remainingRes.data.images ?? limits.images,
          videos: remainingRes.data.videos ?? limits.videos,
          audio: remainingRes.data.audio ?? limits.audio
        });
      }

      if (profileRes.data) {
        setCtyBalance(profileRes.data.cty_balance || 0);
      }
    };
    fetchData();
  }, [currentUserId, limits.images, limits.videos, limits.audio]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const validateFile = (file, type) => {
    const mediaLimit = MEDIA_LIMITS[type];
    if (!mediaLimit) return 'Invalid media type';

    if (file.size > mediaLimit.maxSize) {
      const sizeMB = Math.round(mediaLimit.maxSize / (1024 * 1024));
      return `File must be less than ${sizeMB}MB`;
    }

    return null;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, 'image');
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaType('image');
    setGeneratedMediaUrl(null);
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, 'video');
    if (validationError) {
      setError(validationError);
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const maxDuration = limits.maxVideoSeconds || MEDIA_LIMITS.video.maxDuration;
      if (video.duration > maxDuration) {
        setError(`Video must be ${maxDuration} seconds or less. Upgrade for longer videos.`);
        return;
      }
      setError('');
      setMediaFile(file);
      setMediaType('video');
      setGeneratedMediaUrl(null);
    };
    video.onerror = () => {
      setError('Could not read video file');
    };
    video.src = URL.createObjectURL(file);
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file, 'audio');
    if (validationError) {
      setError(validationError);
      return;
    }

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      const maxDuration = limits.maxAudioSeconds || MEDIA_LIMITS.audio.maxDuration;
      if (audio.duration > maxDuration) {
        setError(`Audio must be ${maxDuration} seconds or less. Upgrade for longer audio.`);
        return;
      }
      setError('');
      setMediaFile(file);
      setMediaType('audio');
      setGeneratedMediaUrl(null);
    };
    audio.onerror = () => {
      setError('Could not read audio file');
    };
    audio.src = URL.createObjectURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    setGeneratedMediaUrl(null);
    setError('');
  };

  const handleAIGenerate = async (prompt) => {
    if (!aiModal || !currentUserId) return;

    if (aiModal === 'sound') {
      showToast('AI music is resting. Enjoy the ambient garden sound instead.', 'info');
      setAiModal(null);
      return;
    }

    if (aiModal === 'living') {
      showToast('Living images are resting. Try free live wallpapers in your profile!', 'info');
      setAiModal(null);
      return;
    }

    const cost = AI_COSTS[aiModal];
    if (ctyBalance < cost) {
      showToast('Insufficient CTY balance', 'error');
      return;
    }

    setAiGenerating(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        showToast('Please sign in to generate', 'error');
        setAiGenerating(false);
        return;
      }

      const functionName = 'generate-image';

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt, userId: currentUserId })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (result.resting) {
          const calmMessage = result.error || 'Taking a brief pause. Please try again soon.';
          showToast(calmMessage, 'info');
        } else {
          showToast(result.error || 'Generation paused. Please try again.', 'error');
        }
        setAiGenerating(false);
        return;
      }

      setCtyBalance(prev => prev - cost);

      const qualityLabel = result.quality === 'high' ? '' :
                           result.quality === 'standard' ? 'Standard Quality' : 'Basic Quality';

      setAiResult({
        type: aiModal,
        url: result.url,
        prompt,
        quality: result.quality,
        provider: result.provider
      });
      setAiModal(null);

      if (qualityLabel) {
        showToast(`Using lighter generator for now`, 'info');
      } else {
        showToast('Generation complete!', 'success');
      }

    } catch (err) {
      console.error('AI generation error:', err);
      showToast('Generation taking a brief rest. Please try again.', 'info');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (!aiResult) return;

    setGeneratedMediaUrl(aiResult.url);
    setMediaType(aiResult.type === 'sound' ? 'audio' : 'image');
    setMediaFile(null);
    setAiResult(null);
  };

  const handleDownloadGenerated = () => {
    if (!aiResult?.url) return;

    const link = document.createElement('a');
    link.href = aiResult.url;
    link.download = `sanctra-${aiResult.type}-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await onPost(content, mediaFile, mediaType, generatedMediaUrl);
      if (result && !result.success) {
        setError(result.message || 'Could not create post');
        clearInterval(progressInterval);
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      setContent('');
      setMediaFile(null);
      setMediaType(null);
      setGeneratedMediaUrl(null);
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: SAFE_TOP_PADDING,
      paddingBottom: `calc(${NAV_HEIGHT + 80}px + env(safe-area-inset-bottom))`,
      paddingLeft: 16,
      paddingRight: 16
    }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {aiModal && (
        <AIGenerationModal
          type={aiModal}
          onClose={() => !aiGenerating && setAiModal(null)}
          onGenerate={handleAIGenerate}
          generating={aiGenerating}
          ctyBalance={ctyBalance}
          cost={AI_COSTS[aiModal]}
        />
      )}

      {aiResult && (
        <AIResultModal
          type={aiResult.type}
          result={aiResult}
          onClose={() => setAiResult(null)}
          onUse={handleUseGenerated}
          onDownload={handleDownloadGenerated}
        />
      )}

      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, marginTop: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 10,
              minWidth: 44,
              minHeight: 44,
              cursor: 'pointer',
              color: C.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 300, color: C.text }}>Create</h2>
        </div>

        <Glass>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What is occupying your mind?"
            style={{
              width: '100%',
              minHeight: 120,
              background: 'transparent',
              border: 'none',
              resize: 'none',
              color: C.text,
              fontSize: 17,
              fontWeight: 300,
              lineHeight: 1.8,
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              marginTop: 12
            }}>
              <AlertCircle size={16} color="#fca5a5" />
              <span style={{ fontSize: 13, color: '#fca5a5' }}>{error}</span>
            </div>
          )}

          <MediaPreview
            file={mediaFile}
            type={mediaType}
            onRemove={handleRemoveMedia}
            uploading={uploading}
            uploadProgress={uploadProgress}
            generatedUrl={generatedMediaUrl}
          />
        </Glass>

        <Glass style={{ marginTop: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.text }}>Add Media</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(16,185,129,0.1)', borderRadius: 8 }}>
              <Info size={12} color={C.emeraldLight} />
              <span style={{ fontSize: 11, color: C.emeraldLight }}>
                Daily limit resets at midnight
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <MediaUploadButton
              icon={ImageIcon}
              label={canUploadImages ? 'Image' : (remainingPosts.images === 0 ? 'Limit reached' : 'Image')}
              sublabel={`${remainingPosts.images}/${limits.images} today`}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={!canUploadImages || !!mediaFile || !!generatedMediaUrl || uploading}
              isLimitReached={remainingPosts.images === 0}
            />
            <MediaUploadButton
              icon={Video}
              label={canUploadVideos ? 'Video' : (remainingPosts.videos === 0 ? 'Limit reached' : 'Video')}
              sublabel={`${remainingPosts.videos}/${limits.videos} today`}
              accept=".mp4,.webm,video/mp4,video/webm"
              onChange={handleVideoSelect}
              disabled={!canUploadVideos || !!mediaFile || !!generatedMediaUrl || uploading}
              isLimitReached={remainingPosts.videos === 0}
              maxDuration={limits.maxVideoSeconds}
            />
            <MediaUploadButton
              icon={Music}
              label={canUploadAudio ? 'Audio' : (remainingPosts.audio === 0 ? 'Limit reached' : 'Audio')}
              sublabel={`${remainingPosts.audio}/${limits.audio} today`}
              accept=".mp3,.wav,audio/mpeg,audio/wav"
              onChange={handleAudioSelect}
              disabled={!canUploadAudio || !!mediaFile || !!generatedMediaUrl || uploading}
              isLimitReached={remainingPosts.audio === 0}
              maxDuration={limits.maxAudioSeconds}
            />
          </div>
          {(remainingPosts.images === 0 || remainingPosts.videos === 0 || remainingPosts.audio === 0) && (
            <p style={{ margin: '12px 0 0', fontSize: 12, color: C.accent, textAlign: 'center' }}>
              Upgrade to Personal or Creator for higher daily limits
            </p>
          )}
        </Glass>

        <Glass style={{ marginTop: 16, padding: 20, background: 'rgba(204,163,94,0.03)', borderColor: 'rgba(204,163,94,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(204,163,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} color={C.accentLight} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: C.text }}>AI Generation</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>Create with AI assistance</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              background: 'rgba(204,163,94,0.15)',
              borderRadius: 8,
              border: '1px solid rgba(204,163,94,0.25)'
            }}>
              <Sparkles size={12} color={C.accentLight} />
              <span style={{ fontSize: 10, fontWeight: 600, color: C.accentLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>Preview</span>
            </div>
          </div>

          <div style={{
            padding: '8px 12px',
            background: 'rgba(16,185,129,0.08)',
            borderRadius: 8,
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 12, color: C.muted }}>Your CTY balance</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.emeraldLight }}>{ctyBalance} CTY</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <AIGenerateButton
              icon={Wand2}
              label="AI Image"
              cost={AI_COSTS.image}
              onClick={() => setAiModal('image')}
              disabled={!!mediaFile || !!generatedMediaUrl || uploading}
            />
            <AIGenerateButton
              icon={Music}
              label="AI Sound"
              cost={AI_COSTS.sound}
              onClick={() => showToast('AI music is resting. Enjoy the ambient garden sound instead.', 'info')}
              disabled={true}
            />
            <AIGenerateButton
              icon={Video}
              label="Living Image"
              cost={AI_COSTS.living}
              onClick={() => showToast('Living images are resting. Try free live wallpapers in your profile!', 'info')}
              disabled={true}
            />
          </div>
        </Glass>
      </div>

      <div style={{
        position: 'fixed',
        bottom: `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
        left: 0,
        right: 0,
        padding: '16px 16px 12px',
        background: 'linear-gradient(to top, rgba(5,8,7,1) 0%, rgba(5,8,7,0.98) 70%, transparent 100%)',
        zIndex: NAV_Z_INDEX + 1
      }}>
        <div style={{ maxWidth: 528, margin: '0 auto' }}>
          <Btn
            onClick={handleSubmit}
            disabled={!content.trim() || loading || uploading}
            size="lg"
            style={{ width: '100%', boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', minHeight: 52 }}
          >
            {uploading ? 'Uploading...' : loading ? 'Sharing...' : 'Share to Stream'}
          </Btn>
        </div>
      </div>
    </div>
  );
};
