class AudioManagerSingleton {
  private static instance: AudioManagerSingleton;
  private audio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.5;
  private isUnlocked: boolean = false;
  private listeners: Set<(state: AudioState) => void> = new Set();

  private constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  static getInstance(): AudioManagerSingleton {
    if (!AudioManagerSingleton.instance) {
      AudioManagerSingleton.instance = new AudioManagerSingleton();
    }
    return AudioManagerSingleton.instance;
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.audio && this.isPlaying) {
      this.audio.pause();
    } else if (!document.hidden && this.audio && this.isPlaying) {
      this.audio.play().catch(() => {});
    }
  };

  private notifyListeners() {
    const state: AudioState = {
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      volume: this.volume,
      isUnlocked: this.isUnlocked,
    };
    this.listeners.forEach(listener => listener(state));
  }

  subscribe(listener: (state: AudioState) => void): () => void {
    this.listeners.add(listener);
    listener({
      isPlaying: this.isPlaying,
      currentTrackId: this.currentTrackId,
      volume: this.volume,
      isUnlocked: this.isUnlocked,
    });
    return () => this.listeners.delete(listener);
  }

  async play(trackUrl: string, trackId: string): Promise<boolean> {
    if (this.audio && this.currentTrackId === trackId && this.isPlaying) {
      return true;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }

    try {
      this.audio = new Audio(trackUrl);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      await this.audio.play();

      this.currentTrackId = trackId;
      this.isPlaying = true;
      this.isUnlocked = true;
      this.notifyListeners();

      return true;
    } catch (error) {
      console.warn('Audio play failed:', error);
      this.isPlaying = false;
      this.notifyListeners();
      return false;
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.notifyListeners();
    }
  }

  resume() {
    if (this.audio && !this.isPlaying) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.notifyListeners();
      }).catch(() => {
        this.isPlaying = false;
        this.notifyListeners();
      });
    }
  }

  setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notifyListeners();
  }

  getVolume(): number {
    return this.volume;
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsUnlocked(): boolean {
    return this.isUnlocked;
  }

  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.listeners.clear();
    this.isPlaying = false;
    this.currentTrackId = null;
    this.notifyListeners();
  }
}

export interface AudioState {
  isPlaying: boolean;
  currentTrackId: string | null;
  volume: number;
  isUnlocked: boolean;
}

export const AudioManager = AudioManagerSingleton.getInstance();
