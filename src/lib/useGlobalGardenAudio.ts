import { useRef, useState } from "react";

export function useGlobalGardenAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const unlock = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setUnlocked(true);
    } catch {
      // browser still blocked
    }
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  return { audioRef, unlocked, unlock, toggle };
}
