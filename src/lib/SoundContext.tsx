import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SoundContextValue {
  enabled: boolean;
  volume: number;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
  changeVolume: (v: number) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEYS = {
  ENABLED: 'sanctra_sound_enabled',
  VOLUME: 'sanctra_sound_volume',
};

function getStoredEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEYS.ENABLED) !== 'false';
}

function getStoredVolume(): number {
  if (typeof window === 'undefined') return 0.4;
  const stored = localStorage.getItem(STORAGE_KEYS.VOLUME);
  return stored ? Number(stored) : 0.4;
}

interface SoundProviderProps {
  children: ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [enabled, setEnabledState] = useState(getStoredEnabled);
  const [volume, setVolumeState] = useState(getStoredVolume);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.ENABLED, next.toString());
      return next;
    });
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEYS.ENABLED, value.toString());
    setEnabledState(value);
  }, []);

  const changeVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    localStorage.setItem(STORAGE_KEYS.VOLUME, clamped.toString());
    setVolumeState(clamped);
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, volume, toggle, setEnabled, changeVolume }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = (): SoundContextValue => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const AMBIENT_SOURCES = {
  high: '/audio/hidden-garden.mp3',
  medium: '/audio/hidden-garden.mp3',
  low: '/audio/hidden-garden.mp3',
};

export function getAmbientSource(plan?: string): string {
  if (plan === 'creator') return AMBIENT_SOURCES.high;
  if (plan === 'personal') return AMBIENT_SOURCES.medium;
  return AMBIENT_SOURCES.low;
}
