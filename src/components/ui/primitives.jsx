import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { C } from '../../lib/constants';

export const Avatar = ({ src, size = 44, onClick }) => (
  <div
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: C.glassDark,
      flexShrink: 0,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease'
    }}
  >
    {src ? (
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.gradient }}>
        <User size={size/2.5} color={C.muted} />
      </div>
    )}
  </div>
);

export const Btn = ({ children, gold, ghost, onClick, disabled, style = {}, size = 'md' }) => {
  const sizes = {
    sm: { padding: '10px 18px', fontSize: '13px', minHeight: 44 },
    md: { padding: '14px 24px', fontSize: '14px', minHeight: 48 },
    lg: { padding: '18px 32px', fontSize: '15px', minHeight: 52 }
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        borderRadius: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: 'none',
        fontWeight: 500,
        letterSpacing: '0.3px',
        opacity: disabled ? 0.4 : 1,
        background: gold ? C.gradientAccent : ghost ? 'transparent' : 'linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(6,95,70,0.6) 100%)',
        color: gold ? C.accentLight : C.text,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: gold ? 'rgba(204,163,94,0.3)' : ghost ? C.border : 'rgba(16,185,129,0.25)',
        transition: 'all 0.3s ease',
        boxShadow: gold || ghost ? 'none' : '0 4px 24px rgba(16,185,129,0.15)',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export const Glass = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: C.glass,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: `1px solid ${C.border}`,
      borderRadius: '20px',
      padding: '24px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.3s ease',
      ...style
    }}
  >
    {children}
  </div>
);

export const Input = ({ value, onChange, placeholder, style = {}, ...props }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%',
      padding: '16px 20px',
      background: 'rgba(0,0,0,0.4)',
      border: `1px solid ${C.border}`,
      borderRadius: '14px',
      color: C.text,
      fontSize: '15px',
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      minHeight: 48,
      ...style
    }}
    {...props}
  />
);

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: C.glass, border: C.border, color: C.text },
    gold: { bg: 'rgba(204,163,94,0.15)', border: 'rgba(204,163,94,0.3)', color: C.accentLight },
    emerald: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: C.emeraldLight },
    danger: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', color: '#fca5a5' }
  };
  const v = variants[variant];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      background: v.bg,
      border: `1px solid ${v.border}`,
      color: v.color,
      fontSize: '12px',
      fontWeight: 500,
      letterSpacing: '0.3px'
    }}>
      {children}
    </span>
  );
};

export const ComingSoonBadge = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    background: 'rgba(204,163,94,0.1)',
    border: '1px solid rgba(204,163,94,0.2)',
    borderRadius: 12,
    marginTop: 12
  }}>
    <Sparkles size={14} color={C.accentLight} />
    <span style={{ fontSize: 12, color: C.accentLight }}>Coming soon</span>
  </div>
);
