export type SoundCue = 'spin' | 'result' | 'action' | 'pause' | 'resume' | 'warning' | 'complete';

export interface AudioPreferences {
  enabled: boolean;
  volume: number;
}

const STORAGE_KEY = 'devspin.audio.v1';
const DEFAULT_PREFERENCES: AudioPreferences = { enabled: true, volume: 0.28 };

const frequencies: Record<SoundCue, [number, number]> = {
  spin: [220, 330],
  result: [440, 660],
  action: [330, 392],
  pause: [330, 220],
  resume: [220, 440],
  warning: [520, 520],
  complete: [440, 880],
};

export function loadAudioPreferences(
  storage: Pick<Storage, 'getItem'> = localStorage,
): AudioPreferences {
  try {
    const value = storage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(value) as Partial<AudioPreferences>;
    if (typeof parsed.enabled !== 'boolean' || typeof parsed.volume !== 'number') {
      return DEFAULT_PREFERENCES;
    }
    return { enabled: parsed.enabled, volume: Math.min(1, Math.max(0, parsed.volume)) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveAudioPreferences(
  preferences: AudioPreferences,
  storage: Pick<Storage, 'setItem'> = localStorage,
) {
  storage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export class AudioFeedback {
  private context: AudioContext | null = null;

  play(cue: SoundCue, preferences: AudioPreferences) {
    if (!preferences.enabled || document.visibilityState === 'hidden') return;

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;
    this.context ??= new AudioContextConstructor();
    const [startFrequency, endFrequency] = frequencies[cue];
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = cue === 'warning' ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, preferences.volume), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  }
}
