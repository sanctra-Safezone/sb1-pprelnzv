import React from 'react';
import { Home, Wind, PlusSquare, MessageCircle, User } from 'lucide-react';
import { C } from '../../lib/constants';

export const NAV_Z_INDEX = 90;
export const CONTENT_ACTION_Z_INDEX = 85;

export const Nav = ({ tab, setTab }) => (
  <nav style={{
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: NAV_Z_INDEX,
    padding: '10px 16px',
    paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
    background: 'rgba(5,8,7,0.98)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: `1px solid ${C.border}`
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
      {[
        { id: 'home', icon: Home, label: 'Stream' },
        { id: 'garden', icon: Wind, label: 'Garden' },
        { id: 'create', icon: PlusSquare, special: true },
        { id: 'messages', icon: MessageCircle, label: 'Chat' },
        { id: 'profile', icon: User, label: 'You' }
      ].map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: t.special ? 0 : '8px 12px',
            minWidth: 48,
            minHeight: 48,
            marginTop: t.special ? -28 : 0,
            color: tab === t.id ? C.emeraldLight : 'rgba(255,255,255,0.3)',
            borderRadius: 16,
            transition: 'all 0.3s ease',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {t.special ? (
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: tab === 'create' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : C.glassDark,
              border: tab === 'create' ? 'none' : `1px solid rgba(52,211,153,0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              color: tab === 'create' ? '#fff' : C.text
            }}>
              <t.icon size={24} />
            </div>
          ) : (
            <>
              <t.icon size={22} />
              <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: 0.3 }}>{t.label}</span>
            </>
          )}
        </button>
      ))}
    </div>
  </nav>
);

export const NAV_HEIGHT = 72;
export const NAV_TOTAL_HEIGHT = `calc(${NAV_HEIGHT}px + env(safe-area-inset-bottom))`;
export const SAFE_BOTTOM_PADDING = `calc(${NAV_HEIGHT + 16}px + env(safe-area-inset-bottom))`;
export const HEADER_HEIGHT = 60;
export const SAFE_TOP_PADDING = `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top))`;
