export type AudioState = {
  isPlaying: boolean;
  isUnlocked: boolean;
};

class AudioManager {
  private audio: HTMLAudioElement | null = null;
  private unlocked = false;

  async unlock() {
    if (this.unlocked) return;
    const silent = new Audio(
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="
    );
    await silent.play();
    this.unlocked = true;
  }

  async play(url: string) {
    if (!this.unlocked) return false;
    if (this.audio) this.audio.pause();

    this.audio = new Audio(url);
    this.audio.loop = true;
    this.audio.volume = 0.6;
    await this.audio.play();
    return true;
  }

  pause() {
    this.audio?.pause();
  }
}

export const audioManager = new AudioManager();