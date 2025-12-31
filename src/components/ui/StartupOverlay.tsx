import React, { useState } from 'react';
import { Leaf, Sparkles } from 'lucide-react';
import { C } from '../../lib/constants';

interface StartupOverlayProps {
  onEnter: () => void;
}

export const StartupOverlay: React.FC<StartupOverlayProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEnter = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onEnter();
    }, 600);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f2015 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isAnimating ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.6s ease-out',
        }}
      >
        <div
          style={{
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              background: `radial-gradient(circle, ${C.emeraldLight}40 0%, transparent 70%)`,
              filter: 'blur(20px)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <Leaf size={80} color={C.emeraldLight} strokeWidth={1.5} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#fff',
              marginBottom: '12px',
              letterSpacing: '0.02em',
            }}
          >
            Welcome to Sanctra
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: C.muted,
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Your creative sanctuary awaits. Click below to enter and experience the full ambiance.
          </p>
        </div>

        <button
          onClick={handleEnter}
          style={{
            padding: '16px 48px',
            background: `linear-gradient(135deg, ${C.emeraldLight} 0%, ${C.emerald} 100%)`,
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: `0 4px 16px ${C.emeraldLight}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${C.emeraldLight}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 16px ${C.emeraldLight}40`;
          }}
        >
          <Sparkles size={20} />
          Enter Sanctra
        </button>

        <p
          style={{
            fontSize: '12px',
            color: C.muted,
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          Interact to enable audio and full experience
        </p>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};
