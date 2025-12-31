export async function fadeInAudio(
  audio: HTMLAudioElement,
  target = 0.4,
  duration = 2000
): Promise<void> {
  audio.volume = 0;
  audio.muted = false;
  await audio.play();

  const steps = 20;
  const stepTime = duration / steps;
  let i = 0;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      i++;
      audio.volume = Math.min(target, (target / steps) * i);
      if (i >= steps) {
        clearInterval(interval);
        resolve();
      }
    }, stepTime);
  });
}

export function fadeOutAudio(
  audio: HTMLAudioElement,
  duration = 1000
): Promise<void> {
  const startVolume = audio.volume;
  const steps = 20;
  const stepTime = duration / steps;
  let i = 0;

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      i++;
      audio.volume = Math.max(0, startVolume - (startVolume / steps) * i);
      if (i >= steps) {
        clearInterval(interval);
        audio.pause();
        resolve();
      }
    }, stepTime);
  });
}

export function setAudioVolume(audio: HTMLAudioElement, volume: number): void {
  audio.volume = Math.max(0, Math.min(1, volume));
}
