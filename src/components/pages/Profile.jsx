import React, { useState, useEffect, useRef } from 'react';
import { User, Edit3, LogOut, Feather, ChevronLeft, MessageCircle, Bookmark, MoreHorizontal, Flag, X, Image, Music, Video, Palette, PenTool, Info, Play, Pause, Download, DollarSign, Store, Settings, Check, UserPlus, UserMinus, Camera, Loader, Sparkles } from 'lucide-react';
import { Glass, Btn, Input, Avatar } from '../ui/primitives';
import { ProfileSoundPlayer, AudioPlayer, VideoPlayer } from '../ui/MediaPlayers';
import { PostCard } from '../feed/PostCard';
import { SAFE_BOTTOM_PADDING, NAV_HEIGHT, NAV_Z_INDEX } from '../layout/Nav';
import { formatUsername, supabase } from '../../lib/supabase';
import { useFollow, useProfileStats } from '../../lib/hooks';
import { C } from '../../lib/constants';
import { LiveImageSelector } from '../ui/LiveImageSelector';

const CREATOR_TAG_OPTIONS = [
  { id: 'art', label: 'Art', icon: Palette },
  { id: 'sound', label: 'Sound', icon: Music },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'video', label: 'Video', icon: Video }
];

const CTY_LEVELS = [
  { min: 0, max: 99, name: 'Seedling', color: '#6b7280' },
  { min: 100, max: 499, name: 'Sprout', color: '#10b981' },
  { min: 500, max: 1999, name: 'Bloom', color: '#34d399' },
  { min: 2000, max: 9999, name: 'Tree', color: '#cca35e' },
  { min: 10000, max: Infinity, name: 'Forest', color: '#f59e0b' }
];

const getCTYLevel = (balance) => {
  return CTY_LEVELS.find(l => balance >= l.min && balance <= l.max) || CTY_LEVELS[0];
};

const CTYTooltip = ({ balance, onClick, isOwn }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const level = getCTYLevel(balance);

  return (
    <div style={{ position: 'relative', textAlign: 'center', display: 'flex', alignItems: 'center', height: '100%' }}>
      <button
        onClick={isOwn ? onClick : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          textAlign: 'center',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: isOwn ? 'pointer' : 'default',
          WebkitTapHighlightColor: 'transparent',
          borderRadius: 8,
          minWidth: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span style={{ display: 'block', fontSize: 18, fontWeight: 600, color: level.color, lineHeight: 1.2 }}>{balance}</span>
        <span style={{ fontSize: 11, color: C.muted }}>CTY</span>
      </button>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          padding: '12px 16px',
          background: C.glassDark,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
          whiteSpace: 'nowrap',
          zIndex: 100
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: level.color }}>{level.name} Level</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted }}>
            CTY is an internal utility token.
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>
            No cash value. Cannot be withdrawn.
          </p>
          {isOwn && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: C.emeraldLight }}>
              Get CTY
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CreatorTag = ({ tag, active, onClick, disabled }) => {
  const option = CREATOR_TAG_OPTIONS.find(o => o.id === tag);
  if (!option) return null;
  const Icon = option.icon;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 20,
        background: active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : C.border}`,
        cursor: disabled ? 'default' : 'pointer',
        color: active ? C.emeraldLight : C.muted,
        fontSize: 13,
        fontWeight: 500,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Icon size={14} />
      {option.label}
    </button>
  );
};

const GalleryGrid = ({ items, type, onItemClick, isOwn }) => {
  if (items.length === 0) {
    const icons = { image: Image, video: Video, sound: Music };
    const Icon = icons[type] || Image;
    return (
      <Glass style={{ textAlign: 'center', padding: 48 }}>
        <Icon size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p style={{ color: C.muted, fontSize: 14 }}>No {type}s yet.</p>
      </Glass>
    );
  }

  if (type === 'sound') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(item => (
          <SoundItem key={item.id} item={item} onItemClick={onItemClick} isOwn={isOwn} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12
    }}>
      {items.map(item => (
        <GalleryItem key={item.id} item={item} onItemClick={onItemClick} isOwn={isOwn} />
      ))}
    </div>
  );
};

const GalleryItem = ({ item, onItemClick, isOwn }) => {
  const isVideo = item.type === 'video';

  return (
    <button
      onClick={() => onItemClick(item)}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: 16,
        overflow: 'hidden',
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        cursor: 'pointer',
        padding: 0,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <img
        src={item.thumbnail_url || item.media_url}
        alt={item.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'
      }} />
      {isVideo && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Play size={18} color="#fff" fill="#fff" />
        </div>
      )}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#fff', textAlign: 'left' }}>
          {item.title || 'Untitled'}
        </p>
        {item.for_sale && item.cty_price > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <DollarSign size={12} color={C.accentLight} />
            <span style={{ fontSize: 12, color: C.accentLight }}>{item.cty_price} CTY</span>
          </div>
        )}
      </div>
    </button>
  );
};

const SoundItem = ({ item, onItemClick, isOwn }) => {
  const [playing, setPlaying] = useState(false);

  return (
    <Glass style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => setPlaying(!playing)}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: C.gradient,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {playing ? <Pause size={20} color={C.emeraldLight} /> : <Play size={20} color={C.emeraldLight} fill={C.emeraldLight} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || 'Untitled'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
            {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        {item.for_sale && item.cty_price > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            background: 'rgba(204,163,94,0.1)',
            borderRadius: 8,
            border: '1px solid rgba(204,163,94,0.2)'
          }}>
            <DollarSign size={12} color={C.accentLight} />
            <span style={{ fontSize: 12, color: C.accentLight }}>{item.cty_price}</span>
          </div>
        )}
        {isOwn && (
          <button
            onClick={() => onItemClick(item)}
            style={{
              padding: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: C.muted
            }}
          >
            <Download size={18} />
          </button>
        )}
      </div>
    </Glass>
  );
};

const GalleryPreviewModal = ({ item, onClose, isOwn, onDownload }) => {
  if (!item) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 500,
        maxHeight: '80vh',
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: 'hidden'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'rgba(0,0,0,0.6)',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {item.type === 'video' ? (
          <video
            src={item.media_url}
            controls
            autoPlay
            muted
            loop
            style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', background: '#000' }}
          />
        ) : (
          <img
            src={item.media_url}
            alt={item.title}
            style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain' }}
          />
        )}

        <div style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 500, color: C.text }}>
            {item.title || 'Untitled'}
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.muted }}>
            Created {new Date(item.created_at).toLocaleDateString()}
          </p>

          {item.for_sale && item.cty_price > 0 ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <Btn gold style={{ flex: 1, minHeight: 48 }}>
                <DollarSign size={16} />
                Purchase for {item.cty_price} CTY
              </Btn>
            </div>
          ) : isOwn ? (
            <Btn ghost onClick={() => onDownload(item)} style={{ width: '100%', minHeight: 48 }}>
              <Download size={16} />
              Download
            </Btn>
          ) : (
            <p style={{ margin: 0, fontSize: 13, color: C.muted, textAlign: 'center' }}>
              Showcase only
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ onClose, onSubmit }) => {
  const [category, setCategory] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'harassment', label: 'Harassment' },
    { id: 'spam', label: 'Spam' },
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'other', label: 'Other' }
  ];

  const handleSubmit = () => {
    if (!category) return;
    onSubmit(category);
    setSubmitted(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 400,
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 24,
        backdropFilter: 'blur(24px)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.muted,
            padding: 8
          }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Flag size={24} color={C.emeraldLight} />
            </div>
            <p style={{ margin: 0, fontSize: 16, color: C.text, fontWeight: 500 }}>Report Submitted</p>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: C.muted }}>
              We will review this profile and take appropriate action.
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 500, color: C.text }}>
              Report User
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: C.muted }}>
              Select a reason for reporting
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: '14px 16px',
                    background: category === cat.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${category === cat.id ? 'rgba(16,185,129,0.3)' : C.border}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: category === cat.id ? C.emeraldLight : C.text,
                    fontSize: 14,
                    fontWeight: 400
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!category}
              style={{
                width: '100%',
                marginTop: 20,
                padding: '14px',
                background: category ? 'linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(6,95,70,0.6) 100%)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${category ? 'rgba(16,185,129,0.25)' : C.border}`,
                borderRadius: 12,
                cursor: category ? 'pointer' : 'not-allowed',
                color: category ? C.text : C.muted,
                fontSize: 14,
                fontWeight: 500,
                opacity: category ? 1 : 0.5
              }}
            >
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CreatorSettingsModal = ({ profile, onClose, onSave }) => {
  const [storeEnabled, setStoreEnabled] = useState(profile?.store_enabled || false);
  const [tags, setTags] = useState(profile?.creator_tags || []);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter(t => t !== tagId));
    } else if (tags.length < 4) {
      setTags([...tags, tagId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ store_enabled: storeEnabled, creator_tags: tags });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        background: C.glassDark,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 24,
        backdropFilter: 'blur(24px)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: C.muted,
            padding: 8
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 500, color: C.text }}>
          Creator Settings
        </h3>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 12 }}>
            Creator Tags
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CREATOR_TAG_OPTIONS.map(option => (
              <CreatorTag
                key={option.id}
                tag={option.id}
                active={tags.includes(option.id)}
                onClick={() => toggleTag(option.id)}
              />
            ))}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted }}>
            Select up to 4 tags that describe your work
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setStoreEnabled(!storeEnabled)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              background: storeEnabled ? 'rgba(204,163,94,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${storeEnabled ? 'rgba(204,163,94,0.3)' : C.border}`,
              borderRadius: 14,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Store size={20} color={storeEnabled ? C.accentLight : C.muted} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: storeEnabled ? C.accentLight : C.text }}>
                  Enable Store
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>
                  Sell your work for CTY
                </p>
              </div>
            </div>
            <div style={{
              width: 48,
              height: 28,
              borderRadius: 14,
              background: storeEnabled ? C.gradientAccent : 'rgba(255,255,255,0.1)',
              padding: 2,
              transition: 'all 0.2s'
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: '#fff',
                transform: storeEnabled ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform 0.2s'
              }} />
            </div>
          </button>
          {storeEnabled && (
            <p style={{ margin: '12px 0 0', padding: '12px 14px', fontSize: 12, color: C.muted, background: 'rgba(0,0,0,0.2)', borderRadius: 10, lineHeight: 1.6 }}>
              CTY prices: 5-100 per item. CTY cannot be withdrawn or traded. Buyers support you directly within the platform.
            </p>
          )}
        </div>

        <Btn onClick={handleSave} disabled={saving} style={{ width: '100%', minHeight: 48 }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Btn>
      </div>
    </div>
  );
};

export const Profile = ({
  profile,
  isOwn,
  posts,
  savedPosts = [],
  onBack,
  onSave,
  onLogout,
  currentUserId,
  onLike,
  onComment,
  onSavePost,
  onDelete,
  onMessage,
  onPlansClick
}) => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreatorSettings, setShowCreatorSettings] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState(profile?.cover_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showLiveImageSelector, setShowLiveImageSelector] = useState(false);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const { isFollowing, followerCount, followingCount, toggleFollow, loading: followLoading } = useFollow(
    currentUserId,
    !isOwn ? profile?.id : null
  );

  const { followerCount: ownFollowerCount, followingCount: ownFollowingCount } = useProfileStats(
    isOwn ? profile?.id : null
  );

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    setAvatarUrl(profile?.avatar_url || '');
    setCoverUrl(profile?.cover_url || '');
  }, [profile]);

  useEffect(() => {
    if (profile?.id) {
      fetchGalleryItems();
    }
  }, [profile?.id]);

  const fetchGalleryItems = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setGalleryItems(data || []);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Cover image must be less than 10MB');
      return;
    }

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/cover_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      setCoverUrl(publicUrl);
    } catch (err) {
      console.error('Cover upload failed:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleReport = (category) => {
    console.log('User report submitted:', { userId: profile?.id, category });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      display_name: displayName,
      bio: bio.slice(0, 160),
      avatar_url: avatarUrl || null,
      cover_url: coverUrl || null
    });
    setEditing(false);
    setSaving(false);
  };

  const handleCreatorSettingsSave = async (updates) => {
    await onSave(updates);
  };

  const handleDownload = (item) => {
    window.open(item.media_url, '_blank');
  };

  if (!profile) {
    return (
      <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <p style={{ color: C.muted }}>Loading profile...</p>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.user_id === profile.id);
  const imageItems = galleryItems.filter(i => i.type === 'image');
  const soundItems = galleryItems.filter(i => i.type === 'sound');
  const videoItems = galleryItems.filter(i => i.type === 'video');
  const creatorTags = profile.creator_tags || [];
  const level = getCTYLevel(profile.cty_balance || 0);

  const tabs = isOwn
    ? [
        { id: 'journal', label: 'Journal', icon: Feather },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'sounds', label: 'Sounds', icon: Music },
        { id: 'saved', label: 'Saved', icon: Bookmark }
      ]
    : [
        { id: 'journal', label: 'Journal', icon: Feather },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'sounds', label: 'Sounds', icon: Music }
      ];

  return (
    <div style={{ paddingBottom: SAFE_BOTTOM_PADDING, minHeight: '100vh' }}>
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
      {showCreatorSettings && (
        <CreatorSettingsModal
          profile={profile}
          onClose={() => setShowCreatorSettings(false)}
          onSave={handleCreatorSettingsSave}
        />
      )}
      {selectedItem && (
        <GalleryPreviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isOwn={isOwn}
          onDownload={handleDownload}
        />
      )}

      <input
        ref={coverInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleCoverUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
      />

      <div style={{ height: '35vh', minHeight: 240, position: 'relative' }}>
        <div
          onClick={editing && isOwn ? () => coverInputRef.current?.click() : undefined}
          style={{
            width: '100%',
            height: '100%',
            background: (editing ? coverUrl : profile.cover_url) ? `url(${editing ? coverUrl : profile.cover_url}) center/cover` : C.gradient,
            cursor: editing && isOwn ? 'pointer' : 'default'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${C.bg} 0%, rgba(5,8,7,0.4) 50%, rgba(5,8,7,0.1) 100%)`
        }} />
        {editing && isOwn && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '14px 20px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              cursor: uploadingCover ? 'wait' : 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 14,
              fontWeight: 500,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            {uploadingCover ? (
              <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
            ) : (
              <><Camera size={18} /> Change Cover</>
            )}
          </button>
        )}
        {!isOwn && onBack && (
          <>
            <button
              onClick={onBack}
              style={{
                position: 'absolute',
                top: 'calc(16px + env(safe-area-inset-top))',
                left: 16,
                width: 48,
                height: 48,
                minWidth: 48,
                minHeight: 48,
                borderRadius: 14,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${C.border}`,
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <div style={{ position: 'absolute', top: 'calc(16px + env(safe-area-inset-top))', right: 16 }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  borderRadius: 14,
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${C.border}`,
                  cursor: 'pointer',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <MoreHorizontal size={22} />
              </button>
              {showMenu && (
                <>
                  <div
                    onClick={() => setShowMenu(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    zIndex: 11,
                    background: C.glassDark,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 8,
                    minWidth: 160,
                    backdropFilter: 'blur(16px)'
                  }}>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowReportModal(true);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 8,
                        color: '#fca5a5',
                        fontSize: 14,
                        textAlign: 'left'
                      }}
                    >
                      <Flag size={16} />
                      Report User
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
        {profile.profile_sound_url && (
          <div style={{
            position: 'absolute',
            bottom: 80,
            right: 16
          }}>
            <ProfileSoundPlayer src={profile.profile_sound_url} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ padding: '0 20px', marginTop: -70, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div
            onClick={editing && isOwn ? () => avatarInputRef.current?.click() : undefined}
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              overflow: 'hidden',
              border: `4px solid ${C.bg}`,
              boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
              background: C.glassDark,
              flexShrink: 0,
              position: 'relative',
              cursor: editing && isOwn ? 'pointer' : 'default'
            }}
          >
            {(editing ? avatarUrl : profile.avatar_url) ? (
              <img src={editing ? avatarUrl : profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} color={C.muted} />
              </div>
            )}
            {editing && isOwn && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {uploadingAvatar ? (
                  <Loader size={24} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Camera size={24} color="#fff" />
                )}
              </div>
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: 8,
            paddingBottom: 8,
            alignItems: 'stretch'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              minWidth: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{isOwn ? ownFollowerCount : followerCount}</span>
              <span style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Followers</span>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              minWidth: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{isOwn ? ownFollowingCount : followingCount}</span>
              <span style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Following</span>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 12,
              border: `1px solid ${level.color}33`,
              minWidth: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CTYTooltip
                balance={profile.cty_balance || 0}
                onClick={onPlansClick}
                isOwn={isOwn}
              />
            </div>
          </div>
        </div>

        {editing ? (
          <>
            <Glass style={{ marginBottom: 24 }}>
              <Input
                value={displayName}
                onChange={setDisplayName}
                placeholder="Display name"
                style={{ marginBottom: 12 }}
              />
              <div style={{ position: 'relative' }}>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value.slice(0, 160))}
                  placeholder="A calm bio (max 160 chars)..."
                  style={{
                    width: '100%',
                    minHeight: 80,
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: 16,
                    color: C.text,
                    fontSize: 15,
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  fontSize: 11,
                  color: bio.length > 140 ? '#fca5a5' : C.muted
                }}>
                  {bio.length}/160
                </span>
              </div>
            </Glass>
            <div style={{
              position: 'fixed',
              bottom: `calc(${NAV_HEIGHT + 8}px + env(safe-area-inset-bottom))`,
              left: 0,
              right: 0,
              padding: '16px 20px 20px',
              background: 'linear-gradient(to top, rgba(5,8,7,1) 0%, rgba(5,8,7,0.98) 80%, transparent 100%)',
              zIndex: NAV_Z_INDEX + 1
            }}>
              <div style={{ display: 'flex', gap: 12, maxWidth: 560, margin: '0 auto' }}>
                <Btn ghost onClick={() => setEditing(false)} style={{ flex: 1, minHeight: 52, touchAction: 'manipulation' }}>Cancel</Btn>
                <Btn onClick={handleSave} disabled={saving} style={{ flex: 1, minHeight: 52, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', touchAction: 'manipulation' }}>
                  {saving ? 'Saving...' : 'Save'}
                </Btn>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 600, color: C.text }}>
              {profile.display_name || profile.username}
            </h2>
            <p style={{ margin: '0 0 12px', fontSize: 15, color: C.muted }}>{formatUsername(profile.username)}</p>

            {creatorTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {creatorTags.map(tag => (
                  <CreatorTag key={tag} tag={tag} active disabled />
                ))}
              </div>
            )}

            {profile.bio && (
              <div style={{
                margin: '0 0 20px',
                padding: '14px 16px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 14,
                border: `1px solid ${C.border}`
              }}>
                <p style={{
                  margin: 0,
                  color: C.textSecondary,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  fontSize: 15
                }}>
                  {profile.bio}
                </p>
              </div>
            )}

            {isOwn ? (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, position: 'relative', zIndex: 20 }}>
                <Btn ghost onClick={() => setEditing(true)} style={{ flex: 1, minHeight: 52, touchAction: 'manipulation' }}>
                  <Edit3 size={16} /> Edit Profile
                </Btn>
                <Btn ghost onClick={() => setShowLiveImageSelector(true)} style={{ padding: '14px 16px', minWidth: 52, minHeight: 52, touchAction: 'manipulation' }} title="Live Image">
                  <Sparkles size={18} />
                </Btn>
                <Btn ghost onClick={() => setShowCreatorSettings(true)} style={{ padding: '14px 16px', minWidth: 52, minHeight: 52, touchAction: 'manipulation' }}>
                  <Settings size={18} />
                </Btn>
                <Btn ghost onClick={onLogout} style={{ padding: '14px 16px', minWidth: 52, minHeight: 52, touchAction: 'manipulation' }}>
                  <LogOut size={18} />
                </Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <Btn
                  ghost={isFollowing}
                  onClick={toggleFollow}
                  disabled={followLoading}
                  style={{ flex: 1, minHeight: 48 }}
                >
                  {isFollowing ? (
                    <><UserMinus size={16} /> Unfollow</>
                  ) : (
                    <><UserPlus size={16} /> Follow</>
                  )}
                </Btn>
                <Btn gold style={{ padding: '14px 18px', minHeight: 48 }}>
                  <DollarSign size={16} /> Tip
                </Btn>
                {onMessage && (
                  <Btn ghost onClick={onMessage} style={{ padding: '14px 16px', minWidth: 48, minHeight: 48 }}>
                    <MessageCircle size={18} />
                  </Btn>
                )}
              </div>
            )}
          </>
        )}

        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '0 0 auto',
                padding: '10px 16px',
                minHeight: 44,
                background: activeTab === tab.id ? 'rgba(16,185,129,0.15)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(16,185,129,0.3)' : C.border}`,
                borderRadius: 12,
                cursor: 'pointer',
                color: activeTab === tab.id ? C.emeraldLight : C.muted,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                WebkitTapHighlightColor: 'transparent',
                whiteSpace: 'nowrap'
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'journal' && (
          <>
            {userPosts.length === 0 ? (
              <Glass style={{ textAlign: 'center', padding: 48 }}>
                <Feather size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ color: C.muted, fontSize: 14 }}>No posts yet.</p>
              </Glass>
            ) : (
              userPosts.map(p => (
                <PostCard
                  key={p.id}
                  post={p}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onComment={onComment}
                  onUserClick={() => {}}
                  onSave={onSavePost}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'gallery' && (
          <GalleryGrid
            items={[...imageItems, ...videoItems]}
            type="image"
            onItemClick={setSelectedItem}
            isOwn={isOwn}
          />
        )}

        {activeTab === 'sounds' && (
          <GalleryGrid
            items={soundItems}
            type="sound"
            onItemClick={setSelectedItem}
            isOwn={isOwn}
          />
        )}

        {activeTab === 'saved' && isOwn && (
          <>
            {savedPosts.length === 0 ? (
              <Glass style={{ textAlign: 'center', padding: 48 }}>
                <Bookmark size={40} color={C.muted} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ color: C.muted, fontSize: 14 }}>No saved posts yet.</p>
              </Glass>
            ) : (
              savedPosts.map(p => (
                <PostCard
                  key={p.id}
                  post={p}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onComment={onComment}
                  onUserClick={() => {}}
                  onSave={onSavePost}
                />
              ))
            )}
          </>
        )}
      </div>

      <LiveImageSelector
        isOpen={showLiveImageSelector}
        onClose={() => setShowLiveImageSelector(false)}
        user={{ id: profile?.id }}
        currentLiveImageId={profile?.live_image_id}
        onSelect={(liveImage) => {
          onSave?.({
            ...profile,
            live_image_id: liveImage.id,
            live_image_video_url: liveImage.videoUrl,
            live_image_fallback_url: liveImage.imageUrl
          });
        }}
      />
    </div>
  );
};
