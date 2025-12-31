import React from 'react';
import { Bell, Menu, Leaf, Sparkles } from 'lucide-react';
import { C } from '../../lib/constants';
import { NAV_Z_INDEX } from './Nav';

export const Header = ({ user, onMenuClick, onNotifications, onPlansClick, unread }) => (
  <header style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: NAV_Z_INDEX,
    padding: '12px 16px',
    paddingTop: 'calc(12px + env(safe-area-inset-top))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(5,8,7,0.95)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderBottom: `1px solid ${C.border}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onMenuClick}
        style={{
          padding: 10,
          minWidth: 44,
          minHeight: 44,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          cursor: 'pointer',
          color: C.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <Menu size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: C.gradient,
          border: '1px solid rgba(52,211,153,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Leaf size={18} color={C.emeraldLight} />
        </div>
        <span style={{ fontWeight: 300, letterSpacing: 1.5, color: C.text, fontSize: '16px' }}>Sanctra</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onPlansClick}
        style={{
          padding: '8px 14px',
          minHeight: 44,
          borderRadius: 12,
          background: C.gradientAccent,
          border: '1px solid rgba(204,163,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          transition: 'all 0.2s ease'
        }}
      >
        <Sparkles size={14} color={C.accentLight} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.accentLight }}>{user?.cty_balance || 0}</span>
      </button>
      <button
        onClick={onNotifications}
        style={{
          position: 'relative',
          padding: 10,
          minWidth: 44,
          minHeight: 44,
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          cursor: 'pointer',
          color: C.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation'
        }}
      >
        <Bell size={20} />
        {unread > 0 && (
          <div style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700
          }}>
            {unread}
          </div>
        )}
      </button>
    </div>
  </header>
);
