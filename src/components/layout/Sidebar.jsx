import React from 'react';
import { User, PlusSquare, MessageCircle, Bell, Wind, Shield, HelpCircle, LogOut, X, ChevronDown, Sparkles, Settings, FileText, Scale, Search } from 'lucide-react';
import { Avatar } from '../ui/primitives';
import { formatUsername } from '../../lib/supabase';
import { C } from '../../lib/constants';
import { NAV_Z_INDEX } from './Nav';

const SIDEBAR_OVERLAY_Z = NAV_Z_INDEX + 10;
const SIDEBAR_PANEL_Z = NAV_Z_INDEX + 11;

export const Sidebar = ({ isOpen, onClose, user, onNavigate, onLogout }) => {
  if (!user) return null;

  const menuItems = [
    { section: 'Quick Actions', items: [
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'create', icon: PlusSquare, label: 'Create' },
      { id: 'search', icon: Search, label: 'Search' },
      { id: 'messages', icon: MessageCircle, label: 'Messages' },
      { id: 'notifications', icon: Bell, label: 'Notifications' },
    ]},
    { section: 'SafeZone', items: [
      { id: 'garden', icon: Wind, label: 'Hidden Garden' },
      { id: 'rules', icon: Shield, label: 'Trust & Safety' },
      { id: 'faq', icon: HelpCircle, label: 'FAQ' },
    ]},
    { section: 'Legal', items: [
      { id: 'privacy', icon: FileText, label: 'Privacy Policy' },
      { id: 'terms', icon: Scale, label: 'Terms of Service' },
    ]},
    { section: 'Account', items: [
      { id: 'settings', icon: Settings, label: 'Settings' },
    ]},
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          zIndex: SIDEBAR_OVERLAY_Z,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          touchAction: 'manipulation'
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '85%',
        maxWidth: 320,
        background: 'linear-gradient(180deg, rgba(6,78,59,0.98) 0%, rgba(5,8,7,0.99) 100%)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        zIndex: SIDEBAR_PANEL_Z,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${C.border}`,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div style={{ padding: '24px 20px', paddingTop: 'calc(24px + env(safe-area-inset-top))', borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'calc(20px + env(safe-area-inset-top))',
              right: 16,
              background: 'none',
              border: 'none',
              color: C.muted,
              cursor: 'pointer',
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <X size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <Avatar src={user.avatar_url} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.display_name || user.username}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: C.muted }}>{formatUsername(user.username)}</p>
            </div>
          </div>
          <button
            onClick={() => { onNavigate('plans'); onClose(); }}
            style={{
              width: '100%',
              padding: '14px 18px',
              minHeight: 52,
              background: C.gradientAccent,
              border: '1px solid rgba(204,163,94,0.25)',
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={18} color={C.accentLight} />
              <span style={{ fontSize: 15, fontWeight: 600, color: C.accentLight }}>{user.cty_balance} CTY</span>
            </div>
            <ChevronDown size={18} color={C.accentLight} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', WebkitOverflowScrolling: 'touch' }}>
          {menuItems.map((section, idx) => (
            <div key={idx} style={{ marginBottom: 20 }}>
              <p style={{ margin: '0 0 8px 12px', fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
                {section.section}
              </p>
              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    minHeight: 52,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    color: C.text,
                    fontSize: 15,
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <item.icon size={20} color={C.emeraldLight} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', borderTop: `1px solid ${C.border}` }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '14px 18px',
              minHeight: 52,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              color: '#fca5a5',
              fontSize: 14,
              fontWeight: 500,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </>
  );
};
