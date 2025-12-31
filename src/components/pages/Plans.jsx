import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Leaf, Crown, Check, Image, Video, Music, HardDrive, Zap, Info, Sparkles, AlertCircle } from 'lucide-react';
import { Glass, Btn, Badge } from '../ui/primitives';
import { AudioPreview, VideoPreview, ImagePreview } from '../ui/MediaPreview';
import { SAFE_BOTTOM_PADDING, SAFE_TOP_PADDING, NAV_HEIGHT, NAV_Z_INDEX } from '../layout/Nav';
import { C } from '../../lib/constants';

const CTYInfoCard = () => (
  <Glass style={{ marginBottom: 24, background: 'rgba(204,163,94,0.05)', borderColor: 'rgba(204,163,94,0.15)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: 'rgba(204,163,94,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Sparkles size={20} color={C.accentLight} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: C.text }}>
          Get Free CTY Daily
        </h4>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>
          CTY is an internal utility credit for Sanctra. You receive free CTY daily and can use it to tip creators, unlock downloads, and access future features.
        </p>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <AlertCircle size={14} color="#fca5a5" />
            <span style={{ fontSize: 12, color: '#fca5a5', fontWeight: 500 }}>Important Disclaimer</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
            CTY is an internal utility token. It has no cash value and cannot be withdrawn, traded, or converted to real currency.
          </p>
        </div>
      </div>
    </div>
  </Glass>
);

const PREVIEW_IMAGES = [
  { id: '1', url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Abstract Flow' },
  { id: '2', url: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Nature Calm' }
];

const PREVIEW_VIDEOS = [
  { id: 'v1', thumbnail: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Peaceful Motion' }
];

const PREVIEW_SOUNDS = [
  { id: 's1', title: 'Gentle Wind' },
  { id: 's2', title: 'Forest Calm' },
  { id: 's3', title: 'Ocean Waves' }
];

const PLAN_DETAILS = {
  free: {
    images: { quality: 'View only', limit: '0 uploads' },
    videos: { quality: 'Preview only', limit: '0 uploads' },
    sounds: { quality: 'Listen only', limit: 'No downloads' },
    storage: '0 MB',
    cty: '5 free/day'
  },
  personal: {
    images: { quality: 'Standard quality', limit: '5/month' },
    videos: { quality: 'SD (480p)', limit: '3/month, 10s max' },
    sounds: { quality: 'Full access', limit: '3 downloads/month' },
    storage: '100 MB',
    cty: '25 free/day'
  },
  creator: {
    images: { quality: 'High quality', limit: '20/month' },
    videos: { quality: 'HD (1080p)', limit: '10/month, 30s max' },
    sounds: { quality: 'Lossless', limit: 'Unlimited' },
    storage: '2 GB',
    cty: '100 free/day'
  }
};

const TierRow = ({ icon: Icon, label, value, highlight }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${C.border}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={16} color={highlight ? C.accentLight : C.emeraldLight} />
      <span style={{ fontSize: 13, color: C.textSecondary }}>{label}</span>
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: highlight ? C.accentLight : C.text }}>{value}</span>
  </div>
);

export const PlansPage = ({ onBack, currentPlan = 'free' }) => {
  const [activeSound, setActiveSound] = useState(null);
  const [previewTab, setPreviewTab] = useState('images');

  const handleSoundPlay = (soundId, isPlaying) => {
    if (isPlaying) {
      setActiveSound(soundId);
    } else if (activeSound === soundId) {
      setActiveSound(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Leaf,
      color: C.muted,
      price: 0,
      features: ['Text posts', 'Preview media', 'View others\' content', 'Get 5 free CTY daily'],
      subtitle: 'Start your journey'
    },
    {
      id: 'personal',
      name: 'Personal',
      icon: Leaf,
      color: C.emeraldLight,
      price: 4.99,
      features: ['Upload images (5/mo)', 'Share short videos (10s)', 'Download sounds (3/mo)', 'Get 25 free CTY daily'],
      subtitle: 'Express yourself'
    },
    {
      id: 'creator',
      name: 'Creator',
      icon: Crown,
      color: C.accentLight,
      price: 14.99,
      features: ['HD media uploads (20/mo)', 'Extended videos (30s)', 'Unlimited sound access', 'Get 100 free CTY daily'],
      subtitle: 'Share your craft',
      popular: true
    }
  ];

  return (
    <div style={{
      paddingBottom: SAFE_BOTTOM_PADDING,
      paddingTop: SAFE_TOP_PADDING,
      paddingLeft: 16,
      paddingRight: 16,
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
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
          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 300, color: C.text }}>Plans & Access</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>Preview what matters to you</p>
          </div>
        </div>

        <CTYInfoCard />

        <Glass style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              { id: 'images', label: 'Images', icon: Image },
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'sounds', label: 'Sounds', icon: Music }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPreviewTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  minHeight: 48,
                  background: previewTab === tab.id ? C.gradient : 'transparent',
                  border: `1px solid ${previewTab === tab.id ? C.borderLight : C.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  color: previewTab === tab.id ? C.emeraldLight : C.muted,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
              >
                <tab.icon size={18} />
                <span style={{ fontSize: 11, fontWeight: 500 }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {previewTab === 'images' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PREVIEW_IMAGES.map(img => (
                <ImagePreview
                  key={img.id}
                  src={img.url}
                  title={img.title}
                  isLocked={false}
                />
              ))}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted, textAlign: 'center' }}>
                Tap to expand. Upgrade to download.
              </p>
            </div>
          )}

          {previewTab === 'videos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PREVIEW_VIDEOS.map(vid => (
                <VideoPreview
                  key={vid.id}
                  thumbnail={vid.thumbnail}
                  title={vid.title}
                  isLocked={currentPlan === 'free'}
                />
              ))}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted, textAlign: 'center' }}>
                {currentPlan === 'free' ? 'Video playback available with Personal plan' : '8s preview. Muted by default.'}
              </p>
            </div>
          )}

          {previewTab === 'sounds' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PREVIEW_SOUNDS.map((sound, idx) => (
                <AudioPreview
                  key={sound.id}
                  title={sound.title}
                  isLocked={currentPlan === 'free' && idx > 0}
                  onPlayStateChange={(playing) => handleSoundPlay(sound.id, playing)}
                />
              ))}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted, textAlign: 'center' }}>
                25s preview. Auto-stops on tab change.
              </p>
            </div>
          )}
        </Glass>

        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
          Plan Comparison
        </h3>

        <Glass style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>FREE</span>
            </div>
            <div style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.emeraldLight }}>PERSONAL</span>
            </div>
            <div style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.accentLight }}>CREATOR</span>
            </div>
          </div>
          {[
            { label: 'Images', values: ['View', '5/mo', '20/mo'] },
            { label: 'Videos', values: ['Preview', '10s', '30s HD'] },
            { label: 'Sounds', values: ['Listen', '3 DL/mo', 'Unlimited'] },
            { label: 'Storage', values: ['-', '100MB', '2GB'] },
            { label: 'CTY/day', values: ['5', '25', '100'] }
          ].map((row, idx) => (
            <div key={idx} style={{ display: 'flex', padding: '10px 0', borderBottom: idx < 4 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: 70, fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center' }}>{row.label}</div>
              {row.values.map((val, vidx) => (
                <div key={vidx} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: vidx === 2 ? C.accentLight : vidx === 1 ? C.emeraldLight : C.textSecondary }}>
                  {val}
                </div>
              ))}
            </div>
          ))}
        </Glass>

        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
          Choose Your Plan
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
          {plans.map(plan => (
            <Glass
              key={plan.id}
              style={{
                padding: 20,
                background: plan.popular ? C.gradientAccent : C.glass,
                border: `1px solid ${plan.popular ? 'rgba(204,163,94,0.25)' : currentPlan === plan.id ? 'rgba(16,185,129,0.3)' : C.border}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: plan.popular ? C.gradientAccent : C.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <plan.icon size={22} color={plan.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text }}>{plan.name}</h3>
                    {plan.popular && <Badge variant="gold">Popular</Badge>}
                    {currentPlan === plan.id && <Badge variant="emerald">Current</Badge>}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: C.muted }}>
                    {plan.price === 0 ? 'Free forever' : `$${plan.price}/month`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check size={14} color={plan.color} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.textSecondary }}>{f}</span>
                  </div>
                ))}
              </div>
              <Btn
                gold={plan.popular}
                ghost={!plan.popular && currentPlan !== plan.id}
                disabled={currentPlan === plan.id}
                style={{ width: '100%', minHeight: 48 }}
              >
                {currentPlan === plan.id ? 'Active' : plan.price === 0 ? 'Get Started' : 'Upgrade'}
              </Btn>
            </Glass>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, fontStyle: 'italic', paddingBottom: 16, lineHeight: 1.6 }}>
          Try the previews above to see what each plan offers. No pressure, no rush. Upgrade when it feels right.
        </p>
      </div>
    </div>
  );
};
